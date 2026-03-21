# E2E Agent Kit (Gemini/Gravity + VPS)

Production-oriented starter package for end-to-end web app testing with a Testsprite-style workflow.

## What you get
- Structured test catalog (P0/P1)
- Real executable JSON test specs (Playwright-based runner)
- Deterministic run scripts (smoke/regression)
- Artifact folders (screenshots/logs/reports)
- Simple report portal (HTTP server) so you can revisit results anytime

## Quick start

```bash
cd e2e-agent-kit
npm install
npm run setup:playwright
npm run bootstrap
cp .env.example .env
# edit .env with STAGING_URL and credentials
npm run smoke
npm run report:serve
```

Then open:
- `http://<your-vps-ip>:8787/`

## Main commands
- `npm run smoke` — run P0 smoke pack
- `npm run regression` — run P0+P1 regression
- `npm run e2e:run` — run by priority (`PRIORITY=High,Medium npm run e2e:run`)
- `npm run ai:generate-spec -- --story=e2e/stories/US-001-login-and-create.md --severity=P1 --id=P1-301` — generate draft JSON spec from user story
- `npm run ai:refine-spec -- --spec=e2e/specs/p1/<file>.json --feedback="increase timeout and add wait for dashboard"` — refine spec from natural language feedback
- `npm run dashboard` — generate consolidated dashboard snapshot from recent runs
- `npm run security` — run security/session baseline test pack
- `npm run mcp:daily-gate` — run daily full gate (endpoints + API smoke + regression + security)
- `npm run prod:status` — evaluate latest readiness and print GO/NO-GO + reasons
- `npm run deploy:frontend` — one-command frontend deploy (uses `dist/` by default)
- `npm run check:endpoints` — verify all public URLs + MCP auth guard
- `npm run report:serve` — serve reports locally on port 8787

## Optional: keep report portal always on (tmux)
```bash
tmux new -s e2e-reports -d 'cd /root/.openclaw/workspace/e2e-agent-kit && npm run report:serve'
```

## Notes
- The current executor uses Playwright + JSON specs in `e2e/specs/p0/*.json`.
- Update selectors to your app's `data-testid` attributes.
- Save auth state in `e2e/state/auth/` for stable repeated runs.
- Keep secrets in `.env` (git-ignored), never in committed files.
- Reports are generated per-run under `reports/e2e/<run-id>/`.
- Video recording is enabled per test case (`reports/e2e/<run-id>/videos/`).
- Step-by-step screenshots are auto-captured by default (`reports/e2e/<run-id>/step-shots/`). Set `RECORD_STEP_SCREENSHOTS=false` to disable.
