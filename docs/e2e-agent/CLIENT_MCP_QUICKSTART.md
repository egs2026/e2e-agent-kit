# Client MCP Quickstart (2 Minutes)

## 1) Get token (on VPS)

```bash
cat /root/.openclaw/workspace/e2e-agent-kit/mcp/.token
```

Copy the value.

---

## 2) Add MCP server config in your client

```json
{
  "mcpServers": {
    "e2e-http": {
      "url": "https://mcp.egsmyapps.biz.id/mcp",
      "headers": {
        "Authorization": "Bearer <PASTE_TOKEN_HERE>"
      }
    }
  }
}
```

---

## 3) Restart/reload MCP in client

- Reload the client app or MCP servers.

---

## 4) Verify connection

Expected checks:
- `https://mcp.egsmyapps.biz.id/healthz` => `200`
- MCP tools become visible in client
- A simple MCP tool call returns data

---

## 5) If it fails (fast fix)

1. Recheck token value (no extra spaces/newlines)
2. Confirm URL path ends with `/mcp`
3. Rotate token if needed and update client
4. Check server logs:

```bash
tmux capture-pane -pt e2e-mcp:0 | tail -n 80
```

---

## Security reminder

- Never share token in public chat/screenshots.
- Rotate token immediately if exposed.
