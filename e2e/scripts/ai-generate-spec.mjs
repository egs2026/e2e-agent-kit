import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (name, fallback = '') => {
  const p = args.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3) : fallback;
};

const storyPath = arg('story');
const outDir = arg('out', 'e2e/specs/p1');
const severity = (arg('severity', 'P1') || 'P1').toUpperCase();
const id = arg('id');

if (!storyPath) {
  console.error('Usage: node e2e/scripts/ai-generate-spec.mjs --story=<file.md> [--out=e2e/specs/p1] [--severity=P1] [--id=P1-999]');
  process.exit(1);
}

const story = await fs.readFile(storyPath, 'utf8');
const lines = story.split(/\r?\n/).map((l) => l.trim());

const title = lines.find((l) => l.startsWith('# '))?.replace(/^#\s+/, '')
  || lines.find((l) => /^title:/i.test(l))?.replace(/^title:\s*/i, '')
  || path.basename(storyPath, path.extname(storyPath)).replace(/[-_]/g, ' ');

const scenario = lines.filter((l) => /^-\s+/.test(l)).map((l) => l.replace(/^-\s+/, ''));

const baseUrlEnv = 'STAGING_URL';
const caseId = id || `${severity}-${Math.floor(Date.now()/1000)}`;

const hasLogin = /login|sign in|authenticate/i.test(story);
const needsDashboard = /dashboard|home/i.test(story);
const hasCreate = /create|submit|save|new item|core/i.test(story);
const invalidFlow = /invalid|error|fail|negative/i.test(story);

const steps = [];
if (hasLogin) {
  steps.push({ action: 'goto', url: '/login' });
  steps.push({ action: 'fill', selector: "[data-testid='login-email']", valueEnv: 'E2E_USER_EMAIL' });
  steps.push({ action: 'fill', selector: "[data-testid='login-password']", valueEnv: invalidFlow ? undefined : 'E2E_USER_PASSWORD', value: invalidFlow ? 'invalid-password' : undefined });
  steps[steps.length - 1] = Object.fromEntries(Object.entries(steps[steps.length - 1]).filter(([,v]) => v !== undefined));
  steps.push({ action: 'click', selector: "[data-testid='login-submit']" });
  steps.push({ action: 'waitForLoadState', state: 'networkidle' });
}

if (needsDashboard && !invalidFlow) {
  steps.push({ action: 'waitForSelector', selector: "[data-testid='dashboard-root']", timeoutMs: 15000 });
}

if (hasCreate && !invalidFlow) {
  steps.push({ action: 'goto', url: '/app/core/new' });
  steps.push({ action: 'fill', selector: "[data-testid='core-name']", value: 'AI generated item' });
  steps.push({ action: 'click', selector: "[data-testid='core-submit']" });
  steps.push({ action: 'waitForLoadState', state: 'networkidle' });
}

if (steps.length === 0) {
  steps.push({ action: 'goto', url: '/login' });
  steps.push({ action: 'waitForLoadState', state: 'networkidle' });
}

steps.push({ action: 'screenshot', name: 'ai-generated-end' });

const assertions = [];
if (invalidFlow) {
  assertions.push({ type: 'urlIncludes', value: '/login' });
  assertions.push({ type: 'visible', selector: "[data-testid='login-error']" });
} else if (hasCreate) {
  assertions.push({ type: 'urlIncludes', value: '/app/core' });
} else if (needsDashboard || hasLogin) {
  assertions.push({ type: 'urlIncludes', value: '/dashboard' });
}

if (assertions.length === 0) {
  assertions.push({ type: 'urlIncludes', value: '/' });
}

const spec = {
  id: caseId,
  title: `AI Generated: ${title}`,
  severity,
  baseUrlEnv,
  generatedFrom: path.basename(storyPath),
  generationNotes: scenario.slice(0, 10),
  steps,
  assertions
};

await fs.mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, `${caseId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.json`);
await fs.writeFile(outPath, JSON.stringify(spec, null, 2));

console.log(`generated_spec=${outPath}`);
console.log('next_step=Review selectors/assertions before production run');
