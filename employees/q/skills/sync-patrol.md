# Sync patrol: keep every desk and bench on the Command Center live (Kev, 27 Oct 2026)

Kev: "Q needs a recurring task. He should go through and do a QC check for every agent behind the scenes. Anyone whose data is stale past 1–2 hrs, he should figure out means to get them synced and up to date." His examples were benches reading "not synced" (Client work, Recruiting floor · Vancouver) and Finance reading "updated 4d".

The Command Center is https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW (local source `projects/virtual-office/draft/eden-office.html`). Its database collections: `agents`, `benches` (+ `benches/{id}/rows`), `tools`, `tickets`, `alerts`, `meta`.

## When

Every 2 hours, 6am to 8pm Pacific, Sunday to Friday. Run `npm run sabbath -- --json` first; on the Sabbath, stop with one line.

## The check (read only, every run)

1. **Desks.** Read `agents`. A desk is stale when `lastHeard` is older than its `expectedEveryHours` (default 96) or `updated` is older than 2 hours. Run `npm run office-prep -- run` first (it refreshes every desk from memory, QC, tickets and asks); then re-read and list only the desks still stale.
2. **Benches.** For each bench in `BENCH_DEFS` (recruiting, revenue, finance, depth, university, client, projects, family), read `benches/{id}`. Stale = no document ("not synced"), or `asOf` older than its window below.
3. **Tools.** Read `tools`; stale = a link that 404s or an `asOf` past its window.
4. **The sync itself.** `meta/sync` older than 2 hours means the hourly runner missed: say so in the report.

## Bench sources and windows

Write `projects/virtual-office/bench-sources.json` on the first run (id, owner, source, window, how to compute) and keep it current. The starting map:

| Bench | Owner | Source | Window | What goes on it |
|---|---|---|---|---|
| client | Casey | Team Hub `jobs` (https://claude.ai/artifact/7kccfScydYDcWoXfeeE8q6) and `projects/team-hub/` | 2 h | Counts: active, new this week, on hold, filled, killed JOs; JOs with no owner; lead sheets landed and phoned (Lead Log) |
| recruiting | Dean | latest Round Table scorecard week (`round-table` artifact and `projects/workforce/`) | 24 h on weekdays | Team totals only: RPs, PTCs, submittals, FTIs this week vs the 15-RPs-a-day standard. No names with numbers, no pay |
| depth | Dean | new-hire setup and depth chart files under `projects/workforce/` | 24 h | Counts: people onboarding, 30-day plans open |
| university | Dean | Eden University files | 7 d | Tracks and modules live, next Wednesday training |
| projects | Pam | Eden Staffing milestones (`projects/` brief naming pm) | 24 h | Milestones due this week, slipped, done |
| family | Radar | ledger rows in the Home lane (Notion) | 24 h | Counts only: open, due this week. Nothing private |
| finance | Tally | QuickBooks via Tally | 24 h | **Never written by Q.** Figures need Tally plus the numbers gate |
| revenue | Tally + Dean | Hub Rev Report via Tally | 24 h | **Never written by Q.** Same rule |

Write a bench as `{ id, owner, source, asOf, tiles: [{label, value, source, asOf}] }`, pinned with `if_version`. Counts and dates only. Every tile names its source.

**Writers exist (27 Oct 2026).** `workshop/core/benches.ts` and `workshop/office/benches.ts` build client, recruiting, depth, university, projects and family; `npm run office-prep -- run` writes them every hour (the runner's dump must include `benches` and the Team Hub `jobs`). `npm run benches -- --jobs <jobs.json>` prints what would be written. The source map and each bench's windows are in `projects/virtual-office/bench-sources.json`. A bench's `asOf` is the sync time while its source is inside its `sourceWindow`, otherwise the source's own age (Pam's schedule file, a Friday board file), so "updated 4d" still means old data; the cure is the owner's ticket, never a bumped date. Family needs Radar to pass the Home-lane ledger rows as `<dump>/ledger.json`.

## Fixing what is stale

For each stale item, find the cause before you fix it:
- **No writer exists** (most benches today): compute the tiles from the source above and write the bench, then add the computation to `workshop/office/` so `office-prep run` keeps it fresh every hour without you. Tests go with it.
- **The owner's own routine missed** (for example Dean's Friday pull, or Tally's month-end refresh): open a ticket to that owner on the Command Center (`tickets`, agent = owner, priority today) saying what is stale and since when. Do not do their job.
- **A connector or login is down** (QuickBooks needs re-authorising, Crelate key missing, Google Sheets not connected): you cannot fix it. Add one line to Radar's feed naming the connector and the link where Kev fixes it.
- **Finance or revenue**: open a Tally ticket. Never write a money figure; a figure needs the numbers gate.

Never mark something fresh by bumping `asOf` without new data behind it.

## Report

One done ticket on your own feed per run: desks stale before → after, benches synced, tickets opened, and anything blocked with its fix. If everything was already fresh, write nothing.

Raise a red alert to Radar only when the same item is still stale after 3 runs.

## Never

- No pay, phones, emails, health, family or candidate detail on any bench. Sensitive benches (recruiting, revenue, finance, depth, family) still carry counts only.
- No client names on a tile, and never "Client · discreet" (no client is discreet since 13 Nov 2026).
- Never write `actions` (those are Kev's taps), never approve, never delete.
- Commit any code or source-map change and push: `git push -q origin HEAD:claude/pensive-brown-18gll8 HEAD:workshop/phase-0` (on rejection fetch, merge `origin/claude/pensive-brown-18gll8`, push again).
