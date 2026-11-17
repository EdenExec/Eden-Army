---
title: Mac mini · Claude remote setup
subtitle: Kev's home Mac mini, ready for Claude to work on it while he's away
author: Radar
date: 2026-11-13
org: kdtw
---

## Result first

- **Goal:** Kev sends work from his phone, and Claude runs it on the Mac mini at home: open or quit apps, stop a recording, run the Stream Deck kit, file work, check status. The machine stays reachable whether or not Kev is at the keyboard.
- **Trigger (13 Nov):** Wispr Flow was left recording, and nothing could stop it, because no computer showed up for Remote Control.
- **Kev's time at the machine:** about 30 minutes, once. Every step below that says **Kev** needs him there: a sign-in, a macOS permission, or a password. Cowork or Claude can do the rest.
- **Guardrails:** Claude only works inside the folders Kev shares, never in the home folder. It never reads Wispr Flow dictation or notes. It never types a password. A destructive command still asks Kev first.

## Part 1 · Make the Mac reachable (Kev, about 15 minutes)

| # | Step | Where | Who |
|---|---|---|---|
| 1 | Update macOS, then install or update the **Claude desktop app** and sign in with Kev's account | claude.ai/download | Kev |
| 2 | Install **Claude Code** (the desktop app includes it; for the terminal, follow the install instructions at code.claude.com) and sign in once | Terminal: `claude` | Kev |
| 3 | Make a working folder: `~/Eden` with a clone of the Agent-Builder repo, plus `~/Eden/ops` for the remote scripts in Part 3 | Finder or Terminal | Kev or Cowork |
| 4 | Turn on **Remote Control** and add the folders Claude may use: `~/Eden` (and `~/Eden/ops`). Don't add the home folder, Library or any hidden folder: they can't be used | Claude app › Settings › Claude Code › Remote Control | Kev |
| 5 | Set Claude to **open at login** | System Settings › General › Login Items | Kev |
| 6 | Keep the Mac awake and reachable: Energy settings › "Prevent automatic sleeping when the display is off" on, "Wake for network access" on, "Start up automatically after a power failure" on | System Settings › Energy | Kev |
| 7 | Check from the phone: in the Claude app, the Mac mini and its `~/Eden` folder should show as online | Claude app on iPhone | Kev |

After step 7, any Claude session (Radar included) can ask to use the folder. Kev taps Allow on the phone, and the session's commands run on the Mac.

## Part 2 · Permissions Claude needs on the Mac (Kev clicks Allow)

macOS asks for these the first time Claude tries something. Kev approves each one at the Mac. Claude never changes these settings itself.

| Permission | Why | Where |
|---|---|---|
| **Automation** (Claude or Terminal → System Events, Wispr Flow, Music, Stream Deck) | Quit or open an app, stop a recording, run the Stream Deck kit | System Settings › Privacy & Security › Automation |
| **Accessibility** (Claude or Terminal) | Click a menu bar item, for example Wispr Flow's Stop | Privacy & Security › Accessibility |
| **Files and Folders** for `~/Eden` only | Read and write the working folder | Privacy & Security › Files and Folders |
| Screen Recording: **not given** | Claude doesn't need to see the screen. Leave it off unless Kev decides otherwise | n/a |

## Part 3 · Remote ops scripts (`~/Eden/ops`, Claude writes them, Kev reviews once)

Small, read-only or app-level scripts that Claude can run from anywhere. They print status only and never read content.

| Script | Does | Notes |
|---|---|---|
| `status.sh` | Shows what's running (Wispr Flow, Zoom, Music, Stream Deck), whether the Mac is awake, battery or power state, and free disk | Names of apps only |
| `stop-wispr.sh` | Stops a Wispr Flow recording: clicks Stop in its menu bar item, or quits the app (`osascript -e 'quit app "Wispr Flow"'`) if that fails | Never opens or reads a note or dictation |
| `quit-app.sh <name>` | Quits one named app politely | No force-quit without Kev's yes |
| `lock.sh` | Locks the screen | For "I left the Mac open" moments |
| `streamdeck-restart.sh` | Restarts the Stream Deck app, for when the deck shows only the Elgato logo | Same fix as 13 Nov |
| `wake-check.sh` | Shows the scheduled wake times (`pmset -g sched`) and the Mando 4:45 job status | Read-only |

## Part 4 · Claude Code settings on the Mac (Claude drafts, Kev approves)

- **Project settings** in `~/Eden/.claude/settings.json`:
  - Allow without asking: the scripts in `~/Eden/ops`, `git` and `npm` in the repo, `open -a`, `osascript` quitting a named app, and `pmset -g`.
  - Always ask first: `rm`, `sudo`, anything outside `~/Eden`, and any purchase, send or post (same QC rules as everywhere else).
- **No passwords** in any file. The Mac's own sign-ins stay Kev's.
- Sabbath: no work runs Friday sunset to Saturday sunset, except a stop or quit Kev explicitly asks for.

## Part 5 · Test plan (Kev, 10 minutes, from the phone)

1. Walk away from the Mac. In the Claude app, ask: "Mac mini status". The `status.sh` output comes back.
2. Start Wispr Flow recording on the Mac, then from the phone ask "stop Wispr". Confirm it stopped.
3. Ask "restart Stream Deck". The deck comes back with the Eden profile.
4. Ask Radar's session to use the Mac folder. Tap Allow. Confirm a file write in `~/Eden` works.

## Backup channel (optional, Kev decides)

If Remote Control drops, a second path keeps the Mac reachable: Tailscale plus macOS Remote Login (SSH) from the iPhone, using Kev's own login. This is a new network service, so it needs Kev's explicit yes before anything is installed.

## Open questions for Kev

1. Which folders should Claude use beyond `~/Eden`? For example a family folder for Atlas, which would stay separate from Eden.
2. Should "stop Wispr" quit the app outright, or only stop the recording?
3. Do you want the Tailscale backup?
