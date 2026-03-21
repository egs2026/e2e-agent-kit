# E2E App Work Instruction (End-to-End Usage)

This document is the operational SOP for using the E2E web app and test platform.

## 1) Access URLs (Single Domain)

- App login: `https://e2e.egsmyapps.biz.id/login`
- Dashboard: `https://e2e.egsmyapps.biz.id/dashboard`
- Reports explorer: `https://e2e.egsmyapps.biz.id/reports/`
- MCP health: `https://e2e.egsmyapps.biz.id/healthz`
- MCP endpoint: `https://e2e.egsmyapps.biz.id/mcp` (requires Bearer token)

---

## 2) Login and Session

1. Open `/login`
2. Enter E2E credentials
3. Click **Sign In**
4. Confirm redirect to dashboard

Expected:
- Dashboard loads
- User avatar visible
- Action buttons available

If login fails:
- Check credential values in server `.env`
- Verify API health endpoint

---

## 3) Dashboard Navigation

From dashboard, use these buttons:

- **Create Core Entity** → `/app/core/new`
- **Core List** → `/app/core/list`
- **Open Reports** → `/reports/`
- **MCP Health** → `/healthz`
- **MCP Endpoint** → `/mcp` (returns unauthorized in browser; expected)
- **Sign out** → `/logout`

---

## 4) Core Entity Flow (Manual Validation)

### 4.1 Create
1. Open **Create Core Entity**
2. Input name
3. Click **Save Record**

Expected:
- Success toast appears
- **View detail** link appears

### 4.2 Negative validation
1. Leave name empty
2. Click **Save Record**

Expected:
- Validation error shown
- No success toast

### 4.3 List and detail
1. Click **Back to list** or open **Core List**
2. Verify record appears in table
3. Click **View**

Expected:
- Detail page loads with matching ID + name

### 4.4 Session protection
1. Sign out
2. Open protected URL directly (e.g. `/app/core/list`)

Expected:
- Redirect to login

---

## 5) Test Execution (CLI)

Run from:
`/root/.openclaw/workspace/e2e-agent-kit`

### 5.1 Endpoint preflight
```bash
npm run check:endpoints
```

### 5.2 API smoke
```bash
npm run smoke:api
```

### 5.3 UI regression (P0+P1)
```bash
npm run regression
```

### 5.4 Security baseline
```bash
npm run security
```

### 5.5 Full daily gate
```bash
npm run mcp:daily-gate
```

---

## 6) Readiness Evaluation

### Production readiness status
```bash
npm run prod:status
```

Expected output:
- `GO` or `NO-GO`
- regression/security metrics
- reasons list if NO-GO

### Spec validation
Single run:
```bash
npm run spec:validate -- --run-id=<run-id>
```

Combined latest regression + security:
```bash
npm run spec:validate:combined
```

---

## 7) Report Explorer Usage

Open:
`https://e2e.egsmyapps.biz.id/reports/`

Features:
- Left panel: report file list
- Right panel: selected file preview
- Filters:
  - search by path/run id
  - file type (`.md`, `.json`, `.png`, `.webm`, `.zip`)
  - project key

Tip:
- Use `PROJECT_KEY=<name>` when running tests to separate projects in filters

Example:
```bash
PROJECT_KEY=ag npm run regression
PROJECT_KEY=crm npm run security
```

---

## 8) Artifact Locations

Run outputs:
- `reports/e2e/<run-id>/summary.md`
- `reports/e2e/<run-id>/*.result.json`
- `reports/e2e/<run-id>/videos/`
- `reports/e2e/<run-id>/step-shots/`
- `reports/e2e/<run-id>/traces/`
- `reports/e2e/<run-id>/spec-validation.*` (after spec validation)

Dashboard snapshots:
- `reports/dashboard/latest-all.md`
- `reports/dashboard/latest-<project>.md`

---

## 9) MCP Client Setup (Anti Gravity)

Use `supergateway` with streamable HTTP and bearer token.

Windows example:
```json
"e2e-http": {
  "command": "npx.cmd",
  "args": [
    "-y",
    "supergateway",
    "--streamableHttp",
    "https://e2e.egsmyapps.biz.id/mcp",
    "--outputTransport",
    "stdio",
    "--oauth2Bearer",
    "<E2E_MCP_TOKEN>",
    "--header",
    "Accept: application/json, text/event-stream"
  ],
  "env": {}
}
```

---

## 10) Token and Security Operations

- Keep MCP token private
- Rotate token if exposed
- Update MCP clients after rotation

Rotate token (server):
```bash
cd /root/.openclaw/workspace/e2e-agent-kit
openssl rand -hex 32 > mcp/.token
chmod 600 mcp/.token
tmux kill-session -t e2e-mcp 2>/dev/null || true
MCP_TOKEN=$(cat mcp/.token) tmux new -s e2e-mcp -d "cd /root/.openclaw/workspace/e2e-agent-kit && MCP_TOKEN=$MCP_TOKEN bash mcp/start-http-mcp.sh"
```

---

## 11) Common Issues and Quick Fix

### A) `/mcp` returns unauthorized
- Normal in browser (no token)
- Use MCP client with Bearer token

### B) Reports not loading
- Check `e2e-reports` tmux session
- regenerate explorer:
```bash
npm run report:explorer
```

### C) Dashboard route 405 in curl
- `curl -I` uses HEAD; app route allows GET
- use:
```bash
curl -i https://e2e.egsmyapps.biz.id/dashboard
```

### D) Security lane fails in CI
- verify env secrets:
  - `STAGING_URL`
  - `E2E_USER_EMAIL`
  - `E2E_USER_PASSWORD`

---

## 12) Daily Operating Routine (recommended)

1. `npm run mcp:daily-gate`
2. `npm run prod:status`
3. `npm run dashboard`
4. Review `/reports/` explorer
5. Triage and fix any failures
