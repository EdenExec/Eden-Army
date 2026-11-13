# Cowork task: Stream Deck kit v6 (13 November 2026)

## v6 run (13 Nov): Start key, Bible key, Music page, 4:45am Mando mode

**Read first:** `WHATS-NEW-v6.md` and `morning/morning-button.md`. This is an update. The Eden, Zoom and Google Calendar profiles from 12 Nov stay as they are.

1. **Back up.** Export every Stream Deck + profile into `exports/`, with `-before-13nov` added to each name.
2. **Update the plugin.** Open `plugin/com.kdtw.edendeck.streamDeckPlugin` and replace the installed copy if asked. Confirm Eden Deck still shows its keys and dials.
3. **Copy the clip.** Copy `morning/start-mando.mp3` to `~/Music/Stream Deck/`, making the folder if it isn't there.
4. **Build the Start key** on a new **page 2** of the Eden profile. Page 1 is full, so do not replace any key there. Make it a Multi Action named "Start" with these steps in order:
   1. Soundboard › Play Audio: `~/Music/Stream Deck/start-mando.mp3`, volume about 70%.
   2. System › Website: https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6
   3. Multi Action › Delay: 1 second.
   4. System › Website: https://claude.ai/artifact/5SuFoioujKFV6KgX4dXi3G
   5. System › Website: https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW
   6. System › Website: https://claude.ai/artifact/4fueMmheVrnVz79KuDDMs2#carousel

   Icon: `icons/key-start-288.png`. Leave the title blank.
5. **Bible key** on Eden page 2, next to Start: System › Website, https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6. Icon: `icons/key-word-288.png`. Leave the title blank.
5b. **Music profile (Kev, 13 Nov: "when we open Music we should have back, play/pause, forward and any other relevant buttons").** Create a new Stream Deck + profile named **Music**, set to switch automatically when the **Music** app is in front. Keys (built-in Stream Deck › Multimedia actions unless noted), titles blank:
   - Top row: Back = Multimedia › Previous Track (`key-music-prev-288.png`); Play/Pause = Multimedia › Play/Pause (`key-music-playpause-288.png`); Next = Multimedia › Next Track (`key-music-next-288.png`); Now playing = System › Hotkey, Cmd+L, Music's "Go to Current Song" (`key-music-now-288.png`, TEST: if Cmd+L does nothing, use Shuffle instead, see below).
   - Bottom row: Vol – = Multimedia › Volume Down (`key-music-voldown-288.png`); Vol + = Multimedia › Volume Up (`key-music-volup-288.png`); Mute = Multimedia › Mute (`key-music-mute-288.png`); Eden = Stream Deck › Switch Profile › Eden (`key-music-eden-288.png`).
   - Dials: copy Eden's four dials so Volume stays on dial 4.
   - Shuffle (optional, `key-music-shuffle-288.png`): Music has no built-in shortcut. If Kev wants it, add one in System Settings › Keyboard › Keyboard Shortcuts › App Shortcuts for Music (Kev clicks Allow / does the settings change himself), then point a System › Hotkey key at it. Do not change System Settings yourself.
   - Test: open Music, minimise the Stream Deck window, confirm the deck flips to Music; press Play/Pause, Next, Back, the volume keys; switch to Chrome and confirm the deck goes back to Eden.
6. **Mando profile.** Create a new Stream Deck + profile named **Mando**.
   - Top-right key only: a copy of the Start multi-action. Every other key, the dials and the strip stay empty.
   - Icon: `icons/key-start-288.png` for now. Kev will drop his own helmet image on it.
   - Add one more step at the end of the Mando copy: Stream Deck › Switch Profile › Eden.
7. **The Mando Morning applet.**
   - Open `morning/mando-morning.applescript` in Script Editor.
   - Save it as an Application named "Mando Morning" in /Applications, with "Stay open after run handler" ticked.
   - In Stream Deck, open the Mando profile's settings and set it to switch automatically when **Mando Morning** is in front (Smart Profile / app assignment).
8. **Stop and hand to Kev for these.** They need his password or a Terminal, so Kev does them himself:
   - Wake at 4:44 on weekdays: `sudo pmset repeat wakeorpoweron MTWRF 04:44:00`
   - Install the 4:45 job:
     - `cp morning/com.kdtw.mando-morning.plist ~/Library/LaunchAgents/`
     - `launchctl load ~/Library/LaunchAgents/com.kdtw.mando-morning.plist`
   - Allow any macOS prompts: Automation, and Accessibility for Stream Deck or Mando Morning.
9. **Test with Kev.**
   - Run `open -a "Mando Morning"` in Terminal. The deck should switch to Mando, with only the top-right key showing.
   - Press it. The clip should play, the four pages should open, and the deck should return to Eden.
   - Then lock the screen and run the same command over SSH, or wait for a test time, to see whether Smart Profiles still switch on the lock screen.
   - If they don't, use the fallback: make **Mando** the default profile, and keep the Switch Profile › Eden step at the end of its Start key. Kev decides.
10. **Report.** Add a "v6 run" section to `report.md`: what worked, what didn't, and a screenshot of Eden page 2 and the Mando profile. Export the Eden, Mando and Music profiles to `exports/` with `-after-13nov` added to each name.

Rules: same as below. Change only the Eden, Mando and Music profiles, the plugin and the applet. Never type a password, and never touch other profiles or apps.

---

# Cowork task: set up Kev's Stream Deck +

Paste the block under "The task" into a new Cowork task, with this kit folder connected. Written by Q, 12 November 2026.

## Fix run (12 November, second pass): keep the Eden skin up in every app

Kev's complaint: when he opens an app like Claude or Music, the deck falls back to the old layout. He wants the Eden skin showing in every app, except in Zoom (the Zoom profile) and in Google Calendar (the Google Calendar profile). Stream Deck switches to the **default profile** whenever the app in front has no profile of its own, so the likely causes are (a) the old layout is the default profile for the Stream Deck +, or (b) an old profile is assigned to those apps. Do this first, before the update run below:

1. Export a backup of every profile on this Stream Deck + into `exports/` with `-before-fix` in the name. Take a screenshot of the profile list.
2. For every profile, open its settings and write down which app (if any) it switches to automatically, and whether it is the default. Put the list in `report.md` (names only).
3. Make **Eden** the default profile for the Stream Deck + (in the profile list, right-click Eden or use the profile's settings; the wording may be "Set as default"). Confirm Eden is the only one marked default.
4. For every other profile except Zoom and Google Calendar: remove its automatic app assignment (do NOT delete the profile and do not change its keys). Kev has said this is allowed for this fix only.
5. Test: bring Claude, Music, Chrome, Finder, Messages, Duet and the Eden Day Board app to the front one at a time (the Stream Deck window must be minimized, because switching is off while it is open). The deck should show Eden each time. Zoom should show the Zoom profile and Google Calendar should show the Google Calendar profile. Report any app that still shows another layout and which profile it shows.
6. If an app shows the Google Calendar profile when it should not (for example any Chrome window), say so: that profile may be assigned to Chrome instead of the Calendar web app, and Kev decides.

## Update run (12 November): read this first

The Eden and Zoom profiles already exist from the 11 November run, and the Eden Deck plugin is installed. This is an update, not a rebuild. Before changing anything, export a backup of each existing profile into `exports/` with `-before-12nov` in the name. Then change the existing profiles to match the steps below, skip anything that is already right, and do not delete the old profiles. Replace the installed plugin with the newer file in `plugin/` (open it; if the app asks, replace). New things in this run: the bottom row opens apps, Zoom page Chat and Copy invite link and Participants, the Google Calendar profile, the Wispr Flow "bring up its window" option, and the new icons in `icons/`.

## The task

You are setting up an Elgato Stream Deck + (8 keys, a touch strip, 4 dials) on this Mac for Kev. The kit folder has everything: `setup.md` (the key-by-key plan), `icons/` (key faces, use the `-288.png` files), `plugin/com.kdtw.edendeck.streamDeckPlugin` (a private plugin called Eden Deck), and `design/contact-sheet.png` (the original look; it predates the 12 November changes, so `setup.md` wins where they differ).

Read `setup.md` and `design/contact-sheet.png` first. Then work in the Stream Deck app, one step at a time:

1. Open the Stream Deck app. Note its version (it must be 7.1 or later; if older, stop and tell Kev).
2. Install the plugin by opening `plugin/com.kdtw.edendeck.streamDeckPlugin`. Confirm "Eden Deck" shows under Keys (Join, Open link, Open app, Desktop key) and under Dials (Day, Desktop, Focus, Volume).
3. Create a profile named **Eden** for the Stream Deck +, and build the home page from `setup.md`: top row Radar, Command, Flow, Duet; bottom row Agenda, Zoom, Crelate, Music. Give every key its icon from `icons/` and clear the key title (the picture already carries the word).
   - Radar: System, Website. Ask Kev for the full Radar link (it starts claude.ai/project/). Do not guess it.
   - Command: System, Website, https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW
   - Flow: Eden Deck, Open app, the app named Wispr Flow, with "Also bring up its window" ticked and "Menu item to click" set to Open Wispr Flow (the newer plugin has this field). Kev wants the real Wispr Flow window (Dictation, Notetaker, Insights) to appear. If pressing Flow does not bring up that window, do not guess: first try by hand (click the Flow icon in the Mac menu bar and note the exact title of the menu item that opens the window), put that exact title in the key's Menu item to click field, and press again. If it still fails, report the key's alert reason and what the menu bar menu shows. Never type or read anything in Wispr Flow's dictation or notes.
   - Duet (top right, replaces Join, 12 Nov): System, Open, the Duet Chrome app, icon key-duet. The old Join key errored (no calendar address) and Kev does not need it. Leave the Eden Deck Join action unused.
   - Bottom row opens apps (changed 12 Nov, the Control+number keys failed silently): Agenda = System, Open, the Eden Day Board Chrome app (it still errors on Kev's deck: pick the app FILE with System, Open's file picker, in Applications, Chrome Apps, instead of typing a name; if that fails use System, Website with https://claude.ai/artifact/4QFTb8NFvWhbc2jg5zD4hc and report it); Zoom = System, Open, the Zoom app (replaces Claude); Crelate = System, Open, the Crelate desktop app (replaces LinkedIn and the second Duet); Music = System, Open, the Music app (opens anywhere, not tied to a desktop; remove any leftover Control+4 hotkey on that key). Icons: key-agenda-dayboard, key-zoom-app, key-crelate, key-music (no desktop numbers). Duet is the top right key, not on the bottom row.
4. Dials: put Eden Deck Day, Desktop, Focus and Volume on dials 1, 2, 3, 4 in that order.
5. Create a second profile named **Zoom** with the 8 keys in `setup.md` (Elgato's Zoom plugin for Mic, Camera, Share; Flow as on the home page; Leave). Set it to switch automatically when Zoom is in front. Key 4 is Chat (System, Hotkey, Shift+Cmd+H) and the key that was empty is Copy invite link (System, Hotkey, Shift+Cmd+I). Leave is a normal press with the new icon (no HOLD). Participants (System, Hotkey, Cmd+U, icon key-zoom-participants) takes the slot Radar had on the Zoom page (Radar stays on the Eden page).
5a. Create a third profile named **Google Calendar**, set to switch automatically when Google Calendar is in front: key 1 New event (System, Hotkey, Google Calendar's new-event shortcut; confirm it in the app), key 2 Paste Zoom link (System, Text). Do not type or ask for the Zoom invite text: Kev types it into the key's text box himself. Never read, copy or log it.
6. Stop and hand over to Kev for these three things, which only Kev does:
   - Pasting the Google Calendar "secret address in iCal format" into the Eden Deck calendar setting (click the Day dial and use the panel at the bottom). Never read, copy, log or repeat that address. It is a password.
   - Typing his Zoom invite text into the Paste Zoom link key.
   - Clicking Allow on any macOS permission prompt (Accessibility, Automation, files). Do not change System Settings permissions yourself.
   - Pressing the real keys and dials to confirm they work.
7. Check what you can without the secret: press each new app key and say which ones open their app, especially Flow (does the Wispr Flow window appear?). Take a screenshot of each page of the deck in the app.
8. Export the Eden, Zoom and Google Calendar profiles (in the app, right-click a profile and choose Export) into the kit folder's `exports/` folder.
9. Write `report.md` in the kit folder: what you set up, what you could not do, anything that behaved differently from `setup.md`, and the macOS and Stream Deck versions.

Rules: change only the Eden, Zoom and Google Calendar profiles and the Eden Deck plugin, plus (for the fix run only) the default-profile choice and the automatic app assignments on Kev's other profiles, after backing them up. Do not delete or edit any other profile, app, file or setting. Do not open email, messages or documents. Do not enter or look up passwords. If a step does not match what you see, stop and ask Kev instead of improvising.
