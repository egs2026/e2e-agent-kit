#!/usr/bin/env bash
set -euo pipefail

STAGING_URL="${STAGING_URL:-https://staging.egsmyapps.biz.id}"
REPORTS_URL="${REPORTS_URL:-https://reports.egsmyapps.biz.id}"
MCP_URL="${MCP_URL:-https://mcp.egsmyapps.biz.id}"

check() {
  local name="$1"
  local url="$2"
  local expected="$3" # comma-separated list, e.g. "200,302"

  local code
  code=$(curl -k -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

  IFS=',' read -r -a expected_codes <<< "$expected"
  for ok in "${expected_codes[@]}"; do
    if [[ "$code" == "$ok" ]]; then
      printf "[PASS] %-26s %-4s %s\n" "$name" "$code" "$url"
      return 0
    fi
  done

  printf "[FAIL] %-26s %-4s (expected one of %s) %s\n" "$name" "$code" "$expected" "$url"
  return 1
}

failures=0

echo "== Endpoint Validation =="
check "Staging App" "$STAGING_URL" "200,302" || failures=$((failures+1))
check "Staging Health" "$STAGING_URL/health" "200" || failures=$((failures+1))
check "Login Page" "$STAGING_URL/login" "200" || failures=$((failures+1))
check "Dashboard" "$STAGING_URL/dashboard" "200,302,303" || failures=$((failures+1))
check "Core Create" "$STAGING_URL/app/core/new" "200,302,303" || failures=$((failures+1))
check "Reports Portal" "$REPORTS_URL" "200" || failures=$((failures+1))
check "MCP Health" "$MCP_URL/healthz" "200" || failures=$((failures+1))
check "MCP Endpoint (no token)" "$MCP_URL/mcp" "401" || failures=$((failures+1))

echo
if [[ $failures -eq 0 ]]; then
  echo "All endpoint checks passed."
  exit 0
else
  echo "$failures check(s) failed."
  exit 1
fi
