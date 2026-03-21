#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

export MCP_STDIO_PORT="${MCP_STDIO_PORT:-8810}"
export MCP_PROXY_PORT="${MCP_PROXY_PORT:-8811}"
export MCP_UPSTREAM="http://127.0.0.1:${MCP_STDIO_PORT}"
export MCP_PROTOCOL_VERSION="${MCP_PROTOCOL_VERSION:-2025-06-18}"

if [[ -z "${MCP_TOKEN:-}" ]]; then
  echo "[start-http-mcp] MCP_TOKEN is required"
  exit 1
fi

cleanup() {
  if [[ -n "${GW_PID:-}" ]]; then
    kill "$GW_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "[start-http-mcp] starting supergateway on 127.0.0.1:${MCP_STDIO_PORT} ..."
npx -y supergateway \
  --stdio "npx -y @modelcontextprotocol/server-filesystem /root/.openclaw/workspace/e2e-agent-kit" \
  --outputTransport streamableHttp \
  --streamableHttpPath /mcp \
  --port "${MCP_STDIO_PORT}" \
  --logLevel info \
  --protocolVersion "${MCP_PROTOCOL_VERSION}" \
  --healthEndpoint /healthz &
GW_PID=$!

sleep 1

echo "[start-http-mcp] starting token proxy on 0.0.0.0:${MCP_PROXY_PORT} ..."
node mcp/proxy.mjs
