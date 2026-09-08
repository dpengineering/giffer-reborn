#!/usr/bin/env bash
# Show the classroom URL in big text for the projector / whiteboard.
#
# Re-checks every few seconds, so the URL stays correct even if the network
# comes up late or the DHCP lease changes. Run it in a terminal you project:
#   deploy/show-ip.sh
# Press Ctrl+C to close.
PORT="${GIFFER_PORT:-80}"   # keep in sync with serve.sh

get_ip() {
  # The address on the interface that actually reaches the outside world.
  ip route get 1.1.1.1 2>/dev/null \
    | awk '{for (i = 1; i <= NF; i++) if ($i == "src") { print $(i + 1); exit }}'
}

make_url() {  # $1 = host
  if [ "$PORT" = "80" ]; then echo "http://$1"; else echo "http://$1:$PORT"; fi
}

while true; do
  IP="$(get_ip)"
  [ -z "$IP" ] && IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
  URL="$(make_url "${IP:-<waiting for network>}")"
  HOSTURL="$(make_url "$(hostname).local")"

  clear
  echo
  echo "   Open Giffer Reborn on your Chromebook's browser:"
  echo
  if command -v figlet >/dev/null 2>&1; then
    figlet -w "$(tput cols 2>/dev/null || echo 120)" "$URL" 2>/dev/null || echo "      $URL"
  else
    echo "   =================================================="
    echo "        $URL"
    echo "   =================================================="
  fi
  echo
  echo "   ...or, if that doesn't work:   $HOSTURL"
  echo
  echo "   (checked $(date '+%-I:%M %p') — updates on its own. Ctrl+C to close.)"
  sleep 5
done
