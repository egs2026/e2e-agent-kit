#!/usr/bin/env bash
set -euo pipefail

RUN_ID="${1:-}"
if [[ -z "$RUN_ID" ]]; then
  echo "Usage: summarize.sh <run-id>"
  exit 1
fi

OUT_DIR="reports/e2e/${RUN_ID}"
mkdir -p "$OUT_DIR"

TOTAL=$(find "$OUT_DIR" -name '*.result.json' | wc -l | xargs)
PASS=$( (grep -R '"status": "PASS"' "$OUT_DIR"/*.result.json 2>/dev/null || true) | wc -l | xargs )
FAIL=$( (grep -R '"status": "FAIL"' "$OUT_DIR"/*.result.json 2>/dev/null || true) | wc -l | xargs )

cat > "$OUT_DIR/summary.md" <<EOF
# E2E Run Summary

- Run ID: ${RUN_ID}
- Total cases: ${TOTAL}
- Pass: ${PASS}
- Fail: ${FAIL}
- Generated: $(date -u +%FT%TZ)

## JSON Results
$(ls "$OUT_DIR"/*.result.json 2>/dev/null | sed 's#^#- #' || true)
EOF

node e2e/scripts/build-report-explorer.mjs >/dev/null 2>&1 || true

echo "[summarize] $OUT_DIR/summary.md"
