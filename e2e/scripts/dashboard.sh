#!/usr/bin/env bash
set -euo pipefail

PROJECT_ARG="${1:-}"
PROJECT_OPT=""

if [[ -n "${PROJECT_KEY:-}" ]]; then
  PROJECT_OPT="--project=${PROJECT_KEY}"
fi

if [[ -n "$PROJECT_ARG" ]]; then
  PROJECT_OPT="--project=$PROJECT_ARG"
fi

node e2e/scripts/dashboard.mjs $PROJECT_OPT
