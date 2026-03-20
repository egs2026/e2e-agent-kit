#!/usr/bin/env bash
set -euo pipefail

RUN_ID="${1:-${RUN_ID:-}}"
if [[ -z "$RUN_ID" ]]; then
  echo "Usage: collect-metrics.sh <run-id>"
  exit 1
fi

OUT_DIR="reports/e2e/${RUN_ID}"
TOTAL=$(find "$OUT_DIR" -name '*.result.json' | wc -l | xargs)
PASSED=$(grep -R '"status": "PASS"' "$OUT_DIR"/*.result.json 2>/dev/null | wc -l | xargs || true)
FAILED=$(grep -R '"status": "FAIL"' "$OUT_DIR"/*.result.json 2>/dev/null | wc -l | xargs || true)

echo "total_tests=$TOTAL"
echo "passed_tests=$PASSED"
echo "failed_tests=$FAILED"
