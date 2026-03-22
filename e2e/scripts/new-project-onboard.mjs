import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (k, d='') => {
  const a = args.find(x => x.startsWith(`--${k}=`));
  return a ? a.split('=')[1] : d;
};

const key = get('project');
const name = get('name') || key;
const baseUrl = get('base-url', 'https://example.com');

if (!key) {
  console.error('Usage: npm run project:onboard -- --project=<key> --name="Project Name" --base-url=https://app.example.com');
  process.exit(1);
}

const root = process.cwd();
const specDir = path.join(root, 'spec');
const reqPath = path.join(specDir, `requirements-${key}.json`);
const storiesDir = path.join(root, 'e2e', 'stories', key);
const onboardingDoc = path.join(root, 'docs', 'e2e-agent', `ONBOARD_${key.toUpperCase()}.md`);
const projectsCatalogPath = path.join(specDir, 'projects.json');

await fs.mkdir(specDir, { recursive: true });
await fs.mkdir(storiesDir, { recursive: true });

// 1) requirements skeleton
const req = {
  requirements: [
    { id: `${key.toUpperCase()}-AUTH-001`, title: 'Login and authenticated landing', priority: 'P0', expectation: 'Valid login lands on expected page' },
    { id: `${key.toUpperCase()}-FLOW-001`, title: 'Primary business flow works', priority: 'P0', expectation: 'Core user journey completes successfully' },
    { id: `${key.toUpperCase()}-SEC-001`, title: 'Protected routes blocked when unauthenticated', priority: 'P1', expectation: 'Unauthorized access redirected/denied' }
  ]
};

try {
  await fs.access(reqPath);
} catch {
  await fs.writeFile(reqPath, JSON.stringify(req, null, 2));
}

// Update project catalog for friendly naming in report explorer
let catalog = { projects: [] };
try {
  catalog = JSON.parse(await fs.readFile(projectsCatalogPath, 'utf8'));
  if (!Array.isArray(catalog.projects)) catalog.projects = [];
} catch {}
if (!catalog.projects.find((p) => p.key === key)) {
  catalog.projects.push({ key, name, description: `${name} validation flows` });
  await fs.writeFile(projectsCatalogPath, JSON.stringify(catalog, null, 2));
}

// 2) starter story
const storyPath = path.join(storiesDir, 'US-001-primary-flow.md');
try {
  await fs.access(storyPath);
} catch {
  await fs.writeFile(storyPath, `# ${name} primary flow\n\nAs an authenticated user,\nI want to complete the primary journey,\nso that business value is delivered.\n\n## Base URL\n${baseUrl}\n\n## Acceptance Criteria\n- User can login\n- User can navigate to the primary module\n- User can submit required form/action\n- Success signal appears\n`);
}

// 3) onboarding instruction doc
const md = `# Onboarding: ${name} (${key})\n\n## 1) Configure project key\nUse this key for all runs:\n\n\`PROJECT_KEY=${key}\`\n\n## 2) Requirements file\n- ${path.relative(root, reqPath)}\n\n## 3) Create first draft test from story\n\`npm run ai:generate-spec -- --story=e2e/stories/${key}/US-001-primary-flow.md --severity=P1 --id=${key.toUpperCase()}-P1-001\`\n\n## 4) Run project-scoped tests\n\`PROJECT_KEY=${key} npm run regression\`\n\`PROJECT_KEY=${key} npm run security\`\n\n## 5) Validate against requirements\n\`npm run spec:validate:combined -- --project=${key}\`\n\n## 6) Reports explorer\nOpen: https://e2e.egsmyapps.biz.id/reports/\nUse **Project filter** => ${key}\n\n## Notes\n- Base URL target: ${baseUrl}\n- Update selectors/assertions before production usage.\n`;
await fs.mkdir(path.dirname(onboardingDoc), { recursive: true });
await fs.writeFile(onboardingDoc, md);

console.log(`project_key=${key}`);
console.log(`requirements=${reqPath}`);
console.log(`story=${storyPath}`);
console.log(`onboarding_doc=${onboardingDoc}`);
