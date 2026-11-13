# Eden Deck, a free private Stream Deck + plugin

Built for Kev's Stream Deck + (Mac). It draws the touch strip from live state, gives the dials one job each, and adds a Join key and a few plain keys. It is free: Elgato's own SDK (`@elgato/streamdeck` 3.0.4) and CLI (`@elgato/cli` 1.10.4), both MIT licensed. No paid plugin, no server, no account.

**Warning: the calendar address is a password.** Google's "Secret address in iCal format" lets anyone who has it read your whole calendar, and it works until you reset it. Paste it only into this plugin's settings. Never put it in a file, a chat, an email or the repo. If it leaks, reset it in Google Calendar (same screen, "Reset"). The plugin never writes it to its log and keeps meeting titles in memory only.

## What is in it

| Piece | What it does |
|---|---|
| Strip | One 800 x 100 drawing for the whole strip. Each dial shows its own 200 x 100 slice of it, so the meeting text runs across the left two slices. Left half: NEXT time, title, countdown ("1 h 30", "12 min"), a thin progress line. Cream from 15 minutes before a meeting until 5 minutes after it starts. Right half: focus timer and volume. Captions: DAY, DESKTOP, FOCUS, VOLUME. |
| Calendar | Reads the iCal address every 2 minutes (and on a touch of the strip, and when settings change). Handles recurring events (DAILY, WEEKLY, MONTHLY, YEARLY with INTERVAL, BYDAY, BYMONTHDAY, UNTIL, COUNT, EXDATE, moved or edited single instances) and time zones. Ignores declined, cancelled and all-day events and anything 6 hours or longer. |
| Join key | Dim "JOIN" with no link or nothing within 30 minutes. Cream with the start time from 15 minutes before until 15 minutes after the start. Press opens the Zoom, Meet, Teams or Webex link (from X-GOOGLE-CONFERENCE, LOCATION or DESCRIPTION) with the Mac `open` command. |
| DAY dial | Turn: Left/Right Arrow to the front app (steps the Day Board a day). Press: nothing, only a flash. |
| DESKTOP dial | Turn: Control+Left / Control+Right. Press: Mission Control. |
| FOCUS dial | Turn: minutes in steps of 5 (5 to 120). Press: start or stop. When it ends the slice flashes and the Mac plays the "Glass" sound once. |
| VOLUME dial | Turn: system volume in steps of 4. Press: mute or unmute. |
| Open link key | Setting: web address and label (Radar chat, Command Center page). Opens in the default browser. |
| Open app key | Setting: app name, label, "Also bring up its window", and "Menu item to click". Runs `open -a`. Names may contain dashes, including en dashes ("Eden Day Board – Claude artifact"). With "Also bring up its window" ticked (for menu-bar apps such as Wispr Flow) the plugin then asks System Events whether the app has a window. If it has one, the app is brought to the front. If it has none, the plugin clicks the app's menu bar icon and then the menu item named in "Menu item to click" (default "Open Wispr Flow" when the app is Wispr Flow, blank for other apps; blank means skip the click). If neither works the key shows the alert triangle and the reason goes to the Stream Deck log (no names). Needs the Accessibility permission for Stream Deck, same as the dials; the first press may show a permission prompt. |
| Desktop key | Setting: number 1 to 9 and label. Presses Control+number. Control+number goes through System Events and needs Accessibility permission; without it the key now shows the alert triangle instead of failing silently (for a reliable key use Stream Deck's own System > Hotkey). Or choose "Open an app instead" with an app name, because full-screen and split-screen desktops get no Control+number shortcut. |
| Sabbath | Friday sunset to Saturday sunset (small solar calculation, default Boise 43.615, -116.202, America/Boise). The strip shows REST and the time to Saturday sunset. DAY, DESKTOP and FOCUS do nothing, VOLUME works, Join stays dim. After the last meeting on Friday the left half counts down to the Sabbath. |

There is no Dictate action: the Flow key just opens the Wispr Flow app (Open app key). The Zoom mute, camera, share and breakout keys come from Elgato's own Zoom plugin and are not built here.

## Install (on the Mac)

You need Stream Deck software 7.1 or later and Node.js 20 or later (the plugin itself runs on the Node that Stream Deck brings; Node on the Mac is only for building).

```
cd projects/stream-deck/plugin
npm install
npm run build
npx streamdeck link com.kdtw.edendeck.sdPlugin
```

`streamdeck link` adds the plugin to Stream Deck without packaging it. To change code later: `npm run build`, then `npx streamdeck restart com.kdtw.edendeck`. To remove it: `npx streamdeck unlink com.kdtw.edendeck`.

Then in Stream Deck:

1. Open the action list, "Eden Deck". Drag **Day, Desktop, Focus, Volume** onto dials 1 to 4 in that order. The strip is cut by the dial's position, so the order matters.
2. Drag **Join** onto a key (top right in the v2 layout). Add Open link, Open app and Desktop keys where you want them.
3. Select any Eden Deck action. The settings panel has the calendar address. In Google Calendar: Settings, click the calendar under "Settings for my calendars", Integrate calendar, copy "Secret address in iCal format", paste it into "Calendar address" (the field hides the value). Optional: your email (to hide meetings you declined), latitude, longitude and time zone (blank means Boise). Press "Check now".
4. For the Day and Desktop dials, macOS must allow Stream Deck to send keystrokes: System Settings, Privacy and Security, **Accessibility**, switch on Stream Deck. The first keystroke may also ask to let Stream Deck control "System Events" (Automation); allow it. Volume and mute use the same System Events permission prompt.

If a meeting does not show, press "Check now" and read the status line. Times follow the time zone in settings, not the Mac's.

### Checking the Wispr Flow menu bar route by hand

1. Quit nothing: leave Wispr Flow running in the menu bar and close its main window (closing only hides it).
2. Click the Flow icon in the Mac menu bar (top right).
3. Look for "Open Wispr Flow" in the menu and click it. The main window (Dictation, Notetaker, Insights) should appear. The exact title is what goes in "Menu item to click"; if yours reads differently, type that.
4. Close the window again, then press the key on the deck. Allow the Accessibility prompt if macOS shows one (System Settings, Privacy and Security, Accessibility, Stream Deck on).
5. If the key flashes the alert triangle, open the Stream Deck log and read the short reason ("Accessibility not allowed" or "No window and no menu item found").

## Changing the look

Everything a designer would touch is in `src/theme.js`: colours, font, text sizes, every word on the strip, and the timing rules (15 minutes, 5 minutes, 30 minutes, 6 hours, step sizes). The drawing is `src/lib/strip.js` (the strip) and `src/lib/keyface.js` (key faces). After a change: `npm run previews && npm run screenshots` and look in `preview/`.

## Tests and checks

```
npm test            # unit tests (node:test), no network needed
npm run build       # bundles src/ into the .sdPlugin with rollup
npm run validate    # streamdeck validate
npm run previews    # writes preview/*.svg and preview/index.html
npm run screenshots # Chromium screenshots of those (needs Playwright's Chromium)
```

### Verified here (Linux sandbox, no Stream Deck, no Mac)

- Unit tests pass: iCal parser (Google-style feed with a weekly event with EXDATE and a RECURRENCE-ID override, TZID events, all-day, cancelled, declined, 6 hour events, Zoom link in a folded description, daily/weekly/monthly rules, daylight saving), next-meeting selection, join-link finder, the 15 minute cream rule, the Join key rule, countdown formatter, focus timer, Sabbath window and sunset math against known times, view model and strip drawing (four slices, escaping, no brass), key helpers (URL and app name safety, AppleScript text), manifest matches the registered actions.
- `streamdeck validate` passes and `streamdeck pack` builds a `.streamDeckPlugin` file.
- The strip renders for four states and looks right in Chromium (`preview/`).
- The docs say a layout pixmap accepts an SVG string or an SVG data URI, and the plugin uses that.

### NOT verified until Kev installs it

- The Open app key's window route for Wispr Flow: whether System Events can see Wispr Flow's menu bar icon (it is an Electron app, which may expose its status item differently) and click "Open Wispr Flow". Check by hand first, below.
- That the touch strip actually draws the SVG slices, and how the font looks there (Montserrat is probably not installed on the Mac, so it falls back to Helvetica Neue; the sandbox shows a different fallback).
- The strip's real size and whether four slices line up edge to edge.
- Anything on the device: dial turns, presses, the Join key image, the flash.
- The Google Calendar fetch with a real address (only the parser was tested, on invented feeds written to look like Google's).
- Keystrokes, volume, Mission Control, `open`, `open -a` and the Glass sound on macOS, and the Accessibility and Automation prompts.
- The settings panel (it uses Elgato's `sdpi-components` v4.0.1 file, copied into `ui/`), including the Check now status line.
- How the plugin behaves on sleep and wake and on very long uptime.
