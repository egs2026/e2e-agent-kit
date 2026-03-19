#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${STAGING_URL:-https://staging.egsmyapps.biz.id}"
RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ-api-smoke)}"
OUT_DIR="reports/e2e/${RUN_ID}"
mkdir -p "$OUT_DIR"

PASS=0
FAIL=0

check_code() {
  local name="$1" url="$2" method="${3:-GET}" data="${4:-}"
  local code
  if [[ -n "$data" ]]; then
    code=$(curl -s -o "$OUT_DIR/${name}.body" -w "%{http_code}" -X "$method" -H "content-type: application/json" -d "$data" "$url")
  else
    code=$(curl -s -o "$OUT_DIR/${name}.body" -w "%{http_code}" -X "$method" "$url")
  fi
  echo "$code" > "$OUT_DIR/${name}.code"
  echo "[$name] $method $url -> $code"
}

# 1) health
check_code "api_health" "$BASE_URL/health" GET
if [[ "$(cat "$OUT_DIR/api_health.code")" == "200" ]]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); fi

# 2) list items
check_code "api_items_list" "$BASE_URL/api/items/" GET
if [[ "$(cat "$OUT_DIR/api_items_list.code")" == "200" ]]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); fi

# 3) create item
PAYLOAD='{"name":"E2E API Item","description":"created by api smoke"}'
check_code "api_items_create" "$BASE_URL/api/items/" POST "$PAYLOAD"
if [[ "$(cat "$OUT_DIR/api_items_create.code")" == "201" ]]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); fi

# 4) docs reachable
check_code "api_docs" "$BASE_URL/docs" GET
if [[ "$(cat "$OUT_DIR/api_docs.code")" == "200" ]]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); fi

cat > "$OUT_DIR/summary.md" <<EOF
# API Smoke Summary

- Run ID: $RUN_ID
- Base URL: $BASE_URL
- Pass: $PASS
- Fail: $FAIL
- Generated: $(date -u +%FT%TZ)
EOF

[[ $FAIL -eq 0 ]]
