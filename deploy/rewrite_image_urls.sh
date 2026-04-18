#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: $0 https://your-domain.tld"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_BASE_URL="$1"

cd "$ROOT_DIR"

docker compose exec -T \
  -e TARGET_BASE_URL="$TARGET_BASE_URL" \
  backend \
  sh -lc 'cd /app/backend && python /app/scripts/rewrite_image_urls.py'
