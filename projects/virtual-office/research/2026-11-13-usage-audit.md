---
title: Usage stewardship · baseline
subtitle: Where Eden's Claude usage goes each week, and where it leaks
author: Radar
date: 2026-11-13
---

## Result first

- **About 450 scheduled routine runs a week**, before any live chat. Claude usage was at 29% of the weekly limit by Thursday night (Kev, 12 Nov). Fable credits go unused.
- **The biggest leak is overlap.** Kev's inbox is watched by three routines. There are two morning briefs. The ticket runner fires every hour, all night.
- **This becomes a Friday metric** (Kev, 12 Nov): routine runs, usage percentage by Friday, and the cuts made, reported in the Friday review's QC card and the EOW report.

## Scheduled routines, runs per week (enabled, 13 Nov 2026)

| Routine | Schedule | Runs a week | Overlaps with |
|---|---|---|---|
| Radar · Office ticket runner | Every hour, 24/7 | 168 | Q sync patrol (both chase tickets) |
| Radar · hourly inbox sweep | Weekdays 7am to 6pm PT | about 60 | Duet team watch, Duet heartbeat |
| Duet · Team watch (hourly) | Weekdays 8am to 5pm PT | 50 | Radar inbox sweep |
| Q · Sync patrol | Every 2 hours, Sun to Fri | 48 | Ticket runner |
| Duet · Heartbeat | 5 times a day, every day | 35 | Radar inbox sweep, Team watch |
| Day board weather | 3 times a day, Sun to Fri | 18 | none |
| Dean · prescreen sheet check | 3 times a day, Sun to Fri | 18 | none |
| Eden Life Hub syncs (two) | Nightly | 14 | each other (same page) |
| Duet · Morning brief | Daily 8am MT | 7 | Radar 5:30 brief |
| Radar · 5:30 brief, stand up tomorrow | Sun to Fri | 12 | Duet morning brief |
| Hawk · look-ahead refresh | Nightly except Fri | 6 | none |
| Duet · Team watch EOD | Weekdays | 5 | Radar check-out |
| Radar · check-out | Mon to Thu | 4 | Team watch EOD |
| Smaller weekly routines | Weekly | about 6 | none |

Some heavy routines (5:30 brief, stand up tomorrow, the Hub syncs) run on Opus. The check-out runs on Sonnet.

## Proposed cuts (Kev decides)

1. **Ticket runner:** work hours only, weekdays 6am to 8pm MT, every hour. That cuts about 168 runs to about 75.
2. **One inbox watcher:** Duet's team watch and heartbeat cover it, so retire Radar's hourly sweep or move it to three a day. That cuts about 60 to 15.
3. **One morning brief:** keep Duet's, and have the 5:30 brief only point to the paper, or drop it. That cuts 6.
4. **Q sync patrol:** every 4 hours instead of 2. That cuts 48 to 24.
5. **Hub syncs:** merge the two nightly routines into one. That cuts 14 to 7.
6. **Fable:** move the heaviest builds (stand up tomorrow, the Friday review) to Fable, so they use the unused Fable pool instead of the weekly limit. This is a model change, so it needs Kev's explicit yes.

If all of the cuts land, runs drop from about 450 to about 290 a week.

## How it's measured each Friday

- Runs per routine (from the routine list's last-fired data).
- Usage percentage by Friday (Kev reads it from Settings; no API exposes it here).
- Cuts made this week and next week's candidates.
