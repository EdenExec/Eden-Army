#!/bin/bash
# Restart the Stream Deck app (fix for the deck showing only the Elgato logo, 13 Nov).
osascript -e 'tell application "Elgato Stream Deck" to quit' 2>/dev/null; sleep 3
open -a "Elgato Stream Deck" && echo "Stream Deck app restarted." || echo "Could not open the Stream Deck app."
