#!/usr/bin/env bash
set -euo pipefail

PRIORITY_RAW="${PRIORITY:-${1:-}}"
RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ-priority)}"
export RUN_ID

normalize() {
  echo "$1" | tr '[:lower:]' '[:upper:]' | xargs
}

has_token() {
  local haystack=",$1,"
  local needle=",$2,"
  [[ "$haystack" == *"$needle"* ]]
}

PRIORITY="$(normalize "$PRIORITY_RAW")"

echo "[e2e-run] run_id=$RUN_ID priority='${PRIORITY:-ALL}'"

TARGET_GLOBS=()
if [[ -z "$PRIORITY" ]]; then
  TARGET_GLOBS+=("e2e/specs/p0/*.json" "e2e/specs/p1/*.json" "e2e/specs/p2/*.json")
else
  PCSV=",${PRIORITY// /},"
  if has_token "$PCSV" "HIGH" || has_token "$PCSV" "P0"; then TARGET_GLOBS+=("e2e/specs/p0/*.json"); fi
  if has_token "$PCSV" "MEDIUM" || has_token "$PCSV" "P1"; then TARGET_GLOBS+=("e2e/specs/p1/*.json"); fi
  if has_token "$PCSV" "LOW" || has_token "$PCSV" "P2"; then TARGET_GLOBS+=("e2e/specs/p2/*.json"); fi
fi

if [[ ${#TARGET_GLOBS[@]} -eq 0 ]]; then
  echo "[e2e-run] no matching priorities; valid values: High,Medium,Low or P0,P1,P2"
  exit 2
fi

FAIL_COUNT=0
RUN_COUNT=0
for glob in "${TARGET_GLOBS[@]}"; do
  for case in $glob; do
    [[ -e "$case" ]] || continue
    RUN_COUNT=$((RUN_COUNT+1))
    if ! bash e2e/scripts/run-case.sh "$case"; then
      FAIL_COUNT=$((FAIL_COUNT+1))
    fi
  done
done

bash e2e/scripts/summarize.sh "$RUN_ID"
echo "[e2e-run] done: reports/e2e/$RUN_ID (total=$RUN_COUNT failures=$FAIL_COUNT)"
[[ $FAIL_COUNT -eq 0 ]]
