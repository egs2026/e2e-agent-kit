# Dashboard Automation

## What is automated
1. **PR E2E Summary Comment**
   - Workflow: `.github/workflows/e2e-agent-kit.yml`
   - Posts/updates a sticky PR comment with CI status and run URL.

2. **Weekly QA Summary Issue**
   - Workflow: `.github/workflows/e2e-weekly-summary.yml`
   - Runs every Monday 02:00 UTC.
   - Creates issue with run counts, success rate, and open `e2e-failure` issue count.

## How to use
- Trigger manually from GitHub Actions using `workflow_dispatch` if needed.
- Weekly issue title format: `[Weekly QA] E2E health summary (YYYY-MM-DD)`.

## Required permissions
- `contents: read`
- `actions: read`
- `issues: write`
- `pull-requests: write` (for PR comment workflow)
