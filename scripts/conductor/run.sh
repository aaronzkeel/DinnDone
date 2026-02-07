#!/usr/bin/env bash
# Conductor workspace run — starts the dev server.

set -euo pipefail

PORT=3002

# Kill anything already on our port so the server can start clean
lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true

# Clear Next.js build cache for a clean start
rm -rf .next

echo "[conductor/run] Starting dev server on port $PORT..."
npm run dev
