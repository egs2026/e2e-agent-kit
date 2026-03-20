# Phase 2 Enhancements (Implemented)

This phase adds standardized run intelligence, richer PR feedback, and failure issue routing.

## 1) Standardized Run Summary JSON
- Script: `e2e/scripts/build-run-summary.mjs`
- Output: `reports/e2e/<run-id>/run-summary.json`

Summary fields:
- `totals.total`
- `totals.passed`
- `totals.failed`
- `totals.passRate`
- `failedCases[]` with:
  - `caseId`, `title`, `severity`, `error`
  - `classification` (config/assertion/timeout/selector/auth-session/app-unknown)
  - `ownerHint` (owner:core-critical / owner:core-regression / owner:extended)

## 2) Rich PR Summary + Annotations
In PR runs, the action now posts/updates a sticky comment containing:
- total/passed/failed/pass rate
- run URL
- top failed cases (with classification + owner hint + compact error)

## 3) Failure Issue Routing (non-PR)
For push/dispatch runs with failures, action now creates/updates:
- title: `[E2E][AUTO] Failures on <branch>`
- labels: `e2e-failure`, `auto-generated`
- body includes run KPIs + routed failed case list

## 4) New Action Outputs
From `.github/actions/run-e2e/action.yml`:
- `total_tests`
- `passed_tests`
- `failed_tests`
- `pass_rate`
- `result_url`
- `summary_json`

## 5) Workflow Permission Update
`e2e-run-action-parity.yml` now includes:
- `pull-requests: write`
- `issues: write`

This enables both PR comments and issue routing.

## 6) Preflight Gate (added)
Before the E2E job runs, a `preflight` job now validates:
- required secrets exist (`STAGING_URL`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`)
- staging health endpoint is reachable (`$STAGING_URL/health` returns 200)

This provides fast-fail diagnostics and avoids wasting runner time when config is missing/broken.
