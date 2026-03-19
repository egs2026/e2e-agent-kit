# Client MCP Server Guideline

This document explains how to connect a client application to the E2E MCP endpoint.

## 1) Endpoint Information

- MCP URL: `https://mcp.egsmyapps.biz.id/mcp`
- Health check: `https://mcp.egsmyapps.biz.id/healthz`
- Auth type: Bearer token
- Token source (server-side): `/root/.openclaw/workspace/e2e-agent-kit/mcp/.token`

---

## 2) Pre-connection Validation

Run on VPS before configuring a client:

```bash
TOKEN=$(cat /root/.openclaw/workspace/e2e-agent-kit/mcp/.token)

# Expected: 200
curl -s -o /dev/null -w "%{http_code}\n" https://mcp.egsmyapps.biz.id/healthz

# Expected: 401 (no token)
curl -s -o /dev/null -w "%{http_code}\n" https://mcp.egsmyapps.biz.id/mcp

# Expected: non-401 (typically 405/400 with plain curl, which is fine)
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" https://mcp.egsmyapps.biz.id/mcp
```

Interpretation:
- `200` on `/healthz` => service reachable
- `401` on `/mcp` without token => auth guard working
- non-401 on `/mcp` with token => auth success

---

## 3) Standard Client Config Snippet

Use this template in MCP-capable clients:

```json
{
  "mcpServers": {
    "e2e-http": {
      "url": "https://mcp.egsmyapps.biz.id/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_MCP_TOKEN>"
      }
    }
  }
}
```

Notes:
- Replace `<YOUR_MCP_TOKEN>` with the value from `.token`.
- Avoid storing token in public repos or screenshots.

---

## 4) Minimal Connection Test (Client-side)

After reloading your client:
1. List MCP tools from `e2e-http`
2. Run one simple tool action (e.g., list/read a known directory/file)

Success criteria:
- tools are discoverable
- tool call returns data (no auth or transport error)

---

## 5) Token Rotation SOP

Rotate token when:
- token exposure suspected
- routine security cycle (recommended monthly)
- team access changes

Commands:

```bash
cd /root/.openclaw/workspace/e2e-agent-kit
openssl rand -hex 32 > mcp/.token
chmod 600 mcp/.token

# restart MCP service
tmux kill-session -t e2e-mcp 2>/dev/null || true
MCP_TOKEN=$(cat mcp/.token) tmux new -s e2e-mcp -d "cd /root/.openclaw/workspace/e2e-agent-kit && MCP_TOKEN=$MCP_TOKEN bash mcp/start-http-mcp.sh"
```

Then update all clients with the new token.

---

## 6) Troubleshooting

### A) `502` from domain
- backend process not ready/crashed
- check tmux logs:
```bash
tmux capture-pane -pt e2e-mcp:0 | tail -n 120
```

### B) `401` even with token
- wrong/old token in client
- rotate token and update client

### C) Client sees no tools
- malformed MCP config JSON
- client not reloaded
- wrong URL path (must be `/mcp`)

### D) Health OK but tool call fails
- likely client-side protocol/config mismatch
- validate with another MCP-capable client

---

## 7) Security Baseline

- Keep token only in secured secret stores or local protected configs
- Never paste token in shared chat or public docs
- Revoke/rotate immediately if exposed
- Keep MCP endpoint behind HTTPS (already enabled)
