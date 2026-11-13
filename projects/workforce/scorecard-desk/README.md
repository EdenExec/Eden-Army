# Friday scorecard desks (one page per recruiter)

Built 12-13 Nov 2026 for Kev's Friday Power Hour. Each recruiter has their own private Claude page; it replaces the shared scorecard page (`projects/workforce/scorecard-forms/scorecard-page.html`, never used live) and feeds the Round Table (https://claude.ai/artifact/DTXbu7B6F3B2s8NEnmYdCE).

| Recruiter | Page |
|---|---|
| Max | https://claude.ai/artifact/MvpqWmBvj7wks23DHGTRTg |
| Evan | https://claude.ai/artifact/51f2KEWNnjdfx1aatb7aMp |
| Noah | https://claude.ai/artifact/XasPUYY2HLNvtrxUKEEwq7 |
| Andrew | https://claude.ai/artifact/KxYG5DKTi7A3jZogUhTmxy |
| Bridger | https://claude.ai/artifact/NSGBg83ckHnDyreWuu72xx |

Sharing (Kev, Share menu): each page with its one recruiter as **Contributor**. Nobody else.

## The flow (Kev, 12 Nov)
10:00 PT / 11:00 MT, about 15 minutes: Wins → the seven core values, in sequence (Lived it / Fell short / Next week, mirrors the card) → Must Dos (the card's 8 weekly) → daily boxes (the card's 35) → numbers (Dial → RP → Resume → PTC → FTI, prefilled) → self score, 10-5-3-1, autopsy, next week I will (action items), WIP and JOs → Candor (Kev only: burnout, what you need, anything to resolve). Stays editable until 12:00 PT so Kev and the recruiter can edit together.

## Data (per page)
- `meta/week`: weekOf (the Monday, same key as the Round Table card), weekLabel, window, lockAt. Dean writes.
- `prefill/<weekOf>`: dials, rps, days_at_15, resumes, ptcs, ftis, mps, window. Dean writes from `scorecard-prefill.ts` + CloudTalk outbound.
- `weeks/<weekOf>`: the recruiter's answers. Fields: wins, grew, prospect, cv[21], lived_out, nominee, w[8], d[35], numbers_note, self_score, align, autopsy, next_week, wip, jos.
- `candor/<their user id>`: {<weekOf>: {burnout, need, resolve}}. Rules: only the owner (Kev) and the writer read it. Dean copies only burnout to the card.
- Rules: root read interact / write admin; weeks read+write interact; candor read+write owner, candor/{self} read+write interact. Checked 13 Nov with as_level probes.

## Compile (Friday after the survey)
Into Round Table `people/<slug>/cards/<weekOf>` (read, pin if_version): wins, lived_out, autopsy, next_week, burnout, survey_note; d/w/cv only where the card is still empty. Never Kev's coach fields.

## New hire
Add the name to `build.py`, run `python3 build.py template.html out`, publish `out/<slug>.html` with the same capabilities, seed `meta/week`, Kev shares it on their start date.
