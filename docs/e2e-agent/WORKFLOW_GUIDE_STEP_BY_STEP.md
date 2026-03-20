# Workflow Guide (Step-by-Step)

This guide is for end users/operators who want a reliable operating flow for the E2E project.

## 0) Prerequisites

Before starting, ensure:
- Repo is up to date (`main` branch)
- `.env` is configured correctly
- Staging app is reachable
- MCP endpoint + token are active

Commands:

```bash
cd /root/.openclaw/workspace/e2e-agent-kit
git checkout main
git pull origin main
```

---

## 1) Daily Start Checklist (2–3 minutes)

Run endpoint validation first:

```bash
npm run check:endpoints
```

Expected:
- All checks pass
- MCP `/mcp` without token returns `401` (this is correct)

If any check fails, stop and fix infra before test execution.

---

## 2) Run Test Packs

### 2.1 API Smoke Gate

```bash
npm run smoke:api
```

Use this as your first quality gate.

### 2.2 UI Smoke (P0)

```bash
npm run smoke
```

Purpose: confirm critical user journey stability.

### 2.3 Full UI Regression (P0 + P1)

```bash
npm run regression
```

Run this before release or after major changes.

### 2.4 Extended Pack (P2)

```bash
npm run regression:p2
```

Run for deeper non-critical checks.

---

## 3) Review Results

### 3.1 Local artifacts
- Reports are generated under `reports/e2e/<run-id>/`

### 3.2 Web reports portal

Open:
- `https://reports.egsmyapps.biz.id`

Check latest run folder and key evidence (logs/screenshots).

---

## 4) PR / CI Workflow (Recommended)

1. Create feature branch
2. Make changes
3. Commit + push
4. Open PR
5. Let CI run API smoke + UI regression
6. Review sticky PR summary comment
7. Merge only if gates are green

Commands:

```bash
git checkout -b feat/<your-change>
# edit files
git add .
git commit -m "Describe your change"
git push origin feat/<your-change>
```

---

## 5) Weekly Operations

Every week:
1. Review automated weekly QA issue
2. Track:
   - run counts
   - success rate
   - open e2e-failure issues
3. Triage recurring failures
4. Apply flaky policy as needed

Reference docs:
- `docs/e2e-agent/FLAKY_POLICY.md`
- `docs/e2e-agent/DASHBOARD_AUTOMATION.md`

---

## 6) Incident / Failure Handling

If a pipeline fails:

1. Open GitHub Actions logs
2. Identify failing case and evidence
3. Check if deterministic bug vs flaky behavior
4. Create/update issue
5. Fix and re-run failed gate
6. Confirm pass before merge

---

## 7) MCP Client Workflow (User Side)

1. Confirm token exists:

```bash
cat /root/.openclaw/workspace/e2e-agent-kit/mcp/.token
```

2. Configure client MCP endpoint:
- URL: `https://mcp.egsmyapps.biz.id/mcp`
- Header: `Authorization: Bearer <TOKEN>`

3. Reload client
4. Validate by listing tools and running one basic call

Reference docs:
- `docs/e2e-agent/CLIENT_MCP_QUICKSTART.md`
- `docs/e2e-agent/CLIENT_MCP_SERVER_GUIDELINE.md`

---

## 8) Monthly Security Hygiene

1. Rotate MCP token
2. Update all clients with new token
3. Verify old token invalid
4. Confirm endpoint health still `200`

---

## 9) Definition of Done (DoD)

A change is considered complete only when:
- Endpoint check passes
- Relevant smoke/regression pack passes
- Evidence is available in reports
- CI gates are green
- PR summary confirms healthy status
- Documentation updated (if behavior changed)

---

## 10) Fast Command Reference

```bash
npm run check:endpoints
npm run smoke:api
npm run smoke
npm run regression
npm run regression:p2
npm run report:serve
```
