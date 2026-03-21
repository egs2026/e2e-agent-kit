#!/usr/bin/env bash
set -euo pipefail

RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ-security)}"
export RUN_ID

echo "[security] run_id=$RUN_ID"

if [[ -f .env ]]; then
  STAGING_URL="${STAGING_URL:-$(grep -E '^STAGING_URL=' .env | cut -d= -f2- || true)}"
  E2E_USER_EMAIL="${E2E_USER_EMAIL:-$(grep -E '^E2E_USER_EMAIL=' .env | cut -d= -f2- || true)}"
  E2E_USER_PASSWORD="${E2E_USER_PASSWORD:-$(grep -E '^E2E_USER_PASSWORD=' .env | cut -d= -f2- || true)}"
fi

if [[ -z "${STAGING_URL:-}" ]]; then
  echo "[security] Missing STAGING_URL"
  exit 1
fi
if [[ -z "${E2E_USER_EMAIL:-}" || -z "${E2E_USER_PASSWORD:-}" ]]; then
  echo "[security] Missing E2E_USER_EMAIL or E2E_USER_PASSWORD"
  exit 1
fi

FAIL_COUNT=0
for case in e2e/specs/security/*.json; do
  [[ -e "$case" ]] || { echo "[security] no security JSON cases found"; break; }
  if ! bash e2e/scripts/run-case.sh "$case"; then
    FAIL_COUNT=$((FAIL_COUNT+1))
  fi
done

bash e2e/scripts/summarize.sh "$RUN_ID"
echo "[security] done: reports/e2e/$RUN_ID (failures=$FAIL_COUNT)"
[[ $FAIL_COUNT -eq 0 ]]
