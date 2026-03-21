#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT_ROOT="$ROOT_DIR/reports/e2e"
CHECKLIST="$ROOT_DIR/docs/e2e-agent/PROD_READINESS_CHECKLIST.md"
MATRIX="$ROOT_DIR/docs/e2e-agent/PROD_P0_P1_MATRIX.md"

if [[ ! -d "$REPORT_ROOT" ]]; then
  echo "NO-GO"
  echo "reason=no_reports_found"
  exit 0
fi

latest_regression=$(ls -1t "$REPORT_ROOT" 2>/dev/null | grep -E 'regression$' | head -n 1 || true)
latest_security=$(ls -1t "$REPORT_ROOT" 2>/dev/null | grep -E 'security$' | head -n 1 || true)

reg_total=0; reg_pass=0; reg_fail=0
sec_total=0; sec_pass=0; sec_fail=0

if [[ -n "$latest_regression" && -d "$REPORT_ROOT/$latest_regression" ]]; then
  reg_total=$(find "$REPORT_ROOT/$latest_regression" -maxdepth 1 -name '*.result.json' | wc -l | xargs)
  reg_pass=$(grep -R '"status": "PASS"' "$REPORT_ROOT/$latest_regression"/*.result.json 2>/dev/null | wc -l | xargs || true)
  reg_fail=$(grep -R '"status": "FAIL"' "$REPORT_ROOT/$latest_regression"/*.result.json 2>/dev/null | wc -l | xargs || true)
fi

if [[ -n "$latest_security" && -d "$REPORT_ROOT/$latest_security" ]]; then
  sec_total=$(find "$REPORT_ROOT/$latest_security" -maxdepth 1 -name '*.result.json' | wc -l | xargs)
  sec_pass=$(grep -R '"status": "PASS"' "$REPORT_ROOT/$latest_security"/*.result.json 2>/dev/null | wc -l | xargs || true)
  sec_fail=$(grep -R '"status": "FAIL"' "$REPORT_ROOT/$latest_security"/*.result.json 2>/dev/null | wc -l | xargs || true)
fi

matrix_present=false
checklist_present=false
[[ -f "$MATRIX" ]] && matrix_present=true
[[ -f "$CHECKLIST" ]] && checklist_present=true

# Heuristic readiness rules
# - latest regression exists and has 0 fail
# - latest security exists and has 0 fail
# - readiness docs exist
status="GO"
reasons=()

if [[ -z "$latest_regression" || "$reg_fail" -ne 0 ]]; then
  status="NO-GO"
  reasons+=("regression_not_green")
fi

if [[ -z "$latest_security" || "$sec_fail" -ne 0 ]]; then
  status="NO-GO"
  reasons+=("security_not_green")
fi

if [[ "$matrix_present" != true ]]; then
  status="NO-GO"
  reasons+=("missing_p0_p1_matrix")
fi

if [[ "$checklist_present" != true ]]; then
  status="NO-GO"
  reasons+=("missing_readiness_checklist")
fi

echo "$status"
echo "latest_regression_run=$latest_regression"
echo "regression_total=$reg_total"
echo "regression_pass=$reg_pass"
echo "regression_fail=$reg_fail"
echo "latest_security_run=$latest_security"
echo "security_total=$sec_total"
echo "security_pass=$sec_pass"
echo "security_fail=$sec_fail"
echo "matrix_present=$matrix_present"
echo "checklist_present=$checklist_present"

if [[ ${#reasons[@]} -gt 0 ]]; then
  echo "reasons=$(IFS=,; echo "${reasons[*]}")"
else
  echo "reasons=none"
fi
