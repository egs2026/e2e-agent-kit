# E2E Best Practices (Applied)

## Security
- Keep secrets in `.env` only; never commit credentials.
- `.env` is git-ignored.
- Keep MCP token out of git (`mcp/.gitignore`).
- Use staging URL for test runs, not production.

## Reliability
- Use stable selectors (`data-testid`) for all critical UI steps.
- Keep API regression and UI smoke separated (`smoke:api`, `smoke`).
- Capture artifacts (JSON results + screenshots) per run ID.
- Make scripts deterministic and fail-fast on true failures.

## Test Design
- P0 smoke covers critical path only.
- API regression validates full CRUD lifecycle and negative check.
- Expand to role-based and negative UI flows after baseline passes.

## Ops
- Keep app runtime in `tmux` session (`fastapi`).
- Keep report server in `tmux` (`e2e-reports`).
- Keep MCP bridge in `tmux` (`e2e-mcp`).
- Edit GitHub workflow YAML from terminal when possible; verify indentation before push.
- Use `main` branch consistently for CI triggers and protection rules.

## Next recommended upgrades
1. Add CI pipeline (PR smoke + nightly regression).
2. Add trace/video capture on failure for UI tests.
3. Add synthetic monitoring (scheduled smoke:api every 30–60 min).
4. Add frontend deployment lane and replace scaffold UI with production frontend.
