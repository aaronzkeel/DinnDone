#!/usr/bin/env bash
# ------------------------------------------------------------
# dev-all.sh - start Convex dev + Next dev (via nukemac.sh)
# ------------------------------------------------------------
set -euo pipefail

if ! command -v npm > /dev/null 2>&1; then
  echo "npm is not installed or not on PATH."
  exit 1
fi

if ! command -v npx > /dev/null 2>&1; then
  echo "npx is not installed or not on PATH."
  exit 1
fi

if [ ! -f "./nukemac.sh" ]; then
  echo "nukemac.sh not found in $(pwd). Run from the project root."
  exit 1
fi

CONVEX_LOG="${CONVEX_LOG:-convex.dev.log}"

if command -v pgrep > /dev/null 2>&1 && pgrep -f "convex dev" > /dev/null 2>&1; then
  echo "Convex dev already running."
else
  echo "Starting Convex dev..."
  nohup npx convex dev > "$CONVEX_LOG" 2>&1 &
  echo "Convex dev logs -> $CONVEX_LOG"
fi

./nukemac.sh
