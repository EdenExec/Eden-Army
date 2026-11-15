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
| Flow | Eden Deck, Open app | App `Wispr Flow`, tick **Also bring up its window**, and set **Menu item to click** to `Open Wispr Flow`. Wispr Flow lives in the menu bar and plain "open app" does nothing while it runs; the key clicks the Flow menu bar icon and chooses Open Wispr Flow, which is how Wispr's own help says to open the window. Needs the Accessibility permission (same as the dials). TEST. | `key-flow-288.png` |
| Duet (top right, replaces Join, 12 Nov) | System, Open | The Duet Chrome app. The old Join key opened the Zoom, Meet or Teams link of your next meeting when it was within 30 minutes, and needed the calendar address pasted in; it is out of the layout for now (the action stays in the plugin). Duet now appears once, top right. | `key-duet-288.png` |
| Agenda | System, Open | The **Eden Day Board** Chrome app. It still errors on Kev's deck (12 Nov). Likely cause: the name typed in is the page title ("Eden Day Board – Claude artifact"), not the app's real name. Fix: in System, Open, click the file picker and choose the app itself (in Finder: your home folder, Applications, Chrome Apps) instead of typing a name. If it still fails, use System, Website with https://claude.ai/artifact/4QFTb8NFvWhbc2jg5zD4hc (opens in the browser, not as an app window). | `key-agenda-dayboard-288.png` |
| Zoom (replaces Claude, 12 Nov) | System, Open | The Zoom app (zoom.us) | `key-zoom-app-288.png` |
| Crelate (replaces LinkedIn and the second Duet, 12 Nov) | System, Open | The Crelate desktop app (blue cr icon in the Dock) | `key-crelate-288.png` |
| Music | System, Open | The Music app. It opens the app wherever you are; it is not tied to a desktop (the old Control+4 version is gone) | `key-music-288.png` |

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
| Participants | System, Hotkey, Cmd+U (replaces Radar on this page; Radar is on the home page) | `key-zoom-participants` |
| Copy invite link | System, Hotkey, Shift+Cmd+I (was empty) | `key-zoom-copylink` |
| Leave | Zoom's own leave action. A normal press; the icon no longer says HOLD | `key-zoom-leave` |

Default chosen 12 Nov so the work can move: Participants takes the slot Radar had on the Zoom page. Kev can swap it back.

## Google Calendar page (profile "Google Calendar", new)

Make a profile called **Google Calendar** and set it to switch automatically to the Google Calendar app. Two keys, the rest blank:

| Key | Action | Icon |
|---|---|---|
| New event | System, Hotkey, the new-event shortcut for the Calendar app (try `c`, or open the Calendar app and press the button once to confirm) | `key-gcal-new-event` |
| Paste Zoom link | System, Text | Kev types his standing Zoom invite text (link and passcode) into the key's own text box. It lives only in the key's setting: it is not in this folder, not in the repo, not in any ticket. | `key-gcal-zoom-link` |

## Two questions for Kev

1. **Participants** (decided as a default, change if you disagree): it replaces Radar on the Zoom page. Radar is one tap away on the home page after the call, and a second Zoom page would cost a swipe mid-call.
2. **Flow:** should the key open the Wispr Flow window (current setup, needs the Show window tick and a TEST), or a Wispr shortcut that starts Notetaker directly? Answer after the TEST.

## Keeping the Eden skin in every app

The deck shows the **default profile** whenever the app in front has no profile of its own. So: make Eden the default profile for the Stream Deck + (profile list, right-click Eden, or its settings; wording may be "Set as default"), and remove the automatic app assignment from any old profile (do not delete the profiles). Only Zoom and Google Calendar keep an app assignment. Smart Profiles only switch while the Stream Deck window is minimized, so if the layout does not change, minimize the window first. TEST: bring Claude, Music, Finder and Chrome to the front and check that Eden stays up.

## Sabbath page

Replaced in v7 (15 Nov 2026): see "Sabbath mode, Cross and wake" below. The plugin now switches to a bundled **Eden Rest** profile by the clock.

## What the plugin adds

The strip with your next meeting and its countdown, the four dials (Day, Desktop, Focus, Volume), the Join key and the automatic Sabbath page. It reads your Kev - Eden calendar through a private read-only address that only lives on your Mac.

## Music page (profile "Music", Kev 13 Nov 2026)

Switches automatically when the Music app is in front. Built-in Stream Deck › Multimedia actions unless noted.

| Key | Action | Icon |
|---|---|---|
| Back | Multimedia › Previous Track | `key-music-prev-288.png` |
| Play/Pause | Multimedia › Play/Pause | `key-music-playpause-288.png` |
| Next | Multimedia › Next Track | `key-music-next-288.png` |
| Now playing | System › Hotkey, Cmd+L (Go to Current Song). TEST | `key-music-now-288.png` |
| Vol – | Multimedia › Volume Down | `key-music-voldown-288.png` |
| Vol + | Multimedia › Volume Up | `key-music-volup-288.png` |
| Mute | Multimedia › Mute | `key-music-mute-288.png` |
| Eden | Stream Deck › Switch Profile › Eden | `key-music-eden-288.png` |

Shuffle (`key-music-shuffle-288.png`) is optional: Music has no built-in shortcut, so Kev adds one under App Shortcuts first. Dials copy Eden's (Volume on dial 4).
The Start (`key-start-288.png`) and WORD (`key-word-288.png`) keys sit on Eden page 2; the Mando profile is in `docs/streamdeck/morning-button.md`.

## Sabbath mode, Cross and wake (v7, Q, 15 Nov 2026)

Kev's asks of 14 Nov: on the Sabbath only the Cross, Barny's Workshop, Music and Gemini; a clock and REST on the strip; the Cross and nothing else whenever the Mac is on the screen saver, locked or waking; the Mando chime and Eden back on wake. **Marked steps are Kev's** (passwords, macOS permissions, installs). Nothing here changes a System Setting by itself.

### What the deck does

| When | Keys | Strip |
|---|---|---|
| Normal (Eden) | as in this sheet | meeting, focus, volume |
| **Sabbath**: Friday sunset to Sunday 8 PM Boise (setting) | Barny's Workshop, Music, Gemini, **Cross top right**; every other key blank | REST (with "until sundown Sat" until Saturday sunset), a plain clock across dials 2 and 3, volume on dial 4 |
| **Screen saver, locked or display off** (any day) | **Cross top right**, nothing else | blank |
| Wake or unlock | Mando chime plays once; deck returns to Eden (Eden Rest on the Sabbath). No pages open. | |

The Cross wins over everything: a locked Mac on the Sabbath shows the Cross alone, and on unlock goes to the Sabbath layout, not Eden.

### Step 1. Install the plugin (Kev opens it; Cowork can do the rest)

1. Open `plugin/com.kdtw.edendeck.streamDeckPlugin` and replace the installed Eden Deck (v0.2.0). **Kev:** click Install if the app asks.
2. The plugin carries two profiles, **Eden Rest** and **Eden Cross**. Stream Deck asks to install them the first time the plugin switches to one. **Kev:** click Install. Or test now: in the Stream Deck app, Profiles, Import, the two `.streamDeckProfile` files from the plugin folder.
3. Check Eden Rest: top row Barny's, Music, Gemini, Cross; dials Day, Desktop, Focus, Volume; all else blank. Check Eden Cross: Cross top right only, no dials.
4. **Gemini name.** The key opens the app named `Gemini` (it looks in the system, then /Applications, ~/Applications and ~/Applications/Chrome Apps.localized). If the installed app has another name, click the key in Eden Rest and type the exact name in "App name". The label on the key follows the name.
5. **Sunday cut-off.** Click any Eden Deck dial; the panel has "Sabbath ends Sunday at" (blank means 8 PM; type `sundown` for Saturday sunset). OPEN QUESTION for Kev.
6. Do **not** put an app assignment on Eden Rest or Eden Cross. The plugin switches them. Keep Music's own Music profile: pressing Music on the Sabbath brings up its play and volume keys, and leaving Music puts Rest back (checked every 3 seconds). TEST.

If Stream Deck will not import the two profile files (their format is Elgato's own and I could not test it here), build them by hand: a profile named exactly **Eden Rest** and one named **Eden Cross**, with the keys in the table above (use the Eden Deck actions Open link, Open app, Cross, and the four dials), export each, and copy the export over the file of the same name inside the plugin folder (`~/Library/Application Support/com.elgato.StreamDeck/Plugins/com.kdtw.edendeck.sdPlugin/`), then `streamdeck restart com.kdtw.edendeck` or quit and reopen Stream Deck.

### Step 2. Icons

In `icons/`: `key-cross-144.png` and `-288.png` (and `key-cross-dim-*`), `key-barnys-workshop-*`, `key-gemini-*`, plus the existing `key-music-288.png`. The plugin draws these faces itself on Eden Rest; the PNGs are for hand-built profiles.

### Step 3. Screen saver (Kev)

Folder `screensaver/Sabbath-Cross/` has two flat images: a near-black field with one thin cream cross in the middle (3840 x 2160 and 5120 x 2880). No app needed.

1. Copy the folder to `~/Pictures/Sabbath-Cross` (Finder).
2. **Kev:** System Settings, Screen Saver. Scroll to the pictures section, choose **Other / Choose Folder**, and pick `Sabbath-Cross`.
3. Choose the style **Classic** or a plain slideshow with no motion. Do not use Ken Burns or Shifting Tiles: they move the Cross off centre.
4. Optional: also set it as the wallpaper for a quiet desktop (Wallpaper, Add Folder or Photo).
5. A `.saver` file would show the Cross with no picture-folder quirks, but it needs Xcode on a Mac; not built.

### Step 4. Keep the Mac awake (Kev)

The deck must stay alive and the helper must keep running, so the Mac must not go to sleep. The screen saver and display-off are fine. **Kev:** System Settings, Lock Screen: set "Start Screen Saver when inactive" and "Turn display off" to the times you like. System Settings, Battery (or Energy on a desktop Mac): turn on **Prevent automatic sleeping when the display is off**; on a laptop also "Wake for network access". A Mac mini or iMac stays awake with the display off by default. I never change these.

Wanted: **Require password** after the saver starts. With it, the deck stays on the Cross until the password is typed, then the chime plays. Without it, the chime plays as soon as the saver stops.

### Step 5. The helper (Kev builds once, Cowork can then run the test)

It watches `com.apple.screensaver.didstart / didstop` and `com.apple.screenIsLocked / screenIsUnlocked`, plus display sleep and wake. While any is on it writes `{"state":"cross"}` to `~/.edendeck/screen.json`; when all are off it writes `{"state":"awake"}` and plays `~/Music/Stream Deck/start-mando.mp3` once (the file v6 already put there). It opens no pages.

Why a state file and not a port or a second profile trick: the plugin is the only thing allowed to switch profiles (Stream Deck lets only a plugin do it), so the helper only has to say what the screen is doing. A file needs no network port, no permission, survives a plugin restart (the plugin reads it on start) and is easy to test by hand. A broken or missing file counts as "awake", so the deck can never be stuck on the Cross.

1. **Kev (Terminal, needs Xcode Command Line Tools; macOS offers to install them the first time):**
   ```
   mkdir -p ~/.edendeck/bin
   swiftc -O -o ~/.edendeck/bin/EdenWake helper/EdenWake.swift
   ```
   If no compiler: `xcode-select --install`, then repeat.
2. Test without locking: `~/.edendeck/bin/EdenWake cross` (the deck shows the Cross), then `~/.edendeck/bin/EdenWake awake` (the chime plays, the deck returns to Eden).
3. **Kev:** install the LaunchAgent, which starts the helper at every login:
   ```
   cp helper/com.kdtw.edenwake.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.kdtw.edenwake.plist
   ```
   Log (state names only): `/tmp/edenwake.log`. Remove: `launchctl unload ~/Library/LaunchAgents/com.kdtw.edenwake.plist`.
4. Test for real: start the screen saver (hot corner or wait). The deck shows the Cross alone. Move the mouse, enter the password: chime, Eden returns. TEST that the Stream Deck still draws while the Mac is locked; if it goes black the deck follows the Mac's display and that is fine.

### The Start key and the 4:45 job

The old Start key (page 2 of Eden) opened the day's pages after the chime. For everyday wakes the helper now does the chime and returns the deck, and opens nothing. Leave the Start key and the **4:45 Mando Morning job exactly as they are** (v6): `pmset` wakes the Mac at 4:44, the helper may play the chime once at wake and the Mando key plays it again at 4:45. If that double chime is too much, say so and I will quiet the helper before 5:10 on weekdays. OPEN QUESTION for Kev: keep the 4:45 morning at all?

### Open questions for Kev

1. **Sunday cut-off.** Default is Sunday 8 PM Boise. Change it in the dial panel (`sundown` ends at Saturday sunset).
2. **Keep the 4:45 morning?** (Mando Morning applet, LaunchAgent and the 4:44 pmset wake.) Kept as is for now.
3. **Gemini app name.** Assumed `Gemini` in /Applications or ~/Applications. Tell me the exact name if different.
4. **Screen saver all week?** The Cross saver works every day. Kev changes the saver by hand; I do not touch it.
