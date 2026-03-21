#!/usr/bin/env bash
set -euo pipefail

echo "== Daily Gate: Preflight =="
npm run check:endpoints

echo "== Daily Gate: API Smoke =="
npm run smoke:api

echo "== Daily Gate: UI Regression (P0+P1) =="
npm run regression

echo "== Daily Gate: PASS =="
