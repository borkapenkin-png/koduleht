#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HOST_IMAGE_BACKUP_PATH="${1:-}"

if [[ -z "$HOST_IMAGE_BACKUP_PATH" ]]; then
  echo "Usage: bash deploy/import_images_from_host.sh /host/path/images.json"
  exit 1
fi

CONTAINER_PATH="/app/images_import.json"

docker cp "$HOST_IMAGE_BACKUP_PATH" jb-backend:"$CONTAINER_PATH"
bash deploy/import_images.sh "$CONTAINER_PATH"
