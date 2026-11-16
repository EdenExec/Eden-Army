# Friday scorecard desks (one page per recruiter)

> **13 Nov 2026, late: the scorecard now lives inside the Round Table** (https://claude.ai/artifact/DTXbu7B6F3B2s8NEnmYdCE). Kev shares the Round Table with each recruiter as Contributor; they see only their scorecard, and "Finish the week" lands on Kev's Round Table live (order + card fill), no copy step. Paths there: `scmeta/week`, `scpre/{slug}`, `sc/{uid}`, `cd/{uid}`; layout and rules in `projects/workforce/round-table.md`. The per-person desks below and Dean's pull/queue tasks are superseded; Dean's Friday prefill must write `scpre/{slug}` (and `scmeta/week`) on the Round Table. `compile.py` stays the reference for the merge rules the Round Table runs in JS.

Built 12-13 Nov 2026 for Kev's Friday Power Hour. Each recruiter has their own private Claude page; it replaces the shared scorecard page (`projects/workforce/scorecard-forms/scorecard-page.html`, never used live) and feeds the Round Table (https://claude.ai/artifact/DTXbu7B6F3B2s8NEnmYdCE).

| Recruiter | Page |
|---|---|
| Max | https://claude.ai/artifact/MvpqWmBvj7wks23DHGTRTg |
| Evan | https://claude.ai/artifact/51f2KEWNnjdfx1aatb7aMp |
| Noah | https://claude.ai/artifact/XasPUYY2HLNvtrxUKEEwq7 |
| Andrew | https://claude.ai/artifact/KxYG5DKTi7A3jZogUhTmxy |
| Bridger | https://claude.ai/artifact/NSGBg83ckHnDyreWuu72xx |
| Nick | https://claude.ai/artifact/HCRrLRwCbvqA43YAQQPzJi |
| Kev | https://claude.ai/artifact/XNqDbHUQ2DErWeRKVTUVuT |

Sharing (Kev, Share menu): each page with its one person as **Contributor** (Nick's with Nick; Kev owns his). Nobody else. The whole company fills these in at the Friday Scorecard Power Hour, 10:00 PT / 11:00 MT.

## The flow (Kev, 12 Nov)
10:00 PT / 11:00 MT, about 15 minutes: Wins → the seven core values in sequence → Must Dos (Poor to Excellent) → daily boxes → numbers (prefilled) → Candor (Kev only) → Score & finish (self score, 10-5-3-1, autopsy, next week I will, WIP and JOs, then initials + "Finish the week"). Open Thursday 5:00 PM PT through Sunday 5:00 PM PT (Kev, 13 Nov); after that the page shows "Scorecards have closed for the week. See leadership for help."

## Data (per page)
- `meta/week`: weekOf (the Monday, same key as the Round Table card), weekLabel, window, lockAt. Dean writes.
- `prefill/<weekOf>`: dials, rps, days_at_15, resumes, ptcs, ftis, mps, window. Dean writes from `scorecard-prefill.ts` + CloudTalk outbound.
- `weeks/<weekOf>`: the recruiter's answers. Fields: wins, grew, prospect, cv[21] (one Next week only), lived_out, nominee, wr[8] (Must Dos: 0 Poor, 1 Fine, 2 Good, 3 Excellent), w[8] (true when Good or Excellent), d[35] (card order; Showed up sharp is shown first), numbers_note, self_score, align, autopsy, next_week, wip, jos.
- `candor/<their user id>`: {<weekOf>: {burnout, need, resolve}}. Rules: only the owner (Kev) and the writer read it. Dean copies only burnout to the card.
- Rules: root read interact / write admin; weeks read+write interact; candor read+write owner, candor/{self} read+write interact. Checked 13 Nov with as_level probes.

## Compile (Friday after the survey)
`python3 -I compile.py <weeks.json> <candor.json> <card.json> <out.json>` builds the update; write it with ArtifactData pinned to the card's version. Into Round Table `people/<slug>/cards/<weekOf>` (read, pin if_version): wins, lived_out, autopsy, next_week, burnout, survey_note; d/w/cv only where the card is still empty. Never Kev's coach fields.

## New hire
Add the name to `build.py`, run `python3 build.py template.html out`, publish `out/<slug>.html` with the same capabilities, seed `meta/week`, Kev shares it on their start date.

## Design and behaviour
- Design pass by Marlowe, 13 Nov (Montserrat, black/cream editorial, Must Dos stacked on phones).
- The open tab is remembered per person and week (browser storage), so a reload or a republish lands them back where they were. Answers are saved to the store as they type. Don't republish between Thursday 5:00 PM and Sunday 5:00 PM PT.
- Week stamp (Kev's idea, Marlowe's build, 13 Nov): "Sign off the week" unlocks when the required tabs are done and saves `stamp {init, at, edited}` in weeks/<weekOf>. The pull runs Fridays 10:20, 11:20 and 12:20 PT (scheduled task "Friday scorecards to Round Table (stamped)"): newly stamped pages first, everyone at 12:20. The card's wins field shows the stamp or "Not stamped".

## Friday cadence (Kev, 13 Nov, late)
- Superseded 13 Nov (Kev): open Thursday 5:00 PM PT to Sunday 5:00 PM PT. Thursday 17:00 PT seed task ("Scorecard week opens Thursday 5pm PT") writes meta/week and scmeta/week with lockAt = the coming Sunday 17:00 PT, plus prefill/scpre. Friday 7:50 PT refreshes numbers only (no lockAt). Final everyone-pull to the Round Table Sunday 17:05 PT. No republishing Thursday 5:00 PM to Sunday 5:00 PM PT.
- Sharing must be **Contributor**, not Viewer: a viewer can't read meta/week, so the page says "This week's scorecard isn't open yet" (Andrew, 13 Nov).
- Checks (pull newly finished scorecards into the Round Table and rewrite `queue/<weekOf>` = leadership order by stamp time): 8:01, 9:01, 10:01 PT (weekly), 10:15, 10:25, 10:35, 10:50 (one-shots; cron can't run under an hour apart, so the 10:01 run re-arms them each week), 12:05 final (everyone, stamped or not).
- On demand: the Round Table's "Refresh scorecards" button fires the scheduled task "Refresh scorecards (Round Table button)" through Kev's Claude Code Remote connector.
