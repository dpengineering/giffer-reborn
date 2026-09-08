#!/usr/bin/env bash
# One-time setup for the classroom Ubuntu desktop.
#
# Works fully OFFLINE: it installs the site from the copy of this repo you run
# it out of (e.g. a folder you carried over on a USB stick), so the box never
# needs to reach github.com. Network steps (apt, git) are best-effort -- if they
# fail, setup keeps going with whatever is already on the machine.
#
# Run it once, from inside a copy of the repo:
#   sudo bash deploy/setup.sh
#
# After this, you never need to run it again -- just power the machine on.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run with sudo:  sudo bash deploy/setup.sh" >&2
  exit 1
fi

# The human who ran sudo. We install into their home and run the service as
# them (not root), so the served files own cleanly.
TARGET_USER="${SUDO_USER:-$USER}"
if [ "$TARGET_USER" = "root" ]; then
  echo "Run this with 'sudo' as your normal user, not as the root account." >&2
  exit 1
fi
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"

# Where this script (and thus this copy of the repo) actually lives, and where
# we want the site to live permanently.
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$TARGET_HOME/giffer-reborn"

echo "==> Installing dependencies (best effort; a blocked/offline box is fine) ..."
apt-get update -y || echo "  (apt update failed -- offline? continuing)"
# python3 = the server. git = optional auto-update. avahi = the .local name.
# figlet = the big projector banner (show-ip.sh falls back without it).
apt-get install -y python3 git avahi-daemon figlet \
  || echo "  (couldn't fetch some packages -- offline? continuing with what's here)"

# python3 is the one thing we truly cannot do without.
if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required but not present, and I couldn't install it." >&2
  echo "       Put this box on a network that allows apt (just long enough to" >&2
  echo "       'sudo apt-get install python3'), then re-run this script." >&2
  exit 1
fi
command -v git   >/dev/null 2>&1 || echo "  NOTE: git not found -- boot-time auto-update will be skipped (fine offline)."
command -v avahi-daemon >/dev/null 2>&1 || echo "  NOTE: avahi not installed -- the http://<name>.local address won't work."

echo "==> Placing the site at $REPO_DIR ..."
if [ "$SRC_DIR" = "$REPO_DIR" ]; then
  echo "  (already in place)"
else
  mkdir -p "$REPO_DIR"
  # Copy everything, including .git if this copy has one, so a later online
  # 'git pull' can still update it. Never reaches the network itself.
  cp -a "$SRC_DIR/." "$REPO_DIR/"
  chown -R "$TARGET_USER":"$TARGET_USER" "$REPO_DIR"
fi

chmod +x "$REPO_DIR/deploy/serve.sh" "$REPO_DIR/deploy/show-ip.sh"

echo "==> Installing the systemd service ..."
sed -e "s|__USER__|$TARGET_USER|g" \
    -e "s|__REPO_DIR__|$REPO_DIR|g" \
    "$REPO_DIR/deploy/giffer.service" > /etc/systemd/system/giffer.service

systemctl daemon-reload
systemctl enable --now giffer.service

sleep 1
echo
echo "==> Service status:"
systemctl --no-pager --full status giffer.service | head -n 10 || true

IP="$(ip route get 1.1.1.1 2>/dev/null \
      | awk '{for (i=1;i<=NF;i++) if ($i=="src"){print $(i+1); exit}}')"
echo
echo "======================================================================"
echo "  Giffer Reborn is now serving on this machine, and will start again"
echo "  automatically every time you power it on."
echo
echo "  Students open:   http://${IP:-<this-machine-IP>}"
echo "  Also works:      http://$(hostname).local"
echo
echo "  To show the big URL on the projector, open a terminal and run:"
echo "     $REPO_DIR/deploy/show-ip.sh"
echo "======================================================================"
