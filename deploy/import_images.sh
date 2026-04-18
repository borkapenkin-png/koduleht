#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

IMAGE_BACKUP_PATH="${1:-}"

if [[ -z "$IMAGE_BACKUP_PATH" ]]; then
  echo "Usage: bash deploy/import_images.sh /path/to/images.json"
  exit 1
fi

docker compose exec -T -e BACKUP_PATH="$IMAGE_BACKUP_PATH" backend sh -lc 'cd /app/backend && python /app/scripts/import_images_to_mongo.py'
