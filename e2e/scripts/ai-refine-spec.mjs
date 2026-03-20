import fs from 'node:fs/promises';

const args = process.argv.slice(2);
const arg = (name, fallback = '') => {
  const p = args.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3) : fallback;
};

const specPath = arg('spec');
const feedback = arg('feedback');

if (!specPath || !feedback) {
  console.error('Usage: node e2e/scripts/ai-refine-spec.mjs --spec=<path.json> --feedback="..."');
  process.exit(1);
}

const raw = await fs.readFile(specPath, 'utf8');
const spec = JSON.parse(raw);
const fb = feedback.toLowerCase();
const changes = [];

if (fb.includes('increase timeout') || fb.includes('slow') || fb.includes('flaky')) {
  for (const s of spec.steps || []) {
    if (s.action === 'waitForSelector') {
      s.timeoutMs = Math.max(Number(s.timeoutMs || 15000), 30000);
    }
  }
  changes.push('Increased waitForSelector timeout to >=30000ms');
}

if (fb.includes('wait for dashboard') || fb.includes('add wait')) {
  const exists = (spec.steps || []).some((s) => s.action === 'waitForSelector' && String(s.selector || '').includes('dashboard-root'));
  if (!exists) {
    spec.steps.splice(Math.max((spec.steps?.length || 1) - 1, 0), 0, { action: 'waitForSelector', selector: "[data-testid='dashboard-root']", timeoutMs: 15000 });
    changes.push('Added waitForSelector for dashboard-root');
  }
}

if (fb.includes('assert error') || fb.includes('check error')) {
  const exists = (spec.assertions || []).some((a) => a.type === 'visible' && String(a.selector || '').includes('login-error'));
  if (!exists) {
    spec.assertions = spec.assertions || [];
    spec.assertions.push({ type: 'visible', selector: "[data-testid='login-error']" });
    changes.push('Added visible assertion for login-error');
  }
}

if (fb.includes('use css fallback') || fb.includes('fallback selector')) {
  for (const s of spec.steps || []) {
    if (s.action === 'click' && s.selector && !s.fallbackSelectors) {
      s.fallbackSelectors = ['button[type="submit"]', 'button:has-text("Submit")'];
      changes.push(`Added fallbackSelectors for click step: ${s.selector}`);
    }
  }
}

spec.refinedAt = new Date().toISOString();
spec.refinementNotes = [...(spec.refinementNotes || []), feedback, ...changes];

await fs.writeFile(specPath, JSON.stringify(spec, null, 2));
console.log(`refined_spec=${specPath}`);
console.log(`changes=${changes.length ? changes.join('; ') : 'No rule matched feedback; manual update required.'}`);
