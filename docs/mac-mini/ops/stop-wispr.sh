#!/bin/bash
# Stop a Wispr Flow recording without reading anything it captured (Kev, 13 Nov).
# 1) Ask the app to quit politely, which ends any recording. 2) Report the result.
# Never opens, reads, copies or exports a note, dictation or transcript.
if ! pgrep -xq "Wispr Flow"; then echo "Wispr Flow is not running."; exit 0; fi
osascript -e 'tell application "Wispr Flow" to quit' 2>/dev/null
sleep 3
if pgrep -xq "Wispr Flow"; then echo "Wispr Flow is still running: ask Kev before a force quit."; exit 1; fi
echo "Wispr Flow stopped (app quit)."
