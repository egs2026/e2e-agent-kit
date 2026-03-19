# MCP + E2E Architecture (Text Diagram)

## High-Level Flow

```text
[Client MCP App]
    |
    | HTTPS + Bearer Token
    v
[mcp.egsmyapps.biz.id/mcp]
    |
    | Nginx reverse proxy
    v
[Token Proxy :8811]
    |
    | forwards authorized requests
    v
[Supergateway :8810]
    |
    | stdio transport
    v
[@modelcontextprotocol/server-filesystem]
    |
    v
[/root/.openclaw/workspace/e2e-agent-kit]
```

---

## E2E Execution Plane

```text
[GitHub Actions / Manual Trigger]
    |
    +--> API Smoke (npm run smoke:api)
    |
    +--> UI Regression (npm run regression)
             |
             +--> Playwright runner
             +--> reports/e2e/<run-id>/
             +--> artifacts upload
             +--> issue creation on failure (non-PR)
             +--> PR summary comment (PR runs)
```

---

## Governance Layer

```text
[Branch Protection: main]
  - required status checks
  - required PR reviews
  - no force push/deletion
        |
        v
[Merge only when E2E gates pass]
```

---

## Domain Routing

- `https://staging.egsmyapps.biz.id` -> app backend/frontend staging
- `https://reports.egsmyapps.biz.id` -> report portal (`:8787`)
- `https://mcp.egsmyapps.biz.id/mcp` -> MCP HTTP endpoint (`:8811` proxy)

---

## Security Controls

- MCP endpoint protected by Bearer token
- Token rotation SOP in place (`mcp/.token` + tmux restart)
- HTTPS enabled on public endpoints
- GitHub PAT hygiene enforced (rotation after exposure)

---

## Operational Sessions (VPS)

- `tmux: fastapi` -> staging app runtime
- `tmux: e2e-reports` -> report server
- `tmux: e2e-mcp` -> MCP bridge stack

---

## Failure Triage Path

1. Workflow run fails -> inspect Actions logs
2. Download artifacts from run
3. Check open `e2e-failure` issues
4. Apply flaky policy / quarantine as needed
5. Re-run regression and confirm green before merge
