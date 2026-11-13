# Round Table: database layout (Dean, 21 October 2026)

Page: `projects/workforce/draft/round-table.html` (title "Round Table"). Private to Kev; since 13 Nov anyone else it is shared with sees only the Friday scorecard (see the last section). Read-only: Radar, Dean and Tally write with `ArtifactData`. Not published. Example data shows until `claude.use("db")` resolves, then the page reads the live store only.

## Paths

| Path | One document is | Writer |
|---|---|---|
| `people/{slug}` | A folder (slug: `max`, `evan`, `noah`, `andrew`, `bridger`, `kyle`, `nick`) | Radar (roster), Dean (light) |
| `people/{slug}/scorecards/{weekOf}` | One week, id = Monday as `YYYY-MM-DD` | Dean |
| `people/{slug}/coaching/{weekOf}` | One work-only note | Dean |
| `people/{slug}/money/{mtd or ytd}` | Gated revenue, commission, percent to goal | Tally only |
| `people/{slug}/goals/targets` | Whether Kev has set the goal | Radar, on Kev's word |
| `people/{slug}/goals/ten-five-three-one` | Headline goals | Dean, from the worksheet |
| `people/{slug}/deliverables/{id}` | A deliverable or a job order (`kind`) | Dean; Radar for JOs from the Hub |

## Fields

`people/{slug}`: name, role, group (`headhunter`, `incoming`, `ops`), sort, light (`green`, `amber`, `red`, `grey` no data, `none` no light yet), light_why (one line, shown inside the folder only), light_rule (rule version), worksheet_url (their 10-5-3-1 doc), updated. The landing reads only these, and shows name and light.

`scorecards`: week_of, partial (true for a partial week, never triggers red), source ("Crelate as of Fri 11:59 AM PT"), rps, rp_days (days at 15 or more, of 5), mps, jos, resumes, screens, ptcs, subs, ftis, referrals, lvms, boxes (of 42), box_card_in, pillar. The page computes last week, the four-week average of prior complete weeks, and the direction (within 5 percent is Level).

`coaching`: week_of, numbers, win, one_change, pillar, ask, next_rep {text, due}. Work only. The page shows the latest in full and earlier ones as a list.

`money/mtd`, `money/ytd`: period, as_of, entity (EES or EPG), source, gate_id, gate_status (`passed`, `pending`, `not checked`), revenue, commission, pct_to_goal (Tally computes it against Kev's goal). The page shows a figure only when gate_status is `passed`, gate_id is present and revenue is a number. Anything else reads "Not synced" with the gate id box ("none yet" if empty). The page computes nothing here.

`goals/targets`: goal_set (true once Kev sets it), label ("2026 revenue goal"), set_on. Absent or false reads "Goal not set". No amount is stored or shown.

`goals/ten-five-three-one`: rows [{span ("10 years", "5 years", "3 years", "1 year"), work, life}], updated. Headlines only; detail stays in the worksheet.

`deliverables`: kind (`deliverable` or `jo`). Deliverable: title, due (`YYYY-MM-DD`), status (`open`, `done`). Page marks Overdue past the date, Due soon within 2 days. JO: title (role), location, role_on_job (lead, co-lead, backup, standby), since (`YYYY-MM-DD`), hub_url. No client names (Hub only). 14+ days on the job, not standby, shows "rotate?".

## The board (Q, 23 Oct 2026)

Top of the landing page: THE BOARD (team totals this week vs last week to the same point, vs goal), a leaderboard (one row per recruiter, Nick and Kev below the line), "By active JO", and "WIP reports" (one slot per recruiter). Built from `projects/workforce/board/current.json`, which `npm run recruiting-board` writes from Crelate (read-only; code in `workshop/workforce/`).

| Path | One document is | Writer |
|---|---|---|
| `board/current` | The whole board document (the JSON file as is: team, recruiters, leadership, jos, revenue, notes, `generated_at`) | Radar, from Dean's Friday run: `ArtifactData set` with `file_path` |
| `wip/{slug}-{weekOf}` | One WIP report: slug, week_of, title, received, url (https), note (one line) | Dean or Radar, the day it arrives |

- The page reads `board/current` only. (Until 13 Nov a snapshot was embedded as a fallback; removed because recruiters can now open the page.)
- Revenue: the Hub "Annual Billings" figure is shown as "not gated by Tally". Per-recruiter billed and percent to the $25k a quarter accelerator read "not synced" until the Rev Report tab is exported (credit = Eden Gross x Split % on rows naming the recruiter, by Start Date in the quarter; Tally to confirm that rule). Screen-share hides all revenue and masks JO names to their number.
- JO names carry the client name (Kev's 23 Oct ask overrides the "no client names" line above for this table; Kev-only page).

## Reads and privacy

- Landing: one subscription, `people`. Opening a folder subscribes to that person's five subcollections only; closing or switching drops them.
- Screen-share switch (kept per tab): closes the open folder, hides the Coaching, Revenue and commission and Percent to goal tabs, and never subscribes to `coaching` or `money`. Percent to goal is hidden too (A) because it is a revenue ratio.
- Never stored here: health, family, age, pay detail beyond Tally's gated commission figure, candidate contact details, client names.

## Rules to declare at publish (A, Kev to confirm who sees it)

`capabilities: {db: {rules: [{path: "", read: "admin", write: "admin"}]}}`. Only Kev and editors read; nobody else sees a row. Limit: rules key on path, so they cannot lock `money` or `coaching` inside `people/{slug}` while leaving the rest open. If Kev wants Nick to see scorecards but not money or coaching, move those two to `private/{slug}/...` and put an owner-only rule on `private`.

## Friday scorecards on the Round Table (Dean, 13 Nov 2026, late)

One page, two views. The page asks `user.isOwner()` first:
- **Kev (owner)**: the Round Table as before, plus the live leadership order and live card fill below.
- **Anyone else** (recruiters, shared as Contributor): only the 7-tab Friday scorecard (same flow, copy and look as `scorecard-desk/template.html`). Nothing else of the Round Table is drawn or requested; the page reads and writes only the four paths below. Outside Claude (no viewer) the example Round Table shows.
- The embedded Crelate snapshot (`#board-snapshot`) was removed: page source is readable by everyone the page is shared with and it carried billing figures. The board now comes only from `board/current`.

| Path | One document is | Writer |
|---|---|---|
| `scmeta/week` | weekOf (Monday YYYY-MM-DD), weekLabel, window, lockAt (ISO; read-only after) | Dean / Kev (admin) |
| `scpre/{slug}` | dials, rps, days_at_15, resumes, ptcs, ftis, mps, window | Dean (admin), from the Friday prefill |
| `sc/{uid}` | {person: slug, name, weeks: {weekOf: answers}}; answers exactly as the desk template stores them (wins, grew, prospect, cv[21], lived_out, nominee, wr[8], w[8], d[35], numbers_note, self_score, align, autopsy, next_week, wip, jos, stamp {init, at, edited}, updated, week_of) | The recruiter (whole-doc `set`, debounced) |
| `cd/{uid}` | {weekOf: {burnout, need, resolve, updated}} candor | The recruiter; only Kev reads |

- Identity: `uid = user.id()`. First visit: profile first name matched against Max, Evan, Noah, Andrew, Bridger, Nick; otherwise a one-time picker. `person` is then fixed (Kev fixes a wrong one by editing `sc/{uid}.person`).
- Leadership order: Kev's view subscribes to `sc` and lists people with `weeks[weekOf].stamp`, by `stamp.at` ("1 · Evan · EM · 8:42 AM PT"); Waiting = roster minus stamped, "(started)" when they have answers. `queue/{weekOf}` and the Refresh button are retired (no `mcp` capability).
- Live card fill: when a person's week is stamped, Kev's open page merges it into `people/{slug}/cards/{weekOf}` by `scorecard-desk/compile.py` rules (ported to JS): text fields with survey_src replacement, boxes only where the card has none, burnout from `cd` only if the card has none, never kev_score/coach_notes/needs/advice/pip/pip_reason; adds survey_compiled, survey_src, stamp. One write per card, only when the text or stamp changed. Runs only while Kev has the page open.
- The card tab shows "From the scorecard" (finished time, initials, self score) and, outside screen-share, Kev-only candor in the coach box. Screen-share hides burnout, candor and coaching and drops the `cd` subscription.
- Rules (published 13 Nov, contract 0.2.88): `[{path:"",read:"admin",write:"admin"},{path:"sc",read:"owner",write:"owner"},{path:"sc/{self}",read:"interact",write:"interact"},{path:"cd",read:"owner",write:"owner"},{path:"cd/{self}",read:"interact",write:"interact"},{path:"scmeta",read:"interact",write:"admin"},{path:"scpre",read:"interact",write:"admin"}]`, plus `user: {scopes: ["profile"]}`. Probed at `interact`: people, board, queue, cd read empty; sc/<other id> and scmeta writes refused; scmeta/week readable.
