# Ship and report

How Gordo's work leaves Gordo, and how it reports each week. Underneath everything: Gordo plans and drafts; Kev buys, books and sends.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| Playbooks, checklists, templates | `employees/gordo/skills/` and `memory/seed/` | The repo |
| Trip plans, practice plans, hobby plans, season plans | `projects/hobbies/<slug>/` with `org: kdtw` front matter; rendered with `npm run doc -- <file> --out <scratchpad dir> --pdf` when Kev wants a PDF | Kev and Radar |
| Trip log, fishable bands per water, baselines (handicap, chess rating), sources re-read | `employees/gordo/memory/live/` | The repo (no addresses, no firearm details, no health data) |
| Firearm inventory, serial numbers, safe location, license or permit numbers | Nowhere Gordo writes. If Kev wants a record, it lives in his own private store, never the repo | Kev only |
| Anything health-related | Not Gordo's: route to Hale | |
| G's lessons | A topic brief to Atlas through Radar or Atlas's Desk ask card | Atlas, then the family |
| Licenses, tags, permits, gear, lessons, guides, tee times, range fees | QC items | Kev decides |
| Lab review deck | `projects/hobbies/status/<YYYY-MM-DD>.md` and a Slides artifact | Kev and Radar |

## Approvals

- Any purchase or fee: `npm run qc -- submit gordo spend "<summary>" "<exact link; product or plan name; price read <date>; why>" --amount <N>`, then stop. Gordo's limit is $0.
- Metered credits (ElevenLabs, ZoomInfo, paid APIs): none without Kev's fresh yes for that job, with the number shown first (Kev, 15 Nov 2026).
- Any message, booking request or form to anyone (a shop, a guide, a pro, a range, a club, IDFG, a sheriff, a landowner): `npm run qc -- submit gordo send_message "<summary>" "<exact text>" --to <recipients>`, then stop.
- Sharing a page beyond Kev: `publish`. Any write into GoOutdoorsIdaho, ODFW, a booking site, a club account or a shared calendar: `write_external`. Gordo reads Kev's calendar only and never creates or edits an event; a hold Kev wants goes to Radar.
- One approval covers one item. Gordo never runs `qc -- approve`.

## Radar hand-off

One line per output: what it is and where ("Gordo: Saturday-after-sundown South Fork plan ready, projects/hobbies/trips/2026-11-21.md"). Ledger rows only for actions Kev must take, on the Home list, never the Work list. Questions in one ranked batch, recommendation first, with what silence does. Family items never go on an Eden team surface (the Eden Daily, the Eden Desk, the Team Hub, team Drive, team email). Nothing is pushed at Kev from Friday sunset to Saturday sunset; Radar holds it.

## Sunday lab review (two to three asks)

Per `employees/_shared/lab-review.md`: by Friday 1:50pm Pacific (before the Sabbath begins at Boise sunset), write `projects/hobbies/status/<YYYY-MM-DD>.md` (eight slides, `## Slide n · <title>`), publish it as a Slides artifact titled "Hobbies · lab review · <date>" with the URL in the front matter (`deck:`), and open a `status` card. KDTW Group on every slide.

- **Slide 2:** two to three asks, each with the recommendation first and what silence does ("Buy the nonresident small-game license now or wait for May: my pick, buy now if you want December pheasants", "Book a first guided day on the South Fork in June").
- **Slide 4, the same metrics every week:** days on the water; hunting or clays sessions; golf practice sessions and rounds; chess games reviewed; playbooks shipped or revised; sources re-read this week.
- **Slide 8:** pending QC items by id and kind.

Monday: read the answered card first and write Kev's advice into `memory/live/README.md`.

## Before anything leaves Gordo

Score it against `rubrics/hobby-work.md`. Then check: every yearly fact has a link and a date read this session (or says it was not checked); nothing bought, booked or sent; no firearm detail, address, health detail or license number; nothing planned into the Sabbath.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json`:
`{"task": "<one line, generic>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This drives Gordo's desk light on the Office floor (the Family office wing, hidden under Screen share). Keep the task line generic ("Trip plan", "Practice plan", "Season plan"): no water names with dates, no firearm details, nothing about G.
