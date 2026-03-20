# Workflow Guide — One Page (Stakeholder View)

## Objective
Operate the E2E platform with predictable quality gates, clear evidence, and fast decision-making.

---

## End-to-End Flow

```text
[1] Environment Ready
    - Staging up
    - Reports up
    - MCP up
           |
           v
[2] Endpoint Validation
    npm run check:endpoints
           |
           v
[3] Test Execution
    API Smoke  ->  UI Smoke (P0)  ->  Regression (P0+P1)  ->  Optional P2
           |
           v
[4] Evidence Review
    reports/e2e/<run-id>
    + reports portal
           |
           v
[5] CI/PR Governance
    Required checks pass
    PR summary confirms status
           |
           v
[6] Release Decision
    GO if all green
    NO-GO if critical failures remain
```

---

## Decision Gates

### Gate A — Availability
- Endpoint validation passes
- MCP auth guard behaves correctly (`/mcp` without token = 401)

### Gate B — Quality
- API smoke passes
- P0 smoke passes
- Regression passes for release-impacting scope

### Gate C — Governance
- CI checks green
- PR review complete
- Evidence attached

---

## Roles and Responsibilities

- **Operator / QA Lead**
  - Run endpoint + test workflow
  - Review evidence and triage failures
- **Developer**
  - Fix failing cases and submit PR
- **Approver / Stakeholder**
  - Decide GO/NO-GO based on gates and trend

---

## KPI Snapshot (Weekly)

Track these indicators:
- Total runs (7-day)
- Success / failed / cancelled
- Success rate (%)
- Open `e2e-failure` issues
- Flaky/quarantined test count

Use weekly automated issue for KPI review.

---

## Fast Ops Commands

```bash
npm run check:endpoints
npm run smoke:api
npm run smoke
npm run regression
npm run regression:p2
npm run report:serve
```

---

## GO / NO-GO Rule

**GO** when:
- endpoint checks pass,
- quality gates green,
- no unresolved critical defects.

**NO-GO** when:
- critical flow fails,
- unresolved high-severity regression exists,
- CI gate not green.

---

## Escalation Path

If failures persist:
1. Inspect Actions logs
2. Validate reproducibility (deterministic vs flaky)
3. Open/update issue with evidence
4. Apply fix and re-run gates
5. Re-evaluate GO/NO-GO
