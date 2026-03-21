#!/usr/bin/env bash
set -euo pipefail

# Zero-downtime static frontend deploy (atomic symlink swap)
# Usage:
#   bash deploy/frontend-deploy.sh /path/to/dist

SRC_DIR="${1:-dist}"
APP_NAME="e2e-frontend"
BASE_DIR="/var/www/${APP_NAME}"
RELEASES_DIR="${BASE_DIR}/releases"
CURRENT_LINK="${BASE_DIR}/current"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
NEW_RELEASE="${RELEASES_DIR}/${TS}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source directory not found: $SRC_DIR"
  exit 1
fi

mkdir -p "$RELEASES_DIR"
mkdir -p "$NEW_RELEASE"

# Copy build artifacts
rsync -a --delete "$SRC_DIR/" "$NEW_RELEASE/"

# Atomic switch
ln -sfn "$NEW_RELEASE" "$CURRENT_LINK"

# Keep last 5 releases
cd "$RELEASES_DIR"
ls -1dt */ 2>/dev/null | tail -n +6 | xargs -r rm -rf

cat <<EOF
Deploy complete.
Current release: $NEW_RELEASE
Current symlink: $CURRENT_LINK

Nginx root should point to:
  ${CURRENT_LINK}

Quick checks:
  curl -I https://e2e.egsmyapps.biz.id
  curl -I https://e2e.egsmyapps.biz.id/health
EOF
