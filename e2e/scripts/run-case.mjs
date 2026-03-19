import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { chromium } from "playwright";

dotenv.config();

const casePath = process.argv[2];
if (!casePath) {
  console.error("Usage: node e2e/scripts/run-case.mjs <case-json>");
  process.exit(1);
}

const runId = process.env.RUN_ID || new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join("reports", "e2e", runId);
const screenshotDir = path.join(outDir, "screenshots");
const traceDir = path.join(outDir, "traces");
const videoDir = path.join(outDir, "videos");
await fs.mkdir(screenshotDir, { recursive: true });
await fs.mkdir(traceDir, { recursive: true });
await fs.mkdir(videoDir, { recursive: true });

const raw = await fs.readFile(casePath, "utf8");
const spec = JSON.parse(raw);
const caseId = spec.id || path.basename(casePath, ".json");
const startedAt = new Date().toISOString();

const resolveBaseUrl = () => {
  if (spec.baseUrl) return spec.baseUrl;
  if (spec.baseUrlEnv) {
    const v = process.env[spec.baseUrlEnv];
    if (!v) throw new Error(`Missing env: ${spec.baseUrlEnv}`);
    return v;
  }
  throw new Error("spec.baseUrl or spec.baseUrlEnv required");
};

const resolveValue = (step) => {
  if (step.valueEnv) {
    const v = process.env[step.valueEnv];
    if (typeof v === "undefined") throw new Error(`Missing env: ${step.valueEnv}`);
    return v;
  }
  return step.value ?? "";
};

let browser;
let context;
let page;
const logs = [];
let status = "PASS";
let error = null;
let tracePath = null;
let failScreenshotPath = null;
let videoPath = null;

try {
  const baseUrl = resolveBaseUrl();
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    baseURL: baseUrl,
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } }
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  page = await context.newPage();
  page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));

  for (const step of spec.steps || []) {
    switch (step.action) {
      case "goto":
        await page.goto(step.url, { waitUntil: "domcontentloaded" });
        break;
      case "fill":
        await page.fill(step.selector, String(resolveValue(step)));
        break;
      case "click":
        await page.click(step.selector);
        break;
      case "waitForSelector":
        await page.waitForSelector(step.selector, { timeout: step.timeoutMs ?? 15000 });
        break;
      case "waitForLoadState":
        await page.waitForLoadState(step.state ?? "networkidle");
        break;
      case "screenshot": {
        const file = path.join(screenshotDir, `${caseId}-${step.name || "step"}.png`);
        await page.screenshot({ path: file, fullPage: true });
        break;
      }
      default:
        throw new Error(`Unsupported step action: ${step.action}`);
    }
  }

  for (const asrt of spec.assertions || []) {
    switch (asrt.type) {
      case "urlIncludes": {
        const url = page.url();
        if (!url.includes(asrt.value)) throw new Error(`assert urlIncludes failed: ${asrt.value}, got ${url}`);
        break;
      }
      case "visible": {
        const v = await page.isVisible(asrt.selector);
        if (!v) throw new Error(`assert visible failed: ${asrt.selector}`);
        break;
      }
      case "textContains": {
        const text = (await page.textContent(asrt.selector)) || "";
        if (!text.includes(asrt.value)) throw new Error(`assert textContains failed: ${asrt.selector} missing '${asrt.value}'`);
        break;
      }
      default:
        throw new Error(`Unsupported assertion type: ${asrt.type}`);
    }
  }
} catch (e) {
  status = "FAIL";
  error = e instanceof Error ? e.message : String(e);
  if (page) {
    failScreenshotPath = path.join(screenshotDir, `${caseId}-FAIL.png`);
    try {
      await page.screenshot({ path: failScreenshotPath, fullPage: true });
    } catch {}
  }
} finally {
  if (context) {
    tracePath = path.join(traceDir, `${caseId}.zip`);
    try {
      await context.tracing.stop({ path: tracePath });
    } catch {}

    if (page) {
      try {
        const v = page.video();
        if (v) videoPath = await v.path();
      } catch {}
    }

    try {
      await context.close();
    } catch {}
  }
  if (browser) {
    try {
      await browser.close();
    } catch {}
  }
}

const result = {
  caseId,
  title: spec.title,
  severity: spec.severity,
  status,
  startedAt,
  finishedAt: new Date().toISOString(),
  error,
  logs,
  artifacts: {
    tracePath,
    failScreenshotPath,
    videoPath
  },
  casePath
};

await fs.writeFile(path.join(outDir, `${path.basename(casePath)}.result.json`), JSON.stringify(result, null, 2));
console.log(`[run-case] ${status} -> ${casePath}`);
if (status === "FAIL") process.exitCode = 1;
