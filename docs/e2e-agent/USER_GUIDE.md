# User Guides Documentation

This guide is intended for developers and operators who interact with the E2E MCP and associated services. It covers quick-start tasks, day-to-day operations, and troubleshooting to ensure a smooth client experience.

## Table of Contents
- 1. Quick Start Overview
- 2. Endpoint Overview
- 3. Authentication & Tokens
- 4. Client Configuration Examples
- 5. Health & Status Endpoints
- 6. Typical Workflows
- 7. Troubleshooting
- 8. Security Best Practices
- 9. Change Log & Maintenance

---

## 1) Quick Start Overview
This section describes the minimal steps to connect a MCP-enabled client to the endpoint and perform a basic test.

1. Retrieve the new MCP token from the token store on the VPS:

```bash
cat /root/.openclaw/workspace/e2e-agent-kit/mcp/.token
```

2. Configure your MCP client to use the endpoint with the token in the Authorization header:

```json
{
  "mcpServers": {
    "e2e-http": {
      "url": "https://mcp.egsmyapps.biz.id/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_TOKEN>"
      }
    }
  }
}
```

3. Reload the MCP client and perform a quick health check:

```bash
# Health checks
curl -s -o /dev/null -w "%{http_code}\n" https://mcp.egsmyapps.biz.id/healthz
curl -s -o /dev/null -w "%{http_code}\n" https://mcp.egsmyapps.biz.id/mcp
```

Expected: 200 for healthz, 4xx/5xx without token and 2xx with valid token (actual response may vary by method).

---

## 2) Endpoint Overview
- Staging app: https://staging.egsmyapps.biz.id
- Reports portal: https://reports.egsmyapps.biz.id
- MCP endpoint: https://mcp.egsmyapps.biz.id/mcp
- MCP health: https://mcp.egsmyapps.biz.id/healthz

---

## 3) Authentication & Tokens
- Token is stored at /root/.openclaw/workspace/e2e-agent-kit/mcp/.token
- Rotate token periodically or if exposure is suspected.
- To rotate:

```bash
cd /root/.openclaw/workspace/e2e-agent-kit
openssl rand -hex 32 > mcp/.token
chmod 600 mcp/.token
# Restart MCP session
tmux kill-session -t e2e-mcp 2>/dev/null || true
MCP_TOKEN=$(cat mcp/.token) tmux new -s e2e-mcp -d "cd /root/.openclaw/workspace/e2e-agent-kit && MCP_TOKEN=$MCP_TOKEN bash mcp/start-http-mcp.sh"
```

- Update all clients with the new token: replace Bearer <NEW_TOKEN>.

---

## 4) Client Configuration Examples
- Basic JSON config:

```json
{
  "mcpServers": {
    "e2e-http": {
      "url": "https://mcp.egsmyapps.biz.id/mcp",
      "headers": {
        "Authorization": "Bearer <NEW_TOKEN>"
      }
    }
  }
}
```

---

## 5) Health & Status Endpoints (UX suggestions)
- health endpoints return JSON or text for machine consumption; consider adding a human-friendly page at /status with: uptime, last check, service cards, and quick links to endpoints.

---

## 6) Troubleshooting
- 502 on domain: backend MCP not ready; inspect MCP tmux logs.
- 401 on /mcp: token invalid or missing.
- No tools visible: verify MCP client config and URL.

---

## 7) Security Best Practices
- Do not expose tokens in public chats or screenshots.
- Rotate tokens if there is any risk.
- Use TLS for all endpoints and enforce HSTS where possible.

---

## 8) Change Log & Maintenance
- Document versioned changes and coordinate through PRs.
- Update this guide when architecture changes or new endpoints are introduced.
