#!/usr/bin/env bash
set -euo pipefail

RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ-security)}"
export RUN_ID

echo "[security] run_id=$RUN_ID"
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
