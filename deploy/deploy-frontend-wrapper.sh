#!/usr/bin/env bash
set -euo pipefail

# One-command frontend deploy wrapper
# Usage examples:
#   npm run deploy:frontend
#   FRONTEND_DIST=/root/dist-e2e npm run deploy:frontend
#   npm run deploy:frontend -- /root/dist-e2e

ARG_PATH="${1:-}"
DIST_PATH="${ARG_PATH:-${FRONTEND_DIST:-dist}}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

bash "$SCRIPT_DIR/frontend-deploy.sh" "$DIST_PATH"
