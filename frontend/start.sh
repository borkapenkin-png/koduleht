#!/bin/bash
set -e

echo "=== Starting SPA frontend ==="
cd /app/frontend

if [ ! -f build/index.html ]; then
  echo "No SPA build found, running production build first..."
  npm run build
fi

exec npm start
