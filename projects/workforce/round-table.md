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

## RP meter and earlier weeks (Dean, 14 Nov 2026; Kev 13–14 Nov, thread 7e0675ca)

Built on live version 16 (Q's 14 Nov earlier-weeks work was live but not in the repo; this file now carries both). Owner view only; the non-owner scorecard view is byte-for-byte unchanged and still reads only `sc/<uid>`, `cd/<uid>`, `scmeta/week`, `scpre/<slug>`.

**RP meter** (display only, nothing written). Zones for RPs in a day: under 15 Below the floor; 15 Floor (yellow, blending to green by 20); 20 Dawg (green, "the standard for a dawg"); 25 Operational excellence (gold, star); 30+ Best day (deep gold, flame). Needle = the latest weekday in `board/current` `recruiters[]`/`leadership[]` `.rp_by_day` (this week, from `week.mon_start`); the marker inside the arc and the text line = this week's daily average, plus `rp_days_at_15` and `this.rps`. Mon–Fri strip below, each bar coloured by zone; dials per day under each bar from `phones/current` (`dayKeys` + `people[].days`, matched by first name) when present. Full gauge at the top of the open folder's card (this week only); a mini gauge with today's number and zone in a new "RP meter" column on every leaderboard row. No `rp_by_day` → "No RPs logged yet", never a zero needle. Shown in screen-share (RPs are already on the leaderboard there).

**New card fields** on `people/{slug}/cards/{weekOf}` (Kev writes them from the page; whole-doc `set`, same 700 ms save as the live card):

| Field | Shape | Notes |
|---|---|---|
| `numbers` | `{rps, rp_days, resumes, ptcs, ftis, dials, entered_by: "kev"}` | "Numbers for this week" form on a closed week with no Crelate scorecard row. The Numbers and trend tab (table, four-week average, five-week chart) uses it for any week `scorecards` has no row for, marked "entered by Kev". Removed when every box is cleared. |
| `items` | `[{text, added (ISO)}]` | Action items on each "Week of" tile, appended with "Add an item" (Enter works). Kev only; hidden in screen-share. |
| `pip_start` | `YYYY-MM-DD` | On the card where the PIP run begins; default that week's Monday. Editable on the PIP strip. |
| `ask_need`, `ask_resolve` | text | Dean writes them from the scorecard's candor section. Shown under "From the scorecard" on the card, Kev only, hidden in screen-share. Kev's card saves always carry Dean's latest values for these two, so a save never wipes them. |

**PIP strip** (Earlier weeks, Kev only, hidden in screen-share): the latest run of cards with `pip: true`; the latest `pip_reason` in the run; Started (`pip_start`); Day 30 (start + 30 days, days left); and each week since with the card score against 90%, boxes, and the RP week against 75 (Crelate row, else `numbers.rps`, else this week's board so far).

Every "Week of" tile that has anything on it now opens by default, so notes, needs, advice and action items read on the tile.

Known, unchanged from v16: in screen-share Kev's page still `get`s `cd/<uid>` once when it fills a stamped card (the merge), though candor is never drawn or subscribed there.

## Meter copy and scorecard consolidation (Dean, 15 Nov 2026, t-202611140115-rpmm)

Kev: coaching notes landed in individual scorecard artifacts; he wants everything reviewed from one spot, and the CloudTalk/Crelate day-by-day RPM-style meter during scorecards. The meter already exists (section above); today's edit in `draft/round-table.html` adds "Every RP past 20 is very incentivizing." to the dawg-zone line (source only, not republished). Zones: under 15 below, 15 yellow trending green, 20 green (dawg standard), 25 operational excellence, 30 best day.

**Consolidation plan (all steps are QC items; nothing done):**

| # | Step | Class |
|---|---|---|
| 1 | Read each per-person desk (Max, Evan, Noah, Andrew, Bridger, Nick, Kev; URLs in `scorecard-desk/README.md`) with `Artifact read` and `ArtifactData list` on `weeks` and `candor`; list any `coach_notes`, `needs`, `advice` or free text Kev typed there | read only |
| 2 | Map each to `people/{slug}/cards/{weekOf}` (coach_notes, needs, advice); build the write file with `compile.py` rules, never overwrite a non-empty field, pin `if_version` | write_external QC, exact docs and fields listed |
| 3 | Publish `draft/round-table.html` (meter copy plus any pending fixes). Not between Thu 5 PM and Sun 5 PM PT | publish QC |
| 4 | Kev confirms the cards hold everything; then unshare or delete the old per-person desks (Drive/Claude move is Kev's) | delete QC |
| 5 | Folder tidy: the Round Table folder per person (`people/{slug}`) holds the card, scorecard and coach notes; no separate artifact per person | Kev |

Blocker this session: no Claude artifact or Drive connector available, so steps 1 to 4 are prepared, not run. Recommendation: approve step 1 first (read only).
