#!/usr/bin/env bash
set -euo pipefail

FRONTEND_BASE_URL="${1:-http://127.0.0.1:13000}"
BACKEND_BASE_URL="${2:-http://127.0.0.1:18001}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-20}"
SLEEP_SECONDS="${SLEEP_SECONDS:-3}"

check() {
  local url="$1"
  echo
  echo "==> $url"
  curl -I --max-time 10 "$url"
}

wait_for() {
  local url="$1"
  local attempt=1

  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    echo
    echo "==> [$attempt/$MAX_ATTEMPTS] $url"
    if curl -I --max-time 10 "$url"; then
      return 0
    fi

    if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
      sleep "$SLEEP_SECONDS"
    fi
    attempt=$((attempt + 1))
  done

  echo "Health check failed after $MAX_ATTEMPTS attempts: $url" >&2
  return 1
}

wait_for "$BACKEND_BASE_URL/api/settings"
wait_for "$FRONTEND_BASE_URL/__server-info"
check "$FRONTEND_BASE_URL/"
check "$FRONTEND_BASE_URL/referenssit"
check "$FRONTEND_BASE_URL/ukk"
check "$FRONTEND_BASE_URL/hintalaskuri"
check "$FRONTEND_BASE_URL/tasoitustyot-helsinki"
