import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportsRoot = path.join(root, 'reports', 'e2e');
const outDir = path.join(root, 'reports', 'dashboard');

const args = process.argv.slice(2);
const projectArg = args.find((a) => a.startsWith('--project='));
const project = projectArg ? projectArg.split('=')[1] : 'all';

await fs.mkdir(outDir, { recursive: true });

let runs = [];
try {
  runs = (await fs.readdir(reportsRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();
} catch {
  console.error('No reports found.');
  process.exit(1);
}

function projectOfRun(runId) {
  // Legacy run IDs start with timestamp (2026...), treat as core
  if (/^\d{8}T\d{6}Z-/.test(runId)) return 'core';
  const token = (runId.split('-')[0] || 'core').trim();
  return token || 'core';
}

if (project !== 'all') {
  runs = runs.filter((r) => projectOfRun(r) === project);
}

runs = runs.slice(0, 30);

let totalRuns = 0;
let totalCases = 0;
let totalPass = 0;
let totalFail = 0;
const rows = [];

for (const run of runs) {
  const runDir = path.join(reportsRoot, run);
  let files = [];
  try {
    files = (await fs.readdir(runDir)).filter((f) => f.endsWith('.result.json'));
  } catch {
    continue;
  }

  const total = files.length;
  let pass = 0;
  let fail = 0;
  for (const f of files) {
    try {
      const j = JSON.parse(await fs.readFile(path.join(runDir, f), 'utf8'));
      if (j.status === 'PASS') pass++;
      if (j.status === 'FAIL') fail++;
    } catch {}
  }

  totalRuns++;
  totalCases += total;
  totalPass += pass;
  totalFail += fail;

  const rate = total > 0 ? ((pass / total) * 100).toFixed(2) : '0.00';
  rows.push(`| ${run} | ${total} | ${pass} | ${fail} | ${rate}% |`);
}

const overallRate = totalCases > 0 ? ((totalPass / totalCases) * 100).toFixed(2) : '0.00';
const suffix = project === 'all' ? 'all' : project;
const mdPath = path.join(outDir, `latest-${suffix}.md`);
const jsonPath = path.join(outDir, `latest-${suffix}.json`);

const md = `# E2E Dashboard Snapshot (${project})\n\n- Total Runs: ${totalRuns}\n- Total Cases: ${totalCases}\n- Passed: ${totalPass}\n- Failed: ${totalFail}\n- Pass Rate: ${overallRate}%\n\n| Run ID | Total | Pass | Fail | Pass Rate |\n|---|---:|---:|---:|---:|\n${rows.join('\n')}\n`;

const json = {
  project,
  generatedAt: new Date().toISOString(),
  totalRuns,
  totals: {
    cases: totalCases,
    passed: totalPass,
    failed: totalFail,
    passRate: Number(overallRate)
  }
};

await fs.writeFile(mdPath, md);
await fs.writeFile(jsonPath, JSON.stringify(json, null, 2));

console.log(`dashboard_markdown=${mdPath}`);
console.log(`dashboard_json=${jsonPath}`);
