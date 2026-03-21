#!/usr/bin/env bash
set -euo pipefail

PROJECT_KEY="${PROJECT_KEY:-core}"
RUN_ID="${RUN_ID:-${PROJECT_KEY}-$(date -u +%Y%m%dT%H%M%SZ-smoke)}"
export RUN_ID

echo "[smoke] run_id=$RUN_ID"
FAIL_COUNT=0
for case in e2e/specs/p0/*.json; do
  [[ -e "$case" ]] || { echo "[smoke] no p0 JSON cases found"; break; }
  if ! bash e2e/scripts/run-case.sh "$case"; then
    FAIL_COUNT=$((FAIL_COUNT+1))
  fi
done

bash e2e/scripts/summarize.sh "$RUN_ID"
echo "[smoke] done: reports/e2e/$RUN_ID (failures=$FAIL_COUNT)"
[[ $FAIL_COUNT -eq 0 ]]
