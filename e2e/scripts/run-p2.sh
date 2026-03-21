#!/usr/bin/env bash
set -euo pipefail

PROJECT_KEY="${PROJECT_KEY:-core}"
RUN_ID="${RUN_ID:-${PROJECT_KEY}-$(date -u +%Y%m%dT%H%M%SZ-p2)}"
export RUN_ID

echo "[p2] run_id=$RUN_ID"
FAIL_COUNT=0
for case in e2e/specs/p2/*.json; do
  [[ -e "$case" ]] || { echo "[p2] no p2 JSON cases found"; break; }
  if ! bash e2e/scripts/run-case.sh "$case"; then
    FAIL_COUNT=$((FAIL_COUNT+1))
  fi
done

bash e2e/scripts/summarize.sh "$RUN_ID"
echo "[p2] done: reports/e2e/$RUN_ID (failures=$FAIL_COUNT)"
[[ $FAIL_COUNT -eq 0 ]]
