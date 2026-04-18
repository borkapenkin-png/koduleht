#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

docker compose exec -T backend sh -lc 'cd /app/backend && python /app/scripts/import_backup_to_mongo.py'
