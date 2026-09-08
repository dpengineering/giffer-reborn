#!/usr/bin/env bash
# Serve the Giffer Reborn static site for the classroom.
#
# This is what the systemd service (giffer.service) runs on boot, but you can
# also run it by hand. On boot it makes a best-effort attempt to pull the latest
# lesson content, then serves the repo over HTTP.
#
# Manual test (no root needed on a high port):
#   GIFFER_PORT=8000 deploy/serve.sh
set -euo pipefail

# --- Config -----------------------------------------------------------------
PORT="${GIFFER_PORT:-80}"   # keep in sync with show-ip.sh
# The repo is the parent of this script's own directory (deploy/..).
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# ----------------------------------------------------------------------------

cd "$REPO_DIR"

# Best-effort content refresh. NEVER fail the boot because the network (or a
# district-blocked GitHub) is unreachable -- just serve whatever we already have.
if [ -d .git ]; then
  echo "Updating lesson content from git (best effort)..."
  timeout 30 git pull --ff-only \
    || echo "  -> couldn't update; serving the copy already on disk."
fi

echo "Serving $REPO_DIR on port $PORT ..."
# --bind 0.0.0.0 so other machines on the LAN can reach it, not just localhost.
exec python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$REPO_DIR"
