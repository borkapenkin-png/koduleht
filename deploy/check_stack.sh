#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost}"

check() {
  local url="$1"
  echo
  echo "==> $url"
  curl -I --max-time 10 "$url"
}

check "$BASE_URL/"
check "$BASE_URL/api/settings"
check "$BASE_URL/referenssit"
check "$BASE_URL/ukk"
check "$BASE_URL/hintalaskuri"
check "$BASE_URL/tasoitustyot-helsinki"
check "$BASE_URL/__server-info"
