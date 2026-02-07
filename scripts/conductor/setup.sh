#!/usr/bin/env bash
# Conductor workspace setup — runs once when a new worktree is created.
# Symlinks gitignored runtime files from the main repo into this worktree
# and installs dependencies.

set -euo pipefail

# CONDUCTOR_ROOT_PATH is set by Conductor to the main repo checkout path.
ROOT="${CONDUCTOR_ROOT_PATH:-}"
if [ -z "$ROOT" ]; then
  echo "[conductor/setup] CONDUCTOR_ROOT_PATH not set — skipping file sync."
  echo "[conductor/setup] Installing dependencies..."
  npm install
  exit 0
fi

echo "[conductor/setup] Root repo: $ROOT"
echo "[conductor/setup] Worktree:  $(pwd)"

# ── Symlink gitignored files from main repo ──────────────────────────────────
files_to_link=(
  .env
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local
)

for file in "${files_to_link[@]}"; do
  src="$ROOT/$file"
  dest="./$file"

  if [ -e "$dest" ] || [ -L "$dest" ]; then
    echo "[conductor/setup] $file already exists — skipping"
    continue
  fi

  if [ -e "$src" ]; then
    ln -s "$src" "$dest"
    echo "[conductor/setup] Linked $file"
  fi
done

# ── Symlink directories ─────────────────────────────────────────────────────
dirs_to_link=(
  .vercel
)

for dir in "${dirs_to_link[@]}"; do
  src="$ROOT/$dir"
  dest="./$dir"

  if [ -e "$dest" ] || [ -L "$dest" ]; then
    echo "[conductor/setup] $dir/ already exists — skipping"
    continue
  fi

  if [ -d "$src" ]; then
    ln -s "$src" "$dest"
    echo "[conductor/setup] Linked $dir/"
  fi
done

# ── Install dependencies ────────────────────────────────────────────────────
echo "[conductor/setup] Installing dependencies..."
npm install

echo "[conductor/setup] Done."
