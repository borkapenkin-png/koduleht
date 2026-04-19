#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f backend/.env ]; then
  echo "Missing backend/.env"
  exit 1
fi

FRONTEND_BASE_URL="${FRONTEND_BASE_URL:-http://127.0.0.1:13000}"
BACKEND_BASE_URL="${BACKEND_BASE_URL:-http://127.0.0.1:18001}"
IMPORT_BACKUP_ON_DEPLOY="${IMPORT_BACKUP_ON_DEPLOY:-false}"
REWRITE_IMAGE_URLS_TARGET="${REWRITE_IMAGE_URLS_TARGET:-${1:-}}"

docker compose build backend frontend
docker compose up -d mongodb backend frontend

if [ "$IMPORT_BACKUP_ON_DEPLOY" = "true" ]; then
  bash "$ROOT_DIR/deploy/import_backup.sh"
fi

if [ -n "$REWRITE_IMAGE_URLS_TARGET" ]; then
  bash "$ROOT_DIR/deploy/rewrite_image_urls.sh" "$REWRITE_IMAGE_URLS_TARGET"
fi

bash "$ROOT_DIR/deploy/check_stack.sh" "$FRONTEND_BASE_URL" "$BACKEND_BASE_URL"
