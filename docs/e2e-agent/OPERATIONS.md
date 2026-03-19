# Operations Runbook

## tmux sessions
- Reports: `e2e-reports`
- MCP: `e2e-mcp`

## Check status
```bash
tmux ls | grep -E 'e2e-reports|e2e-mcp'
```

## Restart reports
```bash
tmux kill-session -t e2e-reports || true
cd /root/.openclaw/workspace/e2e-agent-kit
tmux new -s e2e-reports -d 'npm run report:serve'
```

## Restart MCP
```bash
tmux kill-session -t e2e-mcp || true
cd /root/.openclaw/workspace/e2e-agent-kit
MCP_TOKEN=$(cat mcp/.token) tmux new -s e2e-mcp -d 'MCP_TOKEN=$(cat mcp/.token) bash mcp/start-http-mcp.sh'
```

## Log tail
```bash
tmux capture-pane -pt e2e-reports:0 | tail -n 80
tmux capture-pane -pt e2e-mcp:0 | tail -n 120
```
