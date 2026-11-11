# Warm inventory (the weekday read pass)

Done means Kev or any recruiter can open one list and see, for every warm person not in process, when they were last touched, why they matter, when the next touch is due and whose touch it is, with nothing guessed.

## When

Monday to Friday, 7:15am Pacific (routine `routines/warm-inventory.md`), before Casey's board pass. Run `npm run sabbath` first: exit 0 means stop with one line. Never on Saturday.

## Steps

1. **Read your own state.** `memory/live/` (corrections, last pass, open asks you posted), `memory/seed/*.md`, and which mode you are in: pre-plan or the version Kev chose (`skills/crelate-cadence.md`).
2. **Find the tagged people** (read-only, `memory/seed/crelate-reads.md`):
   - Pre-plan mode: `jobs?statuses=<Leads / Buckets id>` and keep every card whose name contains "MPC"; then `jobs/<id>/contacts/history?created_after=2025-01-01` for each. Everyone on those cards is `MPC`.
   - Plan mode: the reads the chosen version names (Warm cards, tags or note keywords). Never an UNVERIFIED read until Q has verified it.
3. **Find the suggested ones.** `activities?verb_ids=<Screen>&when_after=<today minus 60 days>`. A screened person with no tag and not in process is "Suggested: tag or leave". When note text is readable (plan version C), "great candidate, no fit yet" style notes join them; until then you do not guess what a screen said.
4. **Find the last touch.** One `activities` read for the eight touch verbs, `when_after` = today minus 180 days, fields limited as in the seed. For each person, the latest `When` where `RegardingId` is their contact id, and who logged it (`CreatedById` or `Owners`, mapped through `ROSTER`). Nothing in 180 days: "none in 180 days".
5. **Take out Casey's people.** Read the Team Hub (https://claude.ai/artifact/7kccfScydYDcWoXfeeE8q6) with `ArtifactData`: the depth charts of every client with an active JO and the `care` collection. Also the active-column jobs' stage history for the last 120 days. Anyone at PTC, submitted, interviewing, offer or placed, or with a `care/` doc, is "in process: Casey's". Out or dropped: back to you.
6. **Work out each row.**
   - Cadence from the tag (`memory/seed/cadence-and-lanes.md`); two tags: the shorter.
   - Next touch due = last touch + cadence, moved off Friday evening, Saturday and Sunday to Monday. No touch ever: due today.
   - State: `ok` (due later), `due` (today or the next working day), `overdue`, `cold` (MPC past 60 days: red alert, `skills/follow-up-alerts.md`).
   - Owner recruiter by the seed rule; never assigned by you.
   - Why they matter: one line from facts only: the tag, who applied it and when, the screen date, the bucket card name ("On Megawatt - MPC Bucket since 3 Aug; screened by Max 12 Oct"). Never comp, never a judgement you cannot source.
7. **Write the list** (below). Then post asks for what is due (`skills/follow-up-alerts.md`) and update `memory/live/now.json`.

## The list

File: `employees/ember/drafts/warm-inventory/<YYYY-MM-DD>.md`, internal (Eden only). Front matter: `date`, `mode` (pre-plan or version A, B, C), `read_at`, counts. Then:

**Result line:** "<n> warm, <n> due this week, <n> overdue, <n> cold MPCs; <n> asks posted, <n> held at the cap; <n> in process (Casey's)."

| Name | Title / company | Tag | Last touch | Why they matter | Next touch due | Owner | State |
|---|---|---|---|---|---|---|---|

Order: cold, overdue, due, then ok by due date. Then three short sections:

- **Suggested: tag or leave** (name, title / company, screened by and when). The owner and Kev decide; you never tag.
- **In process: Casey's** (name and "see Candidates in process" only, no stage detail; it is Casey's list).
- **Not read this pass**: any read that failed, with the endpoint (never the key), and what the gap means for the list.

## Rules

- **Names, titles, companies, tags, stages and dates only.** No comp, no contact details, no health, family, age or EEO data, ever. If a field like that came back from Crelate, it is dropped before anything is written.
- The INL work is "Client · discreet" in the company column; Baker Concrete is named as of 5 Nov 2026. A person at any current client gets "(client employee: do not market)" in Why, and is never a Monday pick.
- Every date comes from this pass. "Not in Crelate" beats a guess.
- One list per working day; a re-run the same day overwrites that day's file, never yesterday's.
- The list is a draft in your folder. Showing it on the Team Hub (a "Warm inventory" folder next to "Candidates in process") is a proposal in `projects/mpc/crelate-tag-plan.md` for Kev; until he says yes, it lives here and the link goes in your note.
