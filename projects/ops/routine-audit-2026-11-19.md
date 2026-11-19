---
title: Routine audit · scheduled tasks and standing rules
subtitle: Redundancies, stale runs and a plan to whittle down to one inbox watcher
author: Radar
date: 2026-11-19
---

# Routine audit · 19 November 2026

Kev, 19 Nov 2026: "start reducing the amount of rules and scheduled routines... are multiple agents running scheduled inbox gleans? not good, whittle down to 1 agent who dishes out the work to the others. Are there out of date scheduled runs / back ups / syncs that are now unnecessary/redundant?"

**This is a recommendation only. Nothing was disabled, deleted or edited.** Baseline for comparison: `projects/virtual-office/research/2026-11-13-usage-audit.md`.

## One-page summary

| Measure | Today | Recommended |
|---|---|---|
| Scheduled tasks in the list | 38 (33 enabled, 5 disabled), plus 19+ fired one-shots hidden from the default list | 21, all enabled, nothing disabled left lying around |
| Scheduled runs a week | about 504 | about 176 (down about 65%) |
| Relative load (runs x weight: light 1, medium 3, heavy 6) | about 1,800 | about 830 (down about 54%) |
| Routines that read Kev's inbox | 10, across three owners (Radar, the Duet channel watches, a chat-project log); about 190 inbox reads a week | 4, all Radar, with one watcher (the sweep); about 61 reads a week |
| Writers of the phones doc (`meta/phones`, `phones/current`) | 2 (ticket runner hourly, CloudTalk routines 3x a day) | 1 |

**Top 5 changes**

1. **One inbox watcher: Radar's sweep.** Fold Team watch hourly, Team watch EOD, Kev's day, Heartbeat and the Duet Morning brief into the sweep, the check-out and the 5:30 brief. The sweep hands work out by Command Center ticket (Casey, Carmel's Partner, Scout, Dean). Cuts about 122 runs a week and 6 inbox readers.
2. **Ticket runner to working hours, and give it Q's patrol.** Weekdays 6am to 8pm MT instead of 24/7 (79% of this week's 145 logged runs found nothing to do). Its floor refresh already does what Q's 2-hourly sync patrol does, so retire the patrol. Cuts about 141 runs. Kev must make the runner edit himself (it was created through the API).
3. **One Round Table refresh, one phones writer.** Merge the CloudTalk dials and Crelate board refreshes into one routine (Mon to Thu 5am, noon, 5pm; Friday 5am, noon, 3pm MT) and drop the ticket runner's hourly phones write (step 8c). Cuts 19 runs and ends two writers racing on the same doc.
4. **Fix the scorecard week, then trim it.** The Thursday 5pm routine opens scorecards until Sunday 5pm, but the Friday 7:50 routine still resets `lockAt` to Friday noon (the old window). It fires tomorrow, 20 Nov, at 7:50 PT and may close scorecards early. Retire the 7:50 and the 8/9/10 checks, and move the 12:05 final pull to Sunday 5:05pm (already pending Kev's go). Cuts 4 runs a week and removes the conflict.
5. **Stop the stale nightly jobs.** The Eden Life Hub backup has written 53 nightly Doc copies since 28 Sep (Notion already keeps page history): make it weekly. Retire Dean's prescreen check (no new responses since 5 Nov, about 36 empty runs) and the nightly candidate submission log (ask Kev first; it also runs on the Sabbath). Cut weather to once a day. Cuts about 42 runs.

**Kev must do some of these himself.** Routines created through the API (ticket runner, Heartbeat, Morning brief, candidate log) can only be edited by Kev at claude.ai/code/routines. Duet channel routines (Team watch, Kev's day, Heartbeat, Morning brief) pause from their channel.

<!-- pagebreak -->

## Inbox gleans: who reads Kev's mail today

| Routine | Owner and session | Runs a week | What it reads | Verdict |
|---|---|---|---|---|
| Radar · inbox sweep (`trig_012VfA1Y4EBzyFoixKVGmNug`) | Radar, fresh | 45 (hourly 8am to 4pm MT, weekdays; hourly again since 19 Nov for the Carmel watch) | Whole inbox, Important split, Carmel threads | **Keep: the one watcher** |
| Team watch · hourly (`trig_01NSwm6rDDPHGLLrbED6gP6p`) | Duet channel, fresh | 50 (8am to 5pm PT) | Team split, internal threads | Merge into sweep |
| Team watch · EOD roundup (`trig_01BbM7MX5XqkpRuq68cyhfaM`) | Duet channel, fresh | 5 | Pooled team items, today's team threads | Merge into check-out (Mon to Thu) and the sweep's 4pm run (Friday) |
| Kev's day (`trig_01P5Fh66X57eTV4YfK5b9nu2`) | Duet channel, fresh | 25 | Calendar, client and candidate mail, Command Center leads | Merge into sweep (post "what's next" at 3 of its runs) |
| Heartbeat (`trig_01AebvS3J8i4qiNNZgNP3nF5`) | Duet channel, fresh | 35 (5 a day, every day, Saturday too) | Mail and calendar, 3 hours either side | Retire: sweep covers it |
| Morning brief (`trig_01Lszhp3faRnTzH2D9mCjWEw`) | Duet channel, fresh | 7 (every day, Saturday too) | Mail and calendar | Retire: duplicates the 5:30 brief |
| Radar · 5:30 brief (`trig_01CWiJZcDZS9xJGZrxo5sjVh`) | Radar, fresh | 6 | Overnight mail, light | Keep |
| Radar · stand up tomorrow (`trig_016GSTsKArqZBPRZc2ZzFaTj`) | Radar, fresh | 6 | 3 days of unanswered threads | Keep; read the sweep's ledger rows instead of rescanning 3 days |
| Radar · EOD check-out (`trig_01W4kTyfCd7VhMkvt5LDRZ9s`) | Radar, fresh | 4 | Threads waiting on Kev | Keep |
| Daily candidate submission log (`trig_018JYuwK2wXC24dUwKPDBuAz`) | Chat project, fresh | 7 (Saturday too) | Today's mail, for PTCs | Retire, or weekdays only (ask Kev) |

Not inbox readers: the ticket runner now carries the Superhuman connector but its playbook does not read mail. The Carmel's Partner comms watch was written but never scheduled; today's sweep change (commit 65a4042) made the sweep the only Carmel watcher. Rhaven watch is already disabled.

## Other overlaps found

- **Two phones writers.** `ticket-runner.md` step 8c writes `meta/phones` (Command Center) and `phones/current` (Round Table) every hour, 24/7. The CloudTalk routines (`trig_01RL9DfefxS3dqUoXBfPV2mv`, `trig_015gB8FiLjniotbRExTftuHQ`) write the same two docs 3 times a day with a stricter schema and week roll. The last writer wins, so notes and `prior`/`four` can flip. Keep the CloudTalk routines; remove step 8c.
- **Four Round Table refreshes on the same pages.** Crelate board (Mon to Thu 4x, Fri 3x) and CloudTalk dials (Mon to Thu 3x, Fri 3x) fire 6 minutes apart at 5am and noon, into the same long session. Merge into one. The Friday versions also miss the Eden Hub write that the Mon to Thu versions got today (steps 3b and 5b).
- **Friday scorecard tasks (six of them).** Thursday 5pm open, Friday 7:50 numbers reset, Friday 8/9/10 checks, Friday 12:05 final pull, the button task, plus fired 10:15 to 10:50 one-shots. The Friday ones were built for the old Friday 8am to noon window; since 13 Nov the window is Thursday 5pm to Sunday 5pm, and the Round Table page merges stamps live.
- **Ticket runner vs Q sync patrol.** Both run `office-prep` and refresh every desk on the Command Center. The runner does it hourly; the patrol every 2 hours. Kev kept the patrol on 13 Nov ("I want the command center up to date at all times"); the runner alone keeps it current hourly in working hours.
- **Two morning briefs.** Duet's 8am Morning brief and Radar's 5:22am brief both read overnight mail and calendar. The 5:30 brief carries the paper and the journal prompt; keep it.
- **Sabbath leaks.** Heartbeat, Morning brief and the candidate log fire on Saturdays; the ticket runner fires 24 times on Saturday just to stop with one line.

## Backups, syncs and one-shots

- **Eden Life Hub sync + backup** (`trig_01P5ZvQveQ6RcgWswL6kNCBm`, nightly 1:52am PT, Opus). The backup folder holds 53 Docs, one per night since 28 Sep, growing 100 to 700 bytes a night, so the hub changes little. Notion keeps page history. Recommend: sync Sunday and Wednesday, backup Sunday only (or drop it). Kev: "not sure we're using the backup quite like i anticipated."
- **Hub sync · Workshop** (`trig_01TEPbgFTNUqtJLoREkjFK4Y`): disabled since the 13 Nov merge. Delete.
- **Disabled and done:** Rhaven watch (its own end date was 19 Nov), Radar's old ticket runner copy, Friday cards PDF, Friday week review. Delete all four.
- **Fired one-shots:** at least 19 reminders that already fired (scorecard checks 13 Nov, Sabbath launch tasks 14 to 15 Nov, 360 questions 1 to 3, the recruiter kit push). They cost nothing but clutter the list. Delete. Still pending and worth keeping: 360 question 4 (20 Nov) and the 360 30-day review (25 Nov).
- **Q sync patrol every 2 hours:** 48 runs a week, no visible commits this week. Retire into the runner (above).
- **Day board weather 3x a day:** 18 light runs. Once a day at 5:20am MT is enough; raise the page's "old" mark from 8 to 24 hours.
- **Dean prescreen check 3x a day:** the prescreen log's last new response was 5 Nov. Retire; re-run on request when the form is reopened.

## Load estimate

Weights: light 1 (a read and a one-line post), medium 3 (several tools, a doc write), heavy 6 (long build, many connectors, commits). Persistent-session tasks are weighted medium because each firing lands in a long session's context.

| Group | Runs a week now | Load now | Runs after | Load after |
|---|---|---|---|---|
| Inbox watchers and briefs (incl. the candidate log) | 190 | 379 | 61 | 250 |
| Ticket runner and Q patrol | 216 | 1,152 | 75 | 450 |
| Round Table, CloudTalk, scorecards | 41 | 126 | 18 | 72 |
| Hub sync and backup, weather, prescreen | 43 | 93 | 8 | 12 |
| Everything else kept as is (Hawk, Dean training, EOW, revenue, 360) | 14 | 46 | 14 | 46 |
| **Total** | **about 504** | **about 1,800** | **about 176** | **about 830** |

<!-- pagebreak -->

## Recommendations

### Keep (as they are, or with the noted trim)

| Task | Why |
|---|---|
| Radar · inbox sweep | The one inbox watcher. Absorbs the Duet watches; tickets work to the other agents. |
| Radar · 5:30 brief | The one morning brief. |
| Radar · stand up tomorrow | Builds the paper (on the Fable trial). |
| Radar · EOD check-out (Mon to Thu) | Absorbs Team watch EOD. |
| Radar · EOW agent reports (Fri 1:50pm PT) | Kev: "Friday EOW report is all I need." |
| Radar · Office ticket runner | Trim to weekdays 6am to 8pm MT; drop step 8c; absorbs Q's patrol. Kev edits. |
| Round Table · Friday 9:55 Crelate pull | Feeds the Friday Pipeline Review. |
| Scorecard week opens (Thu 5pm PT) | Kev's 13 Nov window. |
| Scorecard final pull | Move from Friday 12:05 to Sunday 5:05pm PT (pending Kev's go). |
| Refresh scorecards (button) | No schedule; on demand only. |
| Dean · Tuesday prep, Wednesday touch-up | Weekly training, light. |
| Hawk · look-ahead refresh, Sunday stand-up prep | Calendar mirror and runway; nobody else does it. |
| Revenue dashboard refresh (M/W/F) | Silent when nothing changed. Unsure it is still used; ask Kev. |
| 360 watch: question 4, 30-day review | Pending one-shots. |

### Merge

| Fold this | Into this | Note |
|---|---|---|
| Team watch · hourly | Radar · inbox sweep | Team threads: post now if blocked, else pool for the check-out. |
| Kev's day (what's next, leads, replies owed) | Radar · inbox sweep | At the 8am, 11am and 2pm runs, one "Your day" line in the Duet channel (Radar has a standing yes for Duet cards, 12 Nov). |
| Team watch · EOD roundup | Radar · EOD check-out; Friday into the sweep's 4pm run | |
| Q · Sync patrol | Radar · Office ticket runner | The runner's step 8 already refreshes every desk; add the stale-bench check at its 6am, noon and 4pm runs. |
| Round Table · Crelate refresh (Mon to Thu, Fri) | CloudTalk dials refresh (Mon to Thu, Fri) | One "Round Table refresh" per slot writes board and phones to the Round Table, Command Center and Eden Hub. Drops the 3pm and 10pm Mon to Thu Crelate pulls Kev once asked for. |
| Ticket runner step 8c (hourly phones write) | CloudTalk dials refresh | One writer. |
| Eden Life Hub backup (nightly) | The Hub sync, Sunday only | |

### Retire

| Task | Reason | Risk |
|---|---|---|
| Heartbeat | Sweep covers the same window; fires on the Sabbath | Kev loses the evening look-ahead check-ins after 4pm; the stand-up and Hawk's nightly refresh cover tomorrow. Kev disables it himself. |
| Morning brief (Duet) | Duplicates the 5:30 brief; fires on the Sabbath | Kev may prefer the 8am Duet version; then retire the 5:30 brief instead, not both. |
| Team watch · hourly, Team watch · EOD, Kev's day | Merged (above) | A teammate's ask could wait one extra hour if the sweep misses the Team split; check one week of sweep logs after the switch. |
| Q · Sync patrol | Merged into the runner | Desks between runner runs can read stale for up to an hour; Kev said 13 Nov he wants it current at all times. |
| Round Table Crelate refresh (both) | Merged into one refresh | Board updates drop from 7 a day to 3 on Mon to Thu. |
| Friday scorecard numbers 7:50 PT | Resets `lockAt` to Friday noon, against the Thursday to Sunday window | None if the Thursday routine's prefill stays; Friday numbers come from the merged refresh. |
| Scorecard check 8, 9, 10 PT | The page merges stamps live; the button is there | Kev's "someone new is in" pings on Friday morning stop. |
| Dean · prescreen sheet check | No new responses since 5 Nov | A late response waits until Dean is asked. |
| Daily candidate submission log | Submittals are "not a useful metric" (Kev, 12 Nov); PTCs are counted in Crelate; runs on Saturday | The Master Candidate Tracker sheet stops updating. Ask Kev; fallback is weekdays only. Kev edits it himself. |
| Day board weather, 2 of 3 runs | Weather barely moves | The board marks weather "old" after 8 hours unless the window is raised. |
| Disabled tasks (Rhaven, old runner, cards PDF, week review, Hub Workshop) and 19+ fired one-shots | Done or superseded | None. |

## Repo: stale references found

- `employees/radar/memory/seed/sources.md` ("verified 4 October"): lists the Friday week review (`trig_01C69u4TUwZweJPjPjwoz9Yr`, disabled 13 Nov) and Hub sync Workshop (disabled) as live; says the sweep runs 7am to 6pm and the check-out runs weekdays; misses 25 live routines (CloudTalk, Round Table, Hawk, Q, Dean, scorecards, the Duet watches).
- `employees/radar/skills/check-out.md` line 35 and `week-review.md` line 3 say the week review "runs as its own routine". It is paused.
- `employees/radar/routines/{brief,check-out,stand-up,sweep}.md` embed copies of the persona, brand, standing rules and sources. The live trigger prompts embed an early-October copy (Saturday-only Sabbath, weekday check-out, Friday 4pm review). STEP 0 reads the repo first, so these copies only bite on fallback, but they make each prompt tens of thousands of characters, paid on every run. Cut each prompt to STEP 0 plus the playbook name, as the ticket runner's 300-character prompt already does.
- `employees/radar/routines/sweep.md` and the live sweep prompt say "7 7-18 PT"; the trigger runs `CRON_TZ=America/Boise 7 8-16`. `check-out.md` says 1-5; the trigger runs 1-4.
- `employees/radar/skills/ticket-runner.md` line 31 says the runner has no Superhuman connector; the trigger now carries it. Step 8c duplicates the CloudTalk routines.
- `projects/virtual-office/research/2026-11-13-usage-audit.md` records the sweep cut to 3 a day; it is hourly again since 19 Nov (Carmel watch). The ticket-runner cut is still waiting on Kev.
- Routine files never scheduled: Casey board keeping, candidate care list, JO status report; Scout nightly leads; Ember warm inventory and MPC picks; Q CloudTalk nightly; Carmel's Partner comms watch. They are fine as specs; keep them unscheduled unless they replace something above.
- Time zones: Team watch prompts, the weather prompt and several Friday scorecard crons are still Pacific; the family has been in Boise since 8 Nov.

## Standing rules: how to trim

`standing-rules.md` has 11 numbered rules and 40 additions. Proposed:

| Rule | Status | Proposal |
|---|---|---|
| Rule 10 and the 4 Oct "sweeps are hourly" line | Duplicate, and wrong hours | One line: "One inbox watcher, the sweep, hourly 8am to 4pm MT weekdays." |
| 4 Oct "Hub sync routines stay with the chat projects" | Obsolete since the 13 Nov merge | Replace with "Radar owns the one Hub sync." |
| Rule 11 and the 12 Nov "Friday is the WIP review" | Duplicate | Keep the 12 Nov line only. |
| 12 Oct "Friday routines email the agent reports and the week review" | Superseded 12 Nov | Delete. |
| 9 Oct "Sunday lab review" | Partly superseded by the Friday EOW report | Keep the Friday deck; drop the Sunday walk unless Kev still wants it. |
| 5 Oct "paper becomes predictive" (top ten calls) | Superseded 25 Oct ("the paper stays simple") | Delete. |
| 25 Oct, the two Team Hub asks bullets | Duplicate | Merge into one. |
| 21 Oct leads pipeline (Noah enriches) | Superseded 12 Nov (BPO runs exports) | Merge into the 12 Nov line. |
| 9 Oct models | Outdated by the Fable trial | Update after Friday's Fable comparison. |
| 8 Oct Eden Desk deliverables | Possibly superseded by the Command Center Today view | Ask Kev whether the Eden Desk is still where he picks up PDFs. |
| Interrupt rules client list (October) | Stale | Point to the active-clients list in `people.md` instead of a second copy. |
| Sources table copied into 5 files | Duplicate | Keep it only in `sources.md`, rebuilt from this audit. |

Net: about 10 lines removed or merged, the sources table kept in one place, and the four routine prompts cut to a pointer.

<!-- pagebreak -->

## Full inventory (38 tasks, read 19 Nov 2026)

Session: **fresh** = a new session each firing; **persistent** = fires into a standing session (Radar = this session `session_012ech5…`; Dean/scorecards = `session_01VTzu…`; revenue = `session_011pEG…`). Last run: OK = succeeded; none = never fired. Writes: CC = Command Center, RT = Round Table, Hub = Eden Hub, git = commits and pushes.

| # | Task (id) | Schedule (runs a week) | Session | What it does | Last run | Inbox | Writes | Weight | Call |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Radar · Office ticket runner (`trig_01ErM2iYRtdYp2ZqvRcF8EVh`) | Every hour at :43, 24/7 (168) | fresh | Works every open ticket, refreshes the floor, writes phones hourly | OK 19 Nov | no | CC, RT, cockpit Doc, git | heavy | Keep, trim |
| 2 | Radar · inbox sweep (`trig_012VfA1Y4EBzyFoixKVGmNug`) | Hourly 8am to 4pm MT weekdays (45) | fresh | Triage, drafts, ledger rows, Carmel watch, new-JO tickets | fired 19 Nov | yes | ledger, Carmel Tracker, CC tickets | medium | Keep |
| 3 | Team watch · hourly (`trig_01NSwm6rDDPHGLLrbED6gP6p`) | Hourly 8am to 5pm PT weekdays (50) | fresh, Duet channel | Flags team threads waiting on Kev | OK 19 Nov | yes | channel memory | light | Merge into 2 |
| 4 | Team watch · EOD roundup (`trig_01BbM7MX5XqkpRuq68cyhfaM`) | 4:47pm PT weekdays (5) | fresh, Duet channel | Posts pooled team items | OK 19 Nov | yes | channel memory | light | Merge into 9 |
| 5 | Kev's day (`trig_01P5Fh66X57eTV4YfK5b9nu2`) | 7:47 to 3:47 MT, 5 a day, weekdays (25) | fresh, Duet channel | What's next, replies owed, one lead | OK 19 Nov | yes | none (reads CC) | light | Merge into 2 |
| 6 | Heartbeat (`trig_01AebvS3J8i4qiNNZgNP3nF5`) | 5 a day, every day (35) | fresh, Duet channel | 3-hour look back and ahead | OK 19 Nov | yes | none | light | Retire |
| 7 | Morning brief (`trig_01Lszhp3faRnTzH2D9mCjWEw`) | 8:29am MT daily (7) | fresh, Duet channel | Morning brief | OK 19 Nov | yes | none | medium | Retire |
| 8 | Radar · 5:30 brief (`trig_01CWiJZcDZS9xJGZrxo5sjVh`) | 5:22am PT Sun to Fri (6) | fresh | Journal prompt and the paper, push and email to Kev | OK 19 Nov | yes | email to Kev | medium | Keep |
| 9 | Radar · EOD check-out (`trig_01W4kTyfCd7VhMkvt5LDRZ9s`) | 5:30pm PT Mon to Thu (4) | fresh | Admin card session, ledger, fires stand-up | fired 19 Nov | yes | ledger | medium | Keep |
| 10 | Radar · stand up tomorrow (`trig_016GSTsKArqZBPRZc2ZzFaTj`) | 8:47pm PT Sun to Thu and Sat (6) | fresh, Fable | Builds the Eden Daily, leads sheet, calendar holds | OK 19 Nov | yes | Drive, calendar, ledger | heavy | Keep |
| 11 | Radar · EOW agent reports (`trig_019qLwVnxBotcrE3J9gZh4YE`) | Fri 1:50pm PT (1) | fresh | Status deck per employee, email to Kev | OK 13 Nov | no | git, Desk cards, hit-list Doc | heavy | Keep |
| 12 | Daily candidate submission log (`trig_018JYuwK2wXC24dUwKPDBuAz`) | 11:59pm PT daily (7) | fresh | Logs the day's PTCs to the Master Candidate Tracker | OK 19 Nov | yes | Sheet | heavy | Retire (ask) |
| 13 | Q · Sync patrol (`trig_01227CDiRxvhmm2jYn2f6Qui`) | Every 2h 6am to 8pm PT Sun to Fri (48) | fresh | Stale desk and bench check and fix | OK 19 Nov | no | CC, git | medium | Merge into 1 |
| 14 | CloudTalk dials Mon to Thu (`trig_01RL9DfefxS3dqUoXBfPV2mv`) | 5am, noon, 5pm MT (12) | persistent, Radar | Dials counts to phones docs | OK 19 Nov | no | CC, RT, Hub | medium | Keep, absorb 16 |
| 15 | CloudTalk dials Friday (`trig_015gB8FiLjniotbRExTftuHQ`) | 5am, noon, 3pm MT (3) | persistent, Radar | Same, Friday | OK 13 Nov | no | CC, RT | medium | Keep, absorb 17 |
| 16 | Round Table Crelate refresh Mon to Thu (`trig_01XcZWno2PBTayqAtetPXXiY`) | 5am, noon, 3pm, 10pm MT (16) | persistent, Radar | Crelate board to `board/current` | OK 19 Nov | no | RT, Hub | medium | Merge into 14 |
| 17 | Round Table Crelate refresh Friday (`trig_01RkbwYPyLvPJz6X7GG9vA6Z`) | 5am, noon, 3pm MT (3) | persistent, Radar | Same, Friday | OK 13 Nov | no | RT | medium | Merge into 15 |
| 18 | Round Table · Friday 9:55 Crelate pull (`trig_01St9Nt62QZYv2ByTsLMvdbq`) | Fri 9:55am PT (1) | persistent, Radar | Board, scorecard rows, Pipeline Review | OK 13 Nov | no | RT, Pipeline Review, git | heavy | Keep |
| 19 | Scorecard week opens (`trig_01E441PtzdchCurA953f9d2m`) | Thu 5pm PT (1) | persistent, Dean | Opens week to Sunday 5pm, prefill | none yet (first tonight) | no | RT, 7 desks | medium | Keep |
| 20 | Friday scorecard numbers 7:50 (`trig_01XHQhkPGAZyn5n2XAQHvL95`) | Fri 7:50am PT (1) | persistent, Dean | Resets week, lockAt Friday noon, prefill | OK 13 Nov | no | RT, 7 desks | medium | Retire (conflict) |
| 21 | Scorecard check 8, 9, 10 (`trig_01LMKs71p6roXDoWWaWoRqnS`) | Fri 3x (3) | persistent, Dean | Pulls stamped scorecards | OK 13 Nov | no | RT | medium | Retire |
| 22 | Scorecard final pull 12:05 (`trig_01M3DPVgDtZxM9maeD5dwU1g`) | Fri 12:05pm PT (1) | persistent, Dean | Final pull, leadership order | OK 13 Nov | no | RT | medium | Keep, move to Sun 5:05pm |
| 23 | Refresh scorecards button (`trig_01PwR26dHGicgChmvN3URXQh`) | None, on demand (0) | persistent, Dean | Shared pull steps | OK 13 Nov | no | RT | medium | Keep |
| 24 | Dean · prescreen sheet check (`trig_0131UL3yYx2FELzaK4CeLFG4`) | 5am, noon, 5pm PT Sun to Fri (18) | persistent, Dean | Scores new prescreen responses | OK 19 Nov | no | repo log, review page | medium | Retire |
| 25 | Dean · Tuesday training prep (`trig_01XQbqoqvmtXHutEkgLEWm8S`) | Tue 7:43am MT (1) | persistent, Dean | Run of show for Wednesday | OK 17 Nov | no | git, CC ticket | heavy | Keep |
| 26 | Dean · Wednesday touch-up (`trig_013Qd8Ho1R42ZrrwVsir7LiN`) | Wed 8:13am MT (1) | persistent, Dean | Pre-training touch-up | OK 18 Nov | no | arc log | medium | Keep |
| 27 | Hawk · look-ahead refresh (`trig_01JdgaDTL35YosX17Qh5qDy1`) | 8:37pm MT Sun to Thu, Sat (6) | fresh | Calendar mirror, Runway, CC card | OK 19 Nov | no | Look Ahead, Runway, CC, git | medium | Keep |
| 28 | Hawk · Sunday stand-up prep (`trig_01VQdw7e9JuBXm6iH7i5hYTm`) | Sun 2:13pm MT (1) | fresh | Week prep, runway to Jenny | OK 15 Nov | no | CC, git | medium | Keep |
| 29 | Day board · weather (`trig_018FCdcNraLWu8odGvU2jLAU`) | 5:20, 11:20, 4:20 MT Sun to Fri (18) | fresh | Weather for 5 places | OK 19 Nov | no | Day Board | light | Keep, once a day |
| 30 | Eden Life Hub sync + backup (`trig_01P5ZvQveQ6RcgWswL6kNCBm`) | 1:52am PT daily (7) | fresh, Opus | Both Hub halves, nightly Drive backup Doc | OK 19 Nov | no | Notion, Drive | medium | Keep, twice a week; backup weekly |
| 31 | Revenue dashboard refresh (`trig_01CDBVc72E5vQGYGjc2egtey`) | 5am MT Mon, Wed, Fri (3) | persistent, EDEN-DAILY | Sheet to `revenue-data.js` PR | OK 18 Nov | no | git PR (EDEN-DAILY) | medium | Keep (ask if used) |
| 32 | 360 watch: Friday question 4 (`trig_01KfxUtras1j88EUYTs9FVrU`) | One-shot 20 Nov | persistent, Radar | Private question to Kev | pending | no | none | light | Keep |
| 33 | 360 watch: 30-day review (`trig_014UWdpeKtYe5y8RnS9C7exH`) | One-shot 25 Nov | persistent, Radar | Private 30-day review | pending | no | none | medium | Keep |
| 34 | Rhaven watch (`trig_01EecHv7qCVjqdZArrrqaYYm`) | Disabled | fresh, Duet | Watched Rhaven briefs to 19 Nov | OK 10 Nov | yes | none | none | Delete |
| 35 | Radar · ticket runner, old copy (`trig_011ZgL3VQ6xsdJiLeSCoaA1H`) | Disabled since 22 Oct | fresh | Replaced by #1 | OK 22 Oct | no | none | none | Delete |
| 36 | Round Table · Friday cards PDF (`trig_01Ar4uQ9rxBQg5Z3DUzG7f9H`) | Disabled since 13 Nov | persistent, Radar | Superseded by WIP review | OK 7 Nov | no | none | none | Delete |
| 37 | Radar · Friday week review (`trig_01C69u4TUwZweJPjPjwoz9Yr`) | Disabled since 13 Nov | fresh | Superseded by WIP review | OK 6 Nov | no | none | none | Delete |
| 38 | Hub sync · Workshop (`trig_01TEPbgFTNUqtJLoREkjFK4Y`) | Disabled since 13 Nov | fresh | Merged into #30 | OK 12 Nov | no | none | none | Delete |

## What I was unsure about

- Whether Kev reads the Duet channel posts (Kev's day, Heartbeat, Team watch) more than Radar's pushes. If he does, keep the Duet channel as the delivery surface and have the sweep post there.
- Whether the Master Candidate Tracker sheet, the EDEN-DAILY revenue dashboard and the Eden Desk are still in use.
- How a persistent-session firing is metered: it lands in a long session, so it may cost more per run than a fresh one. Weighted medium here.
- Weights are judgment from prompt size and run times (30 seconds to 10 minutes), not measured tokens. Kev's Settings usage percentage on Friday is the real check.
