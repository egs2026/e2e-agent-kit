#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT_ROOT="$ROOT_DIR/reports/e2e"
OUT_DIR="$ROOT_DIR/reports/dashboard"
mkdir -p "$OUT_DIR"

if [[ ! -d "$REPORT_ROOT" ]]; then
  echo "No reports found: $REPORT_ROOT"
  exit 1
fi

mapfile -t RUNS < <(ls -1t "$REPORT_ROOT" 2>/dev/null | head -n 20)
if [[ ${#RUNS[@]} -eq 0 ]]; then
  echo "No run folders found in $REPORT_ROOT"
  exit 1
fi

TOTAL_RUNS=0
TOTAL_CASES=0
TOTAL_PASS=0
TOTAL_FAIL=0

ROWS=""
for run in "${RUNS[@]}"; do
  run_dir="$REPORT_ROOT/$run"
  [[ -d "$run_dir" ]] || continue

  total=$(find "$run_dir" -maxdepth 1 -name '*.result.json' | wc -l | xargs)
  pass=$(grep -R '"status": "PASS"' "$run_dir"/*.result.json 2>/dev/null | wc -l | xargs || true)
  fail=$(grep -R '"status": "FAIL"' "$run_dir"/*.result.json 2>/dev/null | wc -l | xargs || true)

  TOTAL_RUNS=$((TOTAL_RUNS+1))
  TOTAL_CASES=$((TOTAL_CASES+total))
  TOTAL_PASS=$((TOTAL_PASS+pass))
  TOTAL_FAIL=$((TOTAL_FAIL+fail))

  rate="0"
  if [[ "$total" -gt 0 ]]; then
    rate=$(awk -v p="$pass" -v t="$total" 'BEGIN { printf "%.2f", (p/t)*100 }')
  fi

  ROWS+="| $run | $total | $pass | $fail | ${rate}% |"$'\n'
done

overall_rate="0"
if [[ "$TOTAL_CASES" -gt 0 ]]; then
  overall_rate=$(awk -v p="$TOTAL_PASS" -v t="$TOTAL_CASES" 'BEGIN { printf "%.2f", (p/t)*100 }')
fi

NOW=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
MD_PATH="$OUT_DIR/latest.md"
JSON_PATH="$OUT_DIR/latest.json"

cat > "$MD_PATH" <<EOF
# E2E Dashboard Snapshot

Generated: $NOW

## Overall (last ${TOTAL_RUNS} runs)
- Total Cases: $TOTAL_CASES
- Passed: $TOTAL_PASS
- Failed: $TOTAL_FAIL
- Pass Rate: ${overall_rate}%

## Recent Runs
| Run ID | Total | Pass | Fail | Pass Rate |
|---|---:|---:|---:|---:|
$ROWS

## Quick Links
- Reports Portal: https://reports.egsmyapps.biz.id
- Local latest report root: $REPORT_ROOT
EOF

cat > "$JSON_PATH" <<EOF
{
  "generatedAt": "$(date -u +%FT%TZ)",
  "totalRuns": $TOTAL_RUNS,
  "totals": {
    "cases": $TOTAL_CASES,
    "passed": $TOTAL_PASS,
    "failed": $TOTAL_FAIL,
    "passRate": $overall_rate
  }
}
EOF

echo "dashboard_markdown=$MD_PATH"
echo "dashboard_json=$JSON_PATH"
echo "portal=https://reports.egsmyapps.biz.id"
