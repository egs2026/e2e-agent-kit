# E2E Agent Project Documentation (Master)

Last updated: 2026-03-18 (UTC)

## 1) Project Purpose
Build a VPS-hosted, Gemini/Gravity-compatible E2E testing package with MCP accessibility, repeatable runs, and persistent report access.

## 2) Deliverables Implemented
- `e2e-agent-kit/` project package scaffolded.
- `e2e-agent-kit.tar.gz` archive created.
- Real Playwright-based JSON E2E executor implemented (`e2e/scripts/run-case.mjs`).
- Smoke run executed (platform case PASS, app-specific placeholder cases FAIL until app URL/selectors/env are set).
- Report portal running in `tmux` (`e2e-reports`) at port `8787`.
- MCP local config created (`config/mcporter.json`).
- Project-level MCP manifest created (`e2e-agent-kit/.mcp.json`).
- Token-protected HTTP MCP endpoint implemented and running in `tmux` (`e2e-mcp`).

## 3) Directory Structure
- `docs/e2e-agent/` project docs
- `e2e/specs/p0`, `e2e/specs/p1` test specs
- `e2e/scripts/` run scripts
- `e2e/config/` config placeholders
- `e2e/state/auth/` auth state
- `reports/e2e/` run artifacts
- `mcp/` HTTP MCP runtime scripts

## 4) Key Files
- `README.md`
- `.env.example`
- `package.json`
- `templates/e2e-case.template.md`
- `e2e/scripts/bootstrap.sh`
- `e2e/scripts/run-case.sh`
- `e2e/scripts/run-smoke.sh`
- `e2e/scripts/run-regression.sh`
- `e2e/scripts/summarize.sh`
- `docs/e2e-agent/mission.md`
- `mcp/start-http-mcp.sh`
- `mcp/proxy.mjs`
- `mcp/.gitignore`

## 5) Runtime Services
### 5.1 Reports Portal
- Session: `e2e-reports`
- Command: `npm run report:serve`
- URL: `http://<vps-ip>:8787/`

### 5.2 HTTP MCP Endpoint
- Session: `e2e-mcp`
- Public endpoint: `http://<vps-ip>:8811/mcp`
- Auth: `Authorization: Bearer <token>`
- Upstream bridge: supergateway on localhost:8810
- Health: `http://<vps-ip>:8811/healthz`

## 6) Security Notes
- MCP token is stored at: `e2e-agent-kit/mcp/.token` (local only).
- `.token` is git-ignored (`mcp/.gitignore`).
- Token was rotated and removed from tracked files.
- Current endpoint is HTTP + bearer token. HTTPS hardening pending final user policy choices.

## 7) How To Operate
### Bootstrap
```bash
cd /root/.openclaw/workspace/e2e-agent-kit
npm install
npm run bootstrap
```

### Run smoke
```bash
npm run smoke
```

### Run regression
```bash
npm run regression
```

### Serve reports
```bash
npm run report:serve
```

### MCP verify
```bash
mcporter list --json
curl -i http://127.0.0.1:8811/healthz
```

## 8) Current Limitations
- Current UI is a minimal scaffold served by FastAPI for E2E validation bootstrap, not final production frontend.
- UI selectors are now available and P0 browser smoke is green, but business UX flows should be upgraded against the final frontend.

## 8.1 Interim Progress (API-first)
- Added API smoke suite: `npm run smoke:api`
- Added API regression suite: `npm run regression:api`
- Added UI scaffold routes in FastAPI (`/login`, `/dashboard`, `/app/core/new`) with stable `data-testid` selectors.
- UI browser smoke (`npm run smoke`) is now green for P0 baseline cases.
- Validated endpoints on staging:
  - `GET /health` -> 200
  - `GET /api/items/` -> 200
  - `POST /api/items/` -> 201
  - `GET /api/items/{id}` -> 200
  - `PUT /api/items/{id}` -> 200
  - `DELETE /api/items/{id}` -> 204
  - `GET /api/items/{deleted-id}` -> 404
  - `GET /docs` -> 200

## 9) Next Implementation Steps
1. Add HTTPS fronting (domain + cert) for MCP endpoint.
2. Add IP allowlist policy.
3. Expand P1/P2 scenarios to true business flows after production frontend rollout.
4. Integrate CI smoke/regression jobs with branch protection gates.
5. Add robust defect report schema (PASS/FAIL/BLOCKED + evidence map).

## 10) Current test inventory
- P0 UI: 3 cases (platform smoke, valid login, core create)
- P1 UI: 5 cases (invalid login, auth guard, core empty validation, logout, post-logout guard)
- API smoke: 1 suite
- API regression: 1 full CRUD suite

## 10) Change Log (this session)
- Created package scaffold, scripts, examples, docs.
- Executed smoke run and generated summary artifacts.
- Enabled persistent report portal in tmux.
- Added MCP config for local and IDE usage.
- Added token-protected HTTP MCP bridge.
- Fixed security issue by removing tracked token and rotating it.
