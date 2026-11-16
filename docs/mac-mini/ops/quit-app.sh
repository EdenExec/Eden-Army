#!/bin/bash
# Politely quit one named app. No force quit without Kev's yes.
[ -z "$1" ] && { echo "usage: quit-app.sh \"App Name\""; exit 2; }
pgrep -xq "$1" || { echo "$1 is not running."; exit 0; }
osascript -e "tell application \"$1\" to quit" && sleep 2
pgrep -xq "$1" && echo "$1 did not quit." || echo "$1 quit."
