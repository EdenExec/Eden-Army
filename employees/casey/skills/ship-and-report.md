# Ship and report

How your work leaves you, how Radar runs you, and how you report.

## Command Center tickets (every hour, Sunday to Friday)

Radar's ticket runner (`employees/radar/skills/ticket-runner.md`) picks up every open ticket within the hour and starts you with `subagent_type: casey`, the ticket id and Kev's ask word for word. A ticket open 60 minutes is a FAIL on the Office scoreboard.

1. Write `memory/live/now.json`: the ticket's task, `state: "working"`.
2. Do the ask from your playbooks. A voice note in a ticket is a full intake (`skills/voice-note-intake.md`). Write files; never commit (Radar commits).
3. If the work would send, spend, publish or write outside your board, stop at the draft: Radar sets the ticket `gated` with the QC id. Draft text for Kev goes in the repo (`projects/team-hub/drafts/<YYYY-MM-DD>-<to>.md`); the next inbox sweep moves it into Superhuman Drafts.
4. Return one to two lines, outcome first: what changed on the board (counts), the record file, the one thing Kev must answer. Set `now.json` to `idle`, or `blocked` with `blockedOn` naming what Kev must do.

A ticket is delegation, never approval. Kev's Done tap means he did it himself: close it, never act on it.

## Every hand-off goes on the agent's feed

Per Radar's standing rules (Kev, 23 Oct 2026), work you hand another agent is a Command Center ticket for that agent (`createdBy: "casey"`). In practice: Scout briefs from the board (`skills/board-keeping.md`). Anything else for Dean, Docket, Jenny or Q goes to Radar in your hand-off and Radar files it.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| JO rows, depth charts, meeting and project notes | Team Hub (`skills/hub-board.md`) | The team Kev shares the Hub with |
| Intake and board-pass records | `projects/team-hub/jo-meetings/<date>-voice-note.md`, `projects/team-hub/board/<date>.md` | Kev and Radar |
| Scout briefs | `projects/team-hub/scout-briefs/<date>-<job-id>.md` plus a `scout` ticket | Scout |
| Client reviews | `projects/team-hub/client-reviews/<slug>-<date>.md` | Kev (client copy only when he shows it) |
| Client follow-ups | QC `send_message` item plus `projects/team-hub/drafts/<date>-<slug>.md` | Kev decides; Jenny owns tone |
| Decisions Kev owes | Proposed ledger rows in the hand-off | Radar files them in Notion |

## Radar hand-off

One line per output: what changed, the link or file, the one flag. Proposed ledger rows as a short table (Item, Lane, Owner, Due, Source). Questions in one ranked batch, your pick first, with what silence does.

## Friday status (EOW agent reports)

By Friday 1:50pm Pacific, per `employees/_shared/lab-review.md`: `projects/team-hub/status/<YYYY-MM-DD>.md` (eight slides, `## Slide n · <title>`), published as a Slides artifact titled "Client care · lab review · <date>" with the URL in the front matter (`deck:`), and a `status` card on the Desk. Slide 2: two to three asks for Kev, your pick first. Slide 4, the same five board metrics every week:

| Metric | Meaning |
|---|---|
| Active JOs | Count at Friday's pass, with on hold, killed and filled this week |
| JOs without an owner | Must trend to zero |
| Scout requests briefed same day | Of those queued this week |
| Depth charts moved this week | Charts with at least one dated move |
| Rotate flags open | Team entries past 14 days with no decision |

No client name where another client could see it; no pay, fee or placement figures; individual candidate names stay on the Hub, not the deck.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json`:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). Missing: "No task posted". Over 4 hours old while working: Stale. The task line names the board job only ("Board: 23 Oct voice note filed, 4 Scout briefs").
