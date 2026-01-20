#!/usr/bin/env bash
# ------------------------------------------------------------
# nukemac.sh - macOS-focused reset + restart helper
# ------------------------------------------------------------
set -euo pipefail

if ! command -v npm > /dev/null 2>&1; then
  echo "npm is not installed or not on PATH."
  exit 1
fi

PROJECT_DIR="$(pwd)"

DEFAULT_PORT=3002
PORT="${NUKEMAC_PORT:-${PORT:-}}"

extract_port_from_script() {
  local script="$1"
  printf '%s' "$script" \
    | grep -Eo '(^|[[:space:]])(-p[[:space:]]+|--port([[:space:]]+|=))[0-9]+' 2>/dev/null \
    | grep -Eo '[0-9]+' 2>/dev/null \
    | tail -n 1 \
    || true
}

if [ -z "$PORT" ]; then
  if command -v jq > /dev/null 2>&1; then
    DEV_SCRIPT="$(jq -r '.scripts.dev // ""' package.json 2>/dev/null || true)"
  elif command -v node > /dev/null 2>&1; then
    DEV_SCRIPT="$(node -p "require('./package.json').scripts.dev || ''" 2>/dev/null || true)"
  else
    DEV_SCRIPT=""
  fi

  PORT="$(extract_port_from_script "$DEV_SCRIPT")"
fi

PORT="${PORT:-$DEFAULT_PORT}"

echo "PROJECT_DIR=$PROJECT_DIR"
echo "PORT=$PORT"

LOCK_PATH=".next/dev/lock"
if [ -e "$LOCK_PATH" ]; then
  echo "Clearing Next.js dev lock ($LOCK_PATH)"
  if command -v lsof > /dev/null 2>&1; then
    LOCK_PIDS="$(lsof -t "$LOCK_PATH" 2>/dev/null || true)"
    if [ -n "$LOCK_PIDS" ]; then
      echo "Stopping processes holding $LOCK_PATH: $LOCK_PIDS"
      kill $LOCK_PIDS 2>/dev/null || true
      sleep 1
      kill -9 $LOCK_PIDS 2>/dev/null || true
    fi
  fi
  rm -f "$LOCK_PATH" 2>/dev/null || true
fi

echo "Clearing port $PORT"
if command -v lsof > /dev/null 2>&1; then
  PIDS="$(lsof -ti:"$PORT" 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    echo "Stopping processes on port $PORT: $PIDS"
    kill $PIDS 2>/dev/null || true
    sleep 1
    kill -9 $PIDS 2>/dev/null || true
  fi
else
  echo "lsof not found; skipping port cleanup."
fi

echo "Removing stale logs and build cache"
rm -f dev.log nohup.out 2>/dev/null || true
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .next/cache 2>/dev/null || true

echo "Relaunching dev server via npm..."
export TERM_ROLE=server
printf '\033]0;%s | %s\007' "$(basename "$PROJECT_DIR")" "$TERM_ROLE"

sleep 2
nohup npm run dev > dev.log 2>&1 &
SERVER_PID=$!

echo "Waiting for readiness (PID $SERVER_PID)..."
READY_MSG="ready in"
TIMEOUT=30
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  if grep -qi "$READY_MSG" dev.log 2>/dev/null || grep -q "Local:.*http://localhost:$PORT" dev.log 2>/dev/null; then
    echo "Server ready -> http://localhost:$PORT"
    exit 0
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

echo "Server did not report ready within $TIMEOUT seconds. Recent logs:"
tail -20 dev.log 2>/dev/null || echo "No logs yet."
exit 1
