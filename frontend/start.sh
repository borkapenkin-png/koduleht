#!/bin/bash
# Frontend startup script with SEO generation
# Generates static HTML pages before starting the server

set -e

echo "=== Starting Frontend with SEO Generation ==="

# Generate SEO pages (requires MongoDB to be running)
echo "Generating static SEO pages..."
cd /app/backend
source /root/.venv/bin/activate 2>/dev/null || true
python generate_static_direct.py || echo "Warning: SEO generation failed, using existing files"

# Start the server
echo "Starting serve..."
cd /app/frontend
exec /usr/local/bin/serve build -l 3000
