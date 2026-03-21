#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${STAGING_URL:-https://staging.egsmyapps.biz.id}"
PROJECT_KEY="${PROJECT_KEY:-core}"
RUN_ID="${RUN_ID:-${PROJECT_KEY}-$(date -u +%Y%m%dT%H%M%SZ-api-regression)}"
OUT_DIR="reports/e2e/${RUN_ID}"
mkdir -p "$OUT_DIR"

pass=0
fail=0

record() {
  local name="$1" status="$2" detail="$3"
  printf "%s | %s | %s\n" "$name" "$status" "$detail" | tee -a "$OUT_DIR/checks.log"
  if [[ "$status" == "PASS" ]]; then pass=$((pass+1)); else fail=$((fail+1)); fi
}

# 1) Health
code=$(curl -s -o "$OUT_DIR/health.json" -w "%{http_code}" "$BASE_URL/health")
if [[ "$code" == "200" ]] && jq -e '.status=="ok"' "$OUT_DIR/health.json" >/dev/null 2>&1; then
  record "health" "PASS" "200 + status=ok"
else
  record "health" "FAIL" "code=$code"
fi

# 2) List items baseline
code=$(curl -s -o "$OUT_DIR/items_before.json" -w "%{http_code}" "$BASE_URL/api/items/")
if [[ "$code" == "200" ]] && jq -e 'type=="array"' "$OUT_DIR/items_before.json" >/dev/null 2>&1; then
  record "items_list_before" "PASS" "200 + array"
else
  record "items_list_before" "FAIL" "code=$code"
fi

# 3) Create item
payload='{"name":"E2E Regression Item","description":"api regression"}'
code=$(curl -s -o "$OUT_DIR/item_create.json" -w "%{http_code}" -X POST -H 'content-type: application/json' -d "$payload" "$BASE_URL/api/items/")
item_id=$(jq -r '.id // empty' "$OUT_DIR/item_create.json" 2>/dev/null || true)
if [[ "$code" == "201" ]] && [[ -n "$item_id" ]]; then
  record "item_create" "PASS" "201 + id=$item_id"
else
  record "item_create" "FAIL" "code=$code id=${item_id:-none}"
fi

if [[ -n "$item_id" ]]; then
  # 4) Get created item
  code=$(curl -s -o "$OUT_DIR/item_get.json" -w "%{http_code}" "$BASE_URL/api/items/$item_id")
  if [[ "$code" == "200" ]] && jq -e --arg id "$item_id" '.id==$id and .name=="E2E Regression Item"' "$OUT_DIR/item_get.json" >/dev/null 2>&1; then
    record "item_get" "PASS" "200 + data match"
  else
    record "item_get" "FAIL" "code=$code"
  fi

  # 5) Update item
  up='{"name":"E2E Regression Item Updated","description":"updated"}'
  code=$(curl -s -o "$OUT_DIR/item_update.json" -w "%{http_code}" -X PUT -H 'content-type: application/json' -d "$up" "$BASE_URL/api/items/$item_id")
  if [[ "$code" == "200" ]] && jq -e '.name=="E2E Regression Item Updated"' "$OUT_DIR/item_update.json" >/dev/null 2>&1; then
    record "item_update" "PASS" "200 + updated"
  else
    record "item_update" "FAIL" "code=$code"
  fi

  # 6) Delete item
  code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/items/$item_id")
  if [[ "$code" == "204" ]]; then
    record "item_delete" "PASS" "204"
  else
    record "item_delete" "FAIL" "code=$code"
  fi

  # 7) Get deleted item -> 404
  code=$(curl -s -o "$OUT_DIR/item_get_deleted.json" -w "%{http_code}" "$BASE_URL/api/items/$item_id")
  if [[ "$code" == "404" ]]; then
    record "item_get_deleted" "PASS" "404 as expected"
  else
    record "item_get_deleted" "FAIL" "code=$code"
  fi
else
  record "item_flow_followups" "FAIL" "skipped because create failed"
fi

cat > "$OUT_DIR/summary.md" <<EOF
# API Regression Summary

- Run ID: $RUN_ID
- Base URL: $BASE_URL
- Pass: $pass
- Fail: $fail
- Generated: $(date -u +%FT%TZ)

## Check Log
\`\`\`
$(cat "$OUT_DIR/checks.log")
\`\`\`
EOF

[[ $fail -eq 0 ]]
