import fs from "node:fs/promises";
import path from "node:path";

const runId = process.argv[2] || process.env.RUN_ID;
const resultUrl = process.argv[3] || process.env.RESULT_URL || "";
if (!runId) {
  console.error("Usage: node e2e/scripts/build-run-summary.mjs <run-id> [result-url]");
  process.exit(1);
}

const outDir = path.join("reports", "e2e", runId);
const files = (await fs.readdir(outDir)).filter((f) => f.endsWith(".result.json"));

const classify = (err = "") => {
  const e = String(err).toLowerCase();
  if (!e) return "unknown";
  if (e.includes("missing env")) return "config";
  if (e.includes("assert")) return "assertion";
  if (e.includes("timeout") || e.includes("waitforselector")) return "timeout";
  if (e.includes("selector") || e.includes("isvisible") || e.includes("fill(") || e.includes("click(")) return "selector";
  if (e.includes("auth") || e.includes("login") || e.includes("redirect")) return "auth/session";
  return "app/unknown";
};

const ownerHint = (casePath = "") => {
  const p = String(casePath).toLowerCase();
  if (p.includes("/p0/")) return "owner:core-critical";
  if (p.includes("/p1/")) return "owner:core-regression";
  if (p.includes("/p2/")) return "owner:extended";
  return "owner:triage";
};

const rows = [];
for (const file of files) {
  const data = JSON.parse(await fs.readFile(path.join(outDir, file), "utf8"));
  rows.push(data);
}

const total = rows.length;
const passed = rows.filter((r) => r.status === "PASS").length;
const failedRows = rows.filter((r) => r.status === "FAIL");
const failed = failedRows.length;
const passRate = total === 0 ? 0 : Number(((passed / total) * 100).toFixed(2));

const failedCases = failedRows.map((r) => ({
  caseId: r.caseId,
  title: r.title || "",
  severity: r.severity || "",
  casePath: r.casePath || "",
  error: r.error || "",
  classification: classify(r.error),
  ownerHint: ownerHint(r.casePath),
  artifacts: r.artifacts || {}
}));

const summary = {
  runId,
  generatedAt: new Date().toISOString(),
  resultUrl,
  totals: { total, passed, failed, passRate },
  failedCases
};

const summaryJsonPath = path.join(outDir, "run-summary.json");
await fs.writeFile(summaryJsonPath, JSON.stringify(summary, null, 2));

const failedList = failedCases
  .map((f) => `- ${f.caseId} [${f.classification}] (${f.ownerHint}) :: ${f.error || "n/a"}`)
  .join("\n");

const md = `# Run Summary\n\n- Run ID: ${runId}\n- Total: ${total}\n- Passed: ${passed}\n- Failed: ${failed}\n- Pass rate: ${passRate}%\n- Result URL: ${resultUrl || "n/a"}\n\n## Failed Cases\n${failedList || "- none"}\n`;
await fs.writeFile(path.join(outDir, "run-summary.md"), md);

console.log(`summary_json=${summaryJsonPath}`);
console.log(`total_tests=${total}`);
console.log(`passed_tests=${passed}`);
console.log(`failed_tests=${failed}`);
console.log(`pass_rate=${passRate}`);
