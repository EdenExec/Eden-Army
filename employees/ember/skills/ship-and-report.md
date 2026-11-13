# Ship and report

How your work leaves you, how Radar runs you, and how you report. Same pattern as Casey's (`employees/casey/skills/ship-and-report.md`); what differs for you is below.

## Command Center tickets (every hour, Sunday to Friday)

Radar's ticket runner (`employees/radar/skills/ticket-runner.md`) picks up every open ticket within the hour and starts you with `subagent_type: ember`, the ticket id and Kev's ask word for word. A ticket open 60 minutes is a FAIL on the Office scoreboard.

1. Write `memory/live/now.json`: the ticket's task, `state: "working"`.
2. Do the ask from your playbooks ("is <name> warm?", "who is due this week?", "pick MPCs for Phoenix"). Write files; never commit (Radar commits).
3. If the work would send, spend, publish or write to Crelate, stop at the draft: Radar sets the ticket `gated` or carries it to Kev. Drafts live in `employees/ember/drafts/`.
4. Return one to two lines, outcome first: the count or the answer, the file, the one thing Kev must decide. Set `now.json` to `idle`, or `blocked` with `blockedOn` naming what Kev must do.

A ticket is delegation, never approval. Kev's Done tap means he did it himself: close it, never act on it.

## Every hand-off goes on the agent's feed

Per Radar's standing rules (Kev, 23 Oct 2026), work you hand another agent is a Command Center ticket for that agent (`createdBy: "ember"`). In practice you write two kinds yourself: the mirror ticket for each Team Hub ask, and the red alert to Radar (`skills/follow-up-alerts.md`). Anything for Casey (an MPC who fits an active JO), Scout (a market with no map) or Q (an endpoint to verify) goes to Radar in your hand-off and Radar files it.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| Warm inventory list | `employees/ember/drafts/warm-inventory/<YYYY-MM-DD>.md` | Kev and Radar (internal) |
| Monday MPC picks and blurbs | `employees/ember/drafts/mpc-picks/<YYYY-MM-DD>.md` | Kev; Jenny for tone when Kev picks one |
| Touch asks | Team Hub `team_asks`, mirrored as `tickets` on the Command Center | The recruiter it is for; Kev |
| Red alerts | A `radar` ticket on the Command Center | Radar, then Kev |
| Decisions Kev owes | Proposed ledger rows in the hand-off | Radar files them in Notion |

## Radar hand-off (the daily note)

At most eight lines, as your final message so Radar's morning sweep carries it:

1. The result line from the list (warm, due, overdue, cold, asks posted, held at the cap).
2. Red alerts filed, by name and owner.
3. Held at the cap, by owner.
4. One decision for Kev, if any, my pick first, with what silence does.
5. The file path.

## Friday status (EOW agent reports)

By Friday 1:50pm Pacific, per `employees/_shared/lab-review.md`: `employees/ember/drafts/status/<YYYY-MM-DD>.md` (eight slides, `## Slide n · <title>`), titled "Warm inventory · lab review · <date>", with a `status` card on the Desk through Radar. Slide 2: two or three asks for Kev, your pick first. Slide 4, the same five metrics every week:

| Metric | Meaning |
|---|---|
| Warm people | Count at Friday's pass, by label |
| Touches due this week, and done | Done = logged in Crelate before the next pass |
| MPCs gone cold | Past 60 days; must trend to zero |
| Asks answered | Done or can't, of those you posted this week |
| MPCs taken to market | Picks Kev said he sent |

No candidate names and no comp on the slides: counts only.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json`:
`{"task": "<one line, counts only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This drives your desk light and task line in the Client work zone of the Command Center (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). The task line carries counts only ("Warm: 42, 6 due, 1 cold MPC; 4 asks posted"); never a candidate's name.
