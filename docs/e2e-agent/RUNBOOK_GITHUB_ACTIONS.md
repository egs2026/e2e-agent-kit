# GitHub Actions Runbook (E2E Agent Kit)

## Purpose
Prevent workflow breakage and speed up recovery when CI fails.

## Guardrails
1. Prefer terminal-based workflow edits over web editor for YAML-sensitive files.
2. After editing workflow YAML, always verify with:
   - `nl -ba .github/workflows/e2e-agent-kit.yml | sed -n '1,120p'`
3. Keep indentation strict (2 spaces per nesting level).
4. Use branch `main` for triggers and pushes.
5. Ensure repository secrets exist before running workflows.

## Required repository secrets
- `STAGING_URL`
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

## Minimal validation workflow pattern
- API smoke gate first
- UI regression gate second (`needs: api-smoke`)

## Recovery checklist
1. Open failing run and identify whether failure is:
   - YAML syntax
   - secret missing
   - runtime command/test failure
2. For YAML failures, rewrite full file from terminal (avoid incremental web edits).
3. Push, rerun workflow, confirm green baseline.

## Capability baseline (current)
- API smoke gate
- UI regression gate (P0+P1)
- Staging URL + secrets integration
- Playwright install + regression execution
