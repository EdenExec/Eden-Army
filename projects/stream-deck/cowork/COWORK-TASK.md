# Cowork task: set up Kev's Stream Deck +

Paste the block under "The task" into a new Cowork task, with this kit folder connected. Written by Q, 12 November 2026.

## The task

You are setting up an Elgato Stream Deck + (8 keys, a touch strip, 4 dials) on this Mac for Kev. The kit folder has everything: `setup.md` (the key-by-key plan), `icons/` (key faces, use the `-288.png` files), `plugin/com.kdtw.edendeck.streamDeckPlugin` (a private plugin called Eden Deck), and `design/contact-sheet.png` (what the finished deck should look like).

Read `setup.md` and `design/contact-sheet.png` first. Then work in the Stream Deck app, one step at a time:

1. Open the Stream Deck app. Note its version (it must be 7.1 or later; if older, stop and tell Kev).
2. Install the plugin by opening `plugin/com.kdtw.edendeck.streamDeckPlugin`. Confirm "Eden Deck" shows under Keys (Join, Open link, Open app, Desktop key) and under Dials (Day, Desktop, Focus, Volume).
3. Create a profile named **Eden** for the Stream Deck +, and build the home page from `setup.md`: top row Radar, Command, Flow, Join; bottom row Agenda, Claude, Duet, Music. Give every key its icon from `icons/` and clear the key title (the picture already carries the word).
   - Radar: System, Website. Ask Kev for the full Radar link (it starts claude.ai/project/). Do not guess it.
   - Command: System, Website, https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW
   - Flow: Eden Deck, Open app, the app named Wispr Flow, with "Also bring up its window" ticked.
   - Join: Eden Deck, Join.
   - Bottom row opens apps (changed 12 Nov, the Control+number keys failed silently): Agenda = System, Open, the Eden Day Board Chrome app; Claude = System, Open, the Claude app; Duet = System, Open, the Duet Chrome app; Music = System, Open, the Music app. Icons: key-agenda-dayboard, key-claude, key-duet, key-music (no desktop numbers).
4. Dials: put Eden Deck Day, Desktop, Focus and Volume on dials 1, 2, 3, 4 in that order.
5. Create a second profile named **Zoom** with the 8 keys in `setup.md` (Elgato's Zoom plugin for Mic, Camera, Share; Flow and Radar as on the home page; Leave). Set it to switch automatically when Zoom is in front. Key 4 is Chat (System, Hotkey, Shift+Cmd+H) and the key that was empty is Copy invite link (System, Hotkey, Shift+Cmd+I). Leave is a normal press with the new icon (no HOLD). Participants (Cmd+U) has no slot yet: leave it off and say so.
5a. Create a third profile named **Google Calendar**, set to switch automatically when Google Calendar is in front: key 1 New event (System, Hotkey, Google Calendar's new-event shortcut; confirm it in the app), key 2 Paste Zoom link (System, Text). Do not type or ask for the Zoom invite text: Kev types it into the key's text box himself. Never read, copy or log it.
6. Stop and hand over to Kev for these three things, which only Kev does:
   - Pasting the Google Calendar "secret address in iCal format" into the Eden Deck calendar setting (click Join or the Day dial and use the panel at the bottom). Never read, copy, log or repeat that address. It is a password.
   - Typing his Zoom invite text into the Paste Zoom link key.
   - Clicking Allow on any macOS permission prompt (Accessibility, Automation, files). Do not change System Settings permissions yourself.
   - Pressing the real keys and dials to confirm they work.
7. Check what you can without the secret: press each new app key and say which ones open their app, especially Flow (does the Wispr Flow window appear?). Take a screenshot of each page of the deck in the app.
8. Export the Eden, Zoom and Google Calendar profiles (in the app, right-click a profile and choose Export) into the kit folder's `exports/` folder.
9. Write `report.md` in the kit folder: what you set up, what you could not do, anything that behaved differently from `setup.md`, and the macOS and Stream Deck versions.

Rules: change only the Eden, Zoom and Google Calendar profiles and the Eden Deck plugin. Do not delete or edit any other profile, app, file or setting. Do not open email, messages or documents. Do not enter or look up passwords. If a step does not match what you see, stop and ask Kev instead of improvising.
