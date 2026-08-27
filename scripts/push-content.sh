#!/usr/bin/env bash
# Pushes every file under content/ to the lowlevelnotes-assets R2 bucket,
# using its path relative to content/ as the R2 key — which is exactly
# lessons.content_path, so no mapping step is needed. content/ itself is
# gitignored: this is the only way lesson content reaches the live site,
# it never goes through git.
#
# Usage: npm run content:push
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTENT_DIR="$REPO_ROOT/content"
BUCKET="lowlevelnotes-assets"

if [ ! -d "$CONTENT_DIR" ]; then
  echo "No content/ directory found at $CONTENT_DIR — nothing to push."
  exit 0
fi

content_type_for() {
  case "$1" in
    *.md) echo "text/markdown; charset=utf-8" ;;
    *.png) echo "image/png" ;;
    *.jpg|*.jpeg) echo "image/jpeg" ;;
    *.gif) echo "image/gif" ;;
    *.pdf) echo "application/pdf" ;;
    *) echo "application/octet-stream" ;;
  esac
}

cd "$REPO_ROOT/worker"

find "$CONTENT_DIR" -type f | while IFS= read -r file; do
  key="${file#"$CONTENT_DIR"/}"
  content_type="$(content_type_for "$file")"
  echo "Pushing $key ($content_type)..."
  npx wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="$content_type" --remote
done

echo "Done."
