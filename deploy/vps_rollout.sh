#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f backend/.env ]; then
  echo "Missing backend/.env"
  exit 1
fi

docker compose build
docker compose up -d mongodb backend frontend nginx

"$ROOT_DIR/deploy/import_backup.sh"

if [ "${1:-}" != "" ]; then
  "$ROOT_DIR/deploy/rewrite_image_urls.sh" "$1"
fi

"$ROOT_DIR/deploy/check_stack.sh"
