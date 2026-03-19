#!/usr/bin/env bash
set -euo pipefail

RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ-regression)}"
export RUN_ID

echo "[regression] run_id=$RUN_ID"
FAIL_COUNT=0
for case in e2e/specs/p0/*.json e2e/specs/p1/*.json; do
  [[ -e "$case" ]] || continue
  if ! bash e2e/scripts/run-case.sh "$case"; then
    FAIL_COUNT=$((FAIL_COUNT+1))
  fi
done

bash e2e/scripts/summarize.sh "$RUN_ID"
echo "[regression] done: reports/e2e/$RUN_ID (failures=$FAIL_COUNT)"
[[ $FAIL_COUNT -eq 0 ]]
