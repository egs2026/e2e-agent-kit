#!/usr/bin/env bash
set -euo pipefail

CASE_FILE="${1:-}"
if [[ -z "$CASE_FILE" ]]; then
  echo "Usage: run-case.sh <case-json-file>"
  exit 1
fi

if [[ ! -f "$CASE_FILE" ]]; then
  echo "Case file not found: $CASE_FILE"
  exit 1
fi

node e2e/scripts/run-case.mjs "$CASE_FILE"
