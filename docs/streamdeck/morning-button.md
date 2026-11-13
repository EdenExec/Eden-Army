---
title: Stream Deck · one-button start-up
subtitle: Kev's morning button, with the Mando sound
author: Radar
date: 2026-11-13
org: kdtw
---

## Result first

- **One press starts the day:** the Mando sound plays, then the Eden pages open in order.
- **About five minutes to set up** in the Stream Deck app with one Multi Action. Kev supplies the MP3 (Radar can't download it, because it's copyrighted).
- **A second button for the Bible** opens Barny's workshop.

## The morning button (Multi Action)

In the Stream Deck app, drag **Multi Action** onto a key, name it "Start", then add these steps in order:

| # | Action (Stream Deck) | Setting |
|---|---|---|
| 1 | Soundboard › Play Audio | `start-mando.mp3` (Kev's 5-second Mando clip, sent 13 Nov; save it to ~/Music/Stream Deck/), volume about 70% |
| 2 | System › Website | https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6 (Barny's workshop: journal first) |
| 3 | Multi Action › Delay | 1 second |
| 4 | System › Website | https://claude.ai/artifact/5SuFoioujKFV6KgX4dXi3G (Eden Desk: today's paper) |
| 5 | System › Website | https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW (Command Center) |
| 6 | System › Website | https://claude.ai/artifact/4fueMmheVrnVz79KuDDMs2#carousel (meeting room carousel, for the office TV) |

To have the carousel open on the TV, drag that browser window to the TV once. macOS then reopens it on that screen.

## The Bible button

- **System › Website:** https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6 (Barny's workshop).
- **Key icon:** a plain black square with "WORD" in white Montserrat, so the deck stays on brand.

## Still to decide with Kev (13 Nov, at the desk)

- Whether the Mando clip plays every morning or only Mondays (the clip is in hand: 5 seconds).
- Whether "Start" also opens Superhuman and Crelate.
- The key layout: Start, Bible, and later Tesla (December) and the intercom (iPhone only; Macs can't start HomePod Intercom).

## 4:45am Mando mode (Kev, 13 Nov: "the only key showing... default from 4:45 until first log in")

**Can it be done?** Yes, with one limit: a Stream Deck goes dark when the Mac is asleep, so the Mac wakes itself at 4:44 and stays awake until about 8:05, or until Kev arrives.

| Piece | What it does | Set up once |
|---|---|---|
| Scheduled wake | Mac wakes at 4:44am Monday to Friday | Terminal: `sudo pmset repeat wakeorpoweron MTWRF 04:44:00` |
| "Mando" profile | One key, top right: the Start multi-action. Every other key blank | Stream Deck app: new profile "Mando", Start key in the top-right slot |
| "Mando Morning" applet | A tiny do-nothing app. Stream Deck's Smart Profile shows the Mando profile whenever it is in front | Script Editor: `mando-morning/mando-morning.applescript`, saved as an Application (stay open) to /Applications; Stream Deck › Preferences › Profiles › Mando › Smart Profile: Mando Morning.app |
| 4:45 job | Opens the applet (deck switches to Mando) and keeps the Mac awake for 3h20 | Copy `mando-morning/com.kdtw.mando-morning.plist` to ~/Library/LaunchAgents/, then `launchctl load` it |
| Punch in | Start plays the Mando clip and opens the day's pages. The browser comes to the front and the deck returns to the normal profile | Already in the Start multi-action above |

Test together on Friday: lock the screen, wait for 4:45 with a test time (change the plist to two minutes from now), and confirm the deck shows only the helmet key on the lock screen. If the lock screen blocks Smart Profiles, the fallback is "Start at login": the Mando profile is the deck's default, and the Start key ends with a Switch Profile step to the normal profile.

**Key image:** Kev's own helmet image, dropped on the key in the Stream Deck app (any square PNG). Radar doesn't draw the character.
