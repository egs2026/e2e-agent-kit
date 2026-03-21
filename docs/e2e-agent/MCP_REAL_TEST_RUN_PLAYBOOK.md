# MCP Real Test Run Playbook (Anti Gravity)

Use this playbook to run real E2E tests through MCP from Anti Gravity.

## 1) One-time Setup

### 1.1 Configure MCP server in Anti Gravity

```json
{
  "mcpServers": {
    "e2e-http": {
      "url": "https://mcp.egsmyapps.biz.id/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_TOKEN>"
      }
    }
  }
}
```

### 1.2 Connectivity validation

- `https://mcp.egsmyapps.biz.id/healthz` -> `200`
- `https://mcp.egsmyapps.biz.id/mcp` without token -> `401`
- same endpoint with token -> non-401 (often 405/400 for plain curl)

---

## 2) Daily Operator Runbook

### Step A — Preflight
Run:

```bash
cd /root/.openclaw/workspace/e2e-agent-kit
npm run check:endpoints
```

Pass criteria:
- staging/report/mcp checks pass
- `/mcp` without token returns 401

### Step B — API baseline

```bash
npm run smoke:api
```

Pass criteria:
- health + critical API endpoints pass

### Step C — Main regression

```bash
npm run regression
```

Pass criteria:
- all P0 + P1 pass

### Step D — Extended pack (optional)

```bash
npm run regression:p2
```

Pass criteria:
- P2 pack passes (non-blocking by policy unless specified)

---

## 3) Priority-based MCP run

For fast release gate checks:

```bash
PRIORITY=High,Medium npm run e2e:run
```

Use this for fast confidence checks before full regression.

---

## 4) Artifact Retrieval & Review

Latest run folder:

```bash
ls -1t /root/.openclaw/workspace/e2e-agent-kit/reports/e2e | head -n 1
```

Review files:
- `summary.md`
- `run-summary.json`
- `videos/` (per-case video)
- `step-shots/` (per-step screenshots)
- `traces/` (Playwright traces)

Portal:
- `https://reports.egsmyapps.biz.id`

---

## 5) GO / NO-GO Decision Rules

### GO
- preflight pass
- API smoke pass
- P0 + P1 pass
- no unresolved critical defect

### NO-GO
- any P0 fail
- repeated auth/session regression
- environment instability (endpoint checks fail)

---

## 6) Failure Triage Procedure

1. Open failed case in `run-summary.json`
2. Classify from summary:
   - `config`
   - `assertion`
   - `timeout`
   - `selector`
   - `auth/session`
   - `app/unknown`
3. Inspect evidence in this order:
   1) step-shots
   2) video
   3) trace
4. Reproduce quickly in staging manually
5. Patch selector/spec/app
6. Re-run targeted pack then full regression

---

## 7) Real Product Onboarding (Anti Gravity)

To move from scaffold to real software tests:

1. Add stable `data-testid` on real pages
2. Map top 5 business-critical P0 journeys
3. Add corresponding JSON specs in `e2e/specs/p0/`
4. Add P1 negative/session tests in `e2e/specs/p1/`
5. Enforce CI gates on `main`

---

## 8) Suggested Operator Prompt (inside Anti Gravity)

Use this prompt for your MCP operator flow:

> Run preflight (`check:endpoints`), then run API smoke and P0+P1 regression. Return:
> 1) total/passed/failed/pass rate,
> 2) failed case IDs with classification,
> 3) direct report folder path,
> 4) GO/NO-GO recommendation.

---

## 9) Security Notes

- Keep MCP token in secret store only
- Rotate token monthly or after any exposure
- Never post token in logs/chat/screenshots
