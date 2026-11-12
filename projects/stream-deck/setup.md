# Stream Deck + setup sheet (Q, 12 November 2026)

For Kev, at the Mac in Boise, about 25 minutes. This covers the keys that need no plugin. The strip, the dials, the Join key and the time-based Sabbath page come with the free plugin (see `plugin/README.md` when it lands). Icons are in `design/v3/png/`: use the `-288.png` files (the device scales them down).

What I have not been able to test: all of this was prepared without access to your Mac or your deck. Anything marked TEST needs a quick check.

## Before you start

1. Open the Stream Deck app and make a new profile called **Eden** (this is the home page).
2. In System Settings, Keyboard, Keyboard Shortcuts, Mission Control, turn on **Switch to Desktop 1** to **4** (Control plus the number). Check each from the keyboard.
3. Drag each icon onto its key by right-clicking the key image and choosing the PNG, or by clicking the key and then the icon box.

## Home page (profile "Eden")

Changed 12 Nov: the lower row opens apps instead of switching desktops (the Control+number keys failed silently). The Desktop dial still switches desktops with Control+arrow.

| Key | Action to drag in | Setting | Icon file |
|---|---|---|---|
| Radar | System, Website | The Radar project link, claude.ai/project/ followed by its id. Open Radar in Claude and copy the address from the browser bar. | `key-radar-288.png` |
| Command | System, Website | https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW | `key-command-288.png` |
| Flow | Eden Deck, Open app | App `Wispr Flow`, tick **Also bring up its window**. TEST: it must open the Wispr Flow window while the app sits in the menu bar. If not, see the open question below. | `key-flow-288.png` |
| Join | Eden Deck, Join | Opens the meeting link, turns cream 15 minutes out | `key-join-idle-288.png` |
| Agenda | System, Open | The **Eden Day Board** Chrome app (installed from Chrome as an app; its name has a dash, which System, Open handles; the Eden Deck Open app key now accepts it too) | `key-agenda-dayboard-288.png` |
| Claude | System, Open | The Claude app | `key-claude-288.png` |
| Duet | System, Open (or Eden Deck, Open app) | The Chrome web app named Duet | `key-duet-288.png` |
| Music | System, Open | The Music app | `key-music-288.png` |

Set the title of each key to blank (the PNG already carries the word). The old numbered desktop icons (`key-desktop-*`) stay in the folder; the Sabbath page uses `key-music-288.png`.

## Zoom page (profile "Zoom")

1. Install Elgato's free Zoom plugin if it is not already there (you already use its mute, camera and share keys).
2. Make a profile called **Zoom** with the 8 keys below. In the profile's settings, set it to switch automatically to the Zoom app. The Stream Deck window must be minimized for automatic switching to work.

| Key | Action | Icon |
|---|---|---|
| Mic | Zoom plugin, mic toggle | `key-zoom-mic-live` and `key-zoom-mic-muted` (the key's two states) |
| Camera | Zoom plugin, camera toggle | `key-zoom-camera-on`, `key-zoom-camera-off` |
| Share | Zoom plugin, share screen | `key-zoom-share` |
| Chat | System, Hotkey, Shift+Cmd+H (was Breakout) | `key-zoom-chat` |
| Flow | Same as home (Open app, Wispr Flow, show window) | `key-flow` |
| Radar | Same as home | `key-radar` |
| Copy invite link | System, Hotkey, Shift+Cmd+I (was empty) | `key-zoom-copylink` |
| Leave | Zoom's own leave action. A normal press; the icon no longer says HOLD | `key-zoom-leave` |

Participants (Cmd+U, `key-zoom-participants-288.png`) is built but has no slot yet: see the open question below.

## Google Calendar page (profile "Google Calendar", new)

Make a profile called **Google Calendar** and set it to switch automatically to the Google Calendar app. Two keys, the rest blank:

| Key | Action | Icon |
|---|---|---|
| New event | System, Hotkey, the new-event shortcut for the Calendar app (try `c`, or open the Calendar app and press the button once to confirm) | `key-gcal-new-event` |
| Paste Zoom link | System, Text | Kev types his standing Zoom invite text (link and passcode) into the key's own text box. It lives only in the key's setting: it is not in this folder, not in the repo, not in any ticket. | `key-gcal-zoom-link` |

## Two questions for Kev

1. **Participants:** replace Radar on the Zoom page, or add a second Zoom page reached by swiping the strip? (Recommendation: replace Radar on the Zoom page. Radar is one tap away on the home page after the call, and a second page costs a swipe mid-call.)
2. **Flow:** should the key open the Wispr Flow window (current setup, needs the Show window tick and a TEST), or a Wispr shortcut that starts Notetaker directly? Answer after the TEST.

## Sabbath page

Switching by the clock (Friday sunset to Saturday sunset) comes with the plugin. Until then you can switch to a profile called **Rest** by hand: put only the Music key and `key-sabbath-rest-288.png` on it.

## What the plugin adds

The strip with your next meeting and its countdown, the four dials (Day, Desktop, Focus, Volume), the Join key and the automatic Sabbath page. It reads your Kev - Eden calendar through a private read-only address that only lives on your Mac.
