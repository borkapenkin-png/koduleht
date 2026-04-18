#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_PATH_ARG="${1:-}"

if [[ -n "$BACKUP_PATH_ARG" ]]; then
  docker compose exec -T -e BACKUP_PATH="$BACKUP_PATH_ARG" backend sh -lc 'cd /app/backend && python /app/scripts/import_backup_to_mongo.py'
else
  docker compose exec -T backend sh -lc 'cd /app/backend && python /app/scripts/import_backup_to_mongo.py'
fi
