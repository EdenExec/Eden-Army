#!/bin/bash
# Mac mini status for Claude (read-only). App names and machine state only; never content.
echo "Time: $(date '+%a %d %b %Y %H:%M %Z')"
echo "Awake since: $(sysctl -n kern.waketime 2>/dev/null | awk -F'[ ,]' '{print $4}' | xargs -I{} date -r {} '+%H:%M' 2>/dev/null || echo unknown)"
for app in "Wispr Flow" "zoom.us" "Music" "Stream Deck" "Claude" "Google Chrome" "Superhuman"; do
  if pgrep -xq "$app"; then echo "Running: $app"; else echo "Not running: $app"; fi
done
pmset -g batt | head -1
df -h / | awk 'NR==2{print "Disk free: "$4}'
