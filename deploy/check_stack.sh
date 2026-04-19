#!/usr/bin/env bash
set -euo pipefail

FRONTEND_BASE_URL="${1:-http://127.0.0.1:13000}"
BACKEND_BASE_URL="${2:-http://127.0.0.1:18001}"

check() {
  local url="$1"
  echo
  echo "==> $url"
  curl -I --max-time 10 "$url"
}

check "$FRONTEND_BASE_URL/"
check "$BACKEND_BASE_URL/api/settings"
check "$FRONTEND_BASE_URL/referenssit"
check "$FRONTEND_BASE_URL/ukk"
check "$FRONTEND_BASE_URL/hintalaskuri"
check "$FRONTEND_BASE_URL/tasoitustyot-helsinki"
check "$FRONTEND_BASE_URL/__server-info"
