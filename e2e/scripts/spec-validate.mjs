import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const runArg = args.find((a) => a.startsWith('--run-id='));
const runIdsArg = args.find((a) => a.startsWith('--run-ids='));
const projectArg = args.find((a) => a.startsWith('--project='));
const combineLatest = args.includes('--combine-latest');

const root = process.cwd();
const reportRoot = path.join(root, 'reports', 'e2e');
const project = projectArg ? projectArg.split('=')[1] : 'core';
const reqPathByProject = path.join(root, 'spec', `requirements-${project}.json`);
const reqPathFallback = path.join(root, 'spec', 'requirements.json');

async function latestRunId() {
  const dirs = await fs.readdir(reportRoot, { withFileTypes: true });
  const names = dirs.filter((d) => d.isDirectory()).map((d) => d.name).sort().reverse();
  return names[0] || '';
}

async function walkSpecs(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walkSpecs(p));
    else if (e.isFile() && e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

let selectedRunIds = [];
if (runIdsArg) {
  selectedRunIds = runIdsArg.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean);
} else if (combineLatest) {
  const all = (await fs.readdir(reportRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();

  const projectOfRun = (n) => (/^\d{8}T\d{6}Z-/.test(n) ? 'core' : (n.split('-')[0] || 'core'));
  const scoped = all.filter((n) => projectOfRun(n) === project);

  const latestRegression = scoped.find((n) => n.endsWith('-regression'));
  const latestSecurity = scoped.find((n) => n.endsWith('-security'));
  selectedRunIds = [latestRegression, latestSecurity].filter(Boolean);
} else {
  const runId = runArg ? runArg.split('=')[1] : (await latestRunId());
  if (runId) selectedRunIds = [runId];
}

if (selectedRunIds.length === 0) {
  console.error('No run id found.');
  process.exit(1);
}

const runDir = path.join(reportRoot, selectedRunIds[0]);
let selectedReqPath = reqPathByProject;
try {
  await fs.access(selectedReqPath);
} catch {
  selectedReqPath = reqPathFallback;
}
const requirements = JSON.parse(await fs.readFile(selectedReqPath, 'utf8')).requirements || [];

const specFiles = await walkSpecs(path.join(root, 'e2e', 'specs'));
const caseReqMap = new Map();
for (const f of specFiles) {
  try {
    const spec = JSON.parse(await fs.readFile(f, 'utf8'));
    const caseId = spec.id;
    if (!caseId) continue;
    caseReqMap.set(caseId, Array.isArray(spec.requirementIds) ? spec.requirementIds : []);
  } catch {}
}

const runResults = new Map();
for (const rid of selectedRunIds) {
  const dir = path.join(reportRoot, rid);
  let runFiles = [];
  try {
    runFiles = (await fs.readdir(dir)).filter((f) => f.endsWith('.result.json'));
  } catch {
    continue;
  }
  for (const f of runFiles) {
    const j = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8'));
    // If a case appears multiple times, FAIL takes precedence over PASS
    const prev = runResults.get(j.caseId);
    if (!prev) runResults.set(j.caseId, j.status);
    else if (prev === 'PASS' && j.status === 'FAIL') runResults.set(j.caseId, 'FAIL');
  }
}

const byRequirement = requirements.map((r) => {
  const linkedCases = [];
  for (const [caseId, reqIds] of caseReqMap.entries()) {
    if (reqIds.includes(r.id)) linkedCases.push(caseId);
  }

  const executed = linkedCases.filter((c) => runResults.has(c));
  const failed = executed.filter((c) => runResults.get(c) === 'FAIL');
  const passed = executed.filter((c) => runResults.get(c) === 'PASS');

  let status = 'uncovered';
  if (linkedCases.length > 0 && executed.length === 0) status = 'not_executed';
  if (executed.length > 0) status = failed.length > 0 ? 'fail' : 'pass';

  return {
    id: r.id,
    title: r.title,
    priority: r.priority,
    expectation: r.expectation,
    status,
    linkedCases,
    executedCases: executed,
    passedCases: passed,
    failedCases: failed
  };
});

const totals = {
  requirements: byRequirement.length,
  covered: byRequirement.filter((r) => r.linkedCases.length > 0).length,
  uncovered: byRequirement.filter((r) => r.linkedCases.length === 0).length,
  pass: byRequirement.filter((r) => r.status === 'pass').length,
  fail: byRequirement.filter((r) => r.status === 'fail').length,
  notExecuted: byRequirement.filter((r) => r.status === 'not_executed').length
};

const coverageRate = totals.requirements ? Number(((totals.covered / totals.requirements) * 100).toFixed(2)) : 0;
const passRate = totals.covered ? Number(((totals.pass / totals.covered) * 100).toFixed(2)) : 0;

const out = {
  project,
  requirementsSource: selectedReqPath,
  runIds: selectedRunIds,
  generatedAt: new Date().toISOString(),
  totals: { ...totals, coverageRate, passRate },
  requirements: byRequirement
};

const outJson = path.join(runDir, 'spec-validation.json');
const outMd = path.join(runDir, 'spec-validation.md');
await fs.writeFile(outJson, JSON.stringify(out, null, 2));

const rows = byRequirement
  .map((r) => `| ${r.id} | ${r.priority} | ${r.status} | ${r.linkedCases.join(', ') || '-'} |`)
  .join('\n');

const md = `# Spec Validation\n\n- Project: ${project}\n- Requirements Source: ${selectedReqPath}\n- Run IDs: ${selectedRunIds.join(', ')}\n- Requirement Coverage: ${coverageRate}%\n- Requirement Pass Rate (covered): ${passRate}%\n- Covered: ${totals.covered}\n- Uncovered: ${totals.uncovered}\n- Fail: ${totals.fail}\n- Not Executed: ${totals.notExecuted}\n\n| Requirement | Priority | Status | Linked Cases |\n|---|---|---|---|\n${rows}\n`;
await fs.writeFile(outMd, md);

console.log(`spec_validation_json=${outJson}`);
console.log(`spec_validation_md=${outMd}`);
console.log(`coverage_rate=${coverageRate}`);
console.log(`requirement_pass_rate=${passRate}`);
