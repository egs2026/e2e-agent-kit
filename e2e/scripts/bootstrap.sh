#!/usr/bin/env bash
set -euo pipefail

echo "[bootstrap] checking runtime..."
command -v node >/dev/null || { echo "node missing"; exit 1; }
command -v npm >/dev/null || { echo "npm missing"; exit 1; }
command -v python3 >/dev/null || { echo "python3 missing"; exit 1; }

if ! command -v agent-browser >/dev/null; then
  echo "[bootstrap] agent-browser not found. Install with: npm i -g agent-browser && agent-browser install --with-deps"
else
  echo "[bootstrap] agent-browser found: $(command -v agent-browser)"
fi

echo "[bootstrap] creating run folders..."
mkdir -p reports/e2e e2e/state/auth

echo "[bootstrap] done"
