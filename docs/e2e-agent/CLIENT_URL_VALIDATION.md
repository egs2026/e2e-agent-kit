# Client URL Validation Checklist

Use this checklist for quick post-deploy validation.

## Manual URL Checklist

- `https://staging.egsmyapps.biz.id` -> 200/302
- `https://staging.egsmyapps.biz.id/health` -> 200
- `https://staging.egsmyapps.biz.id/login` -> 200
- `https://staging.egsmyapps.biz.id/dashboard` -> 200/302/303 (redirect to login is acceptable without session)
- `https://staging.egsmyapps.biz.id/app/core/new` -> 200/302/303 (redirect to login is acceptable without session)
- `https://reports.egsmyapps.biz.id` -> 200
- `https://mcp.egsmyapps.biz.id/healthz` -> 200
- `https://mcp.egsmyapps.biz.id/mcp` (no token) -> 401

## Automated Check

Run:

```bash
npm run check:endpoints
```

Optional override:

```bash
STAGING_URL=https://your-staging.example.com \
REPORTS_URL=https://reports.example.com \
MCP_URL=https://mcp.example.com \
npm run check:endpoints
```

## Why this matters

This check confirms:
- app availability
- report portal availability
- MCP reachability and auth guard behavior

Use this as a release gate before client demos.
