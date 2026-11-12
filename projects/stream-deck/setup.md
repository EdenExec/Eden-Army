# Stream Deck + setup sheet (Q, 12 November 2026)

For Kev, at the Mac in Boise, about 25 minutes. This covers the keys that need no plugin. The strip, the dials, the Join key and the time-based Sabbath page come with the free plugin (see `plugin/README.md` when it lands). Icons are in `design/v3/png/`: use the `-288.png` files (the device scales them down).

What I have not been able to test: all of this was prepared without access to your Mac or your deck. Anything marked TEST needs a quick check.

## Before you start

1. Open the Stream Deck app and make a new profile called **Eden** (this is the home page).
2. In System Settings, Keyboard, Keyboard Shortcuts, Mission Control, turn on **Switch to Desktop 1** to **4** (Control plus the number). Check each from the keyboard.
3. Drag each icon onto its key by right-clicking the key image and choosing the PNG, or by clicking the key and then the icon box.

## Home page (profile "Eden")

| Key | Action to drag in | Setting | Icon file |
|---|---|---|---|
| Radar | System, Website | The Radar project link, claude.ai/project/ followed by its id. I do not have the id and have not guessed it: open Radar in Claude and copy the address from the browser bar. | `key-radar-288.png` |
| Command | System, Website | https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW | `key-command-288.png` |
| Flow | System, Open | The Wispr Flow desktop app (pick it from the Applications list). It opens the app; it does not start dictation. | `key-flow-288.png` |
| Join | leave blank for now | The plugin fills this (opens the meeting link, turns cream 15 minutes out) | `key-join-idle-288.png` |
| 1 Agenda | see "Desktop 1" below | | `key-desktop-1-agenda-288.png` |
| 2 Claude | Hotkey Control+2 | | `key-desktop-2-claude-288.png` |
| 3 LinkedIn | Hotkey Control+3 | | `key-desktop-3-linkedin-288.png` |
| 4 Music | Hotkey Control+4 | | `key-desktop-4-music-288.png` |

Set the title of each key to blank (the PNG already carries the word).

### Desktop 1 (Agenda) needs a trick

Apple gives full-screen and split-screen spaces no number, so Control+1 may not reach your Agenda desktop. TEST: press Control+1 on the keyboard from another desktop. If it works, use a Hotkey Control+1. If not, either:

- install Google Calendar as its own Chrome app (in Chrome, the three dots menu, Cast, save and share, install the page as an app), put it full screen with the Eden Daily beside it, and use **System, Open** with that app, or
- use the plugin's Desktop key with "open app instead" (it does the same thing).

## Zoom page (profile "Zoom")

1. Install Elgato's free Zoom plugin if it is not already there (you already use its mute, camera and share keys).
2. Make a second profile called **Zoom** and give it the 8 keys below. In the profile's settings, set it to switch automatically to the Zoom app. The Stream Deck window must be minimized for automatic switching to work.

| Key | Action | Icon |
|---|---|---|
| Mic | Zoom plugin, mic toggle | `key-zoom-mic-live` and `key-zoom-mic-muted` (use the two as the key's two states) |
| Camera | Zoom plugin, camera toggle | `key-zoom-camera-on`, `key-zoom-camera-off` |
| Share | Zoom plugin, share screen | `key-zoom-share` |
| Breakout | TEST: open Zoom, Settings, Keyboard Shortcuts, and look for a breakout rooms shortcut. I did not find one. If there is none, we use a small Shortcuts action that clicks the Breakout rooms button (needs Accessibility permission). | `key-zoom-breakout` |
| Flow | Same as home (System, Open, Wispr Flow) | `key-flow` |
| Radar | Same as home | `key-radar` |
| Leave | Zoom's own leave action if the plugin has one. TEST press-and-hold: if the software has no hold option, keep it a normal key but make it a two-step (a "Leave meeting" confirm). | `key-zoom-leave` |

## Sabbath page

Switching by the clock (Friday sunset to Saturday sunset) comes with the plugin. Until then you can switch to a profile called **Rest** by hand: put only the Music desktop key and `key-sabbath-rest-288.png` on it.

## What the plugin adds

The strip with your next meeting and its countdown, the four dials (Day, Desktop, Focus, Volume), the Join key and the automatic Sabbath page. It reads your Kev - Eden calendar through a private read-only address that only lives on your Mac.
