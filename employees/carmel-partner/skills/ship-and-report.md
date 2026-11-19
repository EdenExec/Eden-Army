# Ship and report

How your work leaves you, how Radar runs you, and how you report.

## Command Center tickets

Radar's ticket runner (`employees/radar/skills/ticket-runner.md`) starts you with `subagent_type: carmel-partner`, the ticket id and Kev's ask word for word.

1. Write `memory/live/now.json`: the task, `state: "working"`.
2. Do the ask from your playbooks. Write files; never commit (Radar commits).
3. Anything that would send outside Eden, spend, publish or write outside your tracker stops at the draft or QC item; Radar sets the ticket `gated`.
4. Return one or two lines, outcome first. Set `now.json` to `idle`, or `blocked` with what Kev must do.

A ticket is delegation, never approval. Kev's Done means he did it himself.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| Roles, candidates, people, comms, steps, EOD | The Carmel Tracker database (`skills/tracker-keeping.md`) | Kev, and whoever Kev shares it with |
| Intake records (no candidate names) | `projects/carmel/intakes/<date>-<role-id>.md` plus the role's `intake` field | Kev, Michael, Radar |
| Reply drafts | Superhuman Drafts on the thread; a QC `send_message` item for anything Radar should carry | Kev or Michael sends |
| EOD, status and flags | Email to Kev and Michael (`skills/comms-watch.md`); the `eod` rows | Kev, Michael |
| Decisions Kev owes | Proposed ledger rows in the hand-off | Radar files them |
| Carmel JO stage changes | One line to Casey through Radar | Casey updates the Team Hub |

## Radar hand-off

One line per output: what changed, the link, the one flag. Proposed ledger rows as a table (Item, Lane, Owner, Due, Source). Questions in one ranked batch, your pick first, with what silence does.

## Friday status (Sunday lab review)

By Friday 1:50pm Pacific per `employees/_shared/lab-review.md`: `projects/carmel/status/<YYYY-MM-DD>.md`, eight slides, published as "Carmel · lab review · <date>", and a `status` card on the Desk. Slide 2: two or three asks. Slide 4, the same metrics every week (agreement 11.1 shapes them):

| Metric | Meaning |
|---|---|
| Roles open | Count, with filled and closed this week |
| Candidates by stage | Screened, submitted, interviewing, at offer, started |
| Replies inside 1 hour | Of Carmel messages that needed one |
| Days to feedback | Median hiring-manager feedback time after a submittal |
| Red shot clocks | Candidates 5 or more working days without a touch |

No candidate names, pay or fee figures on the deck.

## Office status

At the start and end of every session write `memory/live/now.json`: `{"task": "<one line, no candidate names>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

## Routines

`routines/comms-watch.md` is written, not scheduled. Radar creates it from claude.ai (Superhuman attached) once Kev says yes.
