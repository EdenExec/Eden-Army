# The weekly recruiter scorecard (Fridays)

The scorecard is how the team sees its week in numbers before the Round Table. Crelate activity is the scoreboard; the 42-box card on the Eden Desk is each recruiter's own read of the week. You build the first and collect the second. Read `memory/seed/crelate-scorecard-spec.md` first: it holds the API details, the activity verb IDs, the Crelate user IDs and the counting rules.

**Update, 12 Nov 2026 (Kev): the flow to watch is Dial → RP → Resume → PTC → FTI.** Submittals only mean a resume was built, so they are no longer a headline metric. Lead every scorecard and board with these five stages and the ratio between each (RPs per 100 dials, resumes per RP, PTCs per resume, FTIs per PTC). Dials are CloudTalk outbound counts per recruiter (counts only).

## When

- **Friday by 11:30 AM Pacific:** first pull (the week so far), so the Round Table pack is ready. Label it "Friday in progress".
- **Friday after 1:00 PM:** fold in the 42-box cards (Radar reads `data/users/*/sc-<Monday>` on the Eden Desk and hands you the rows; see `employees/radar/skills/week-review.md`).
- **Saturday morning:** final pull for the full week (Monday 00:00 to Friday 23:59 Pacific). This is the row that goes into the trend file. Replace the partial row; never average them.

## The pull

1. Window: Monday 00:00 Pacific as `when_after` in UTC (07:00Z during daylight time, 08:00Z after the November change). Check the offset each week.
2. `GET https://app.crelate.com/api3/activities?owner_ids=<id>&when_after=<iso>&limit=100&offset=<n>` per person, paging until a page returns fewer than 100. Header `X-Api-Key` from `$CRELATE_API_KEY`, plus a normal browser-like `User-Agent` (Cloudflare blocks Python's default client with error 1010). Nick has two user IDs; pull both and merge by activity `Id`.
3. Save raw pages to the scratchpad, never to the repo (they hold candidate names and notes).
4. Map `VerbId.Id` to the ten metrics with the verb table. Ignore every other verb (notes, stage changes, emails, tasks).
5. Count by the rules: RPs, referrals and LVMs count activities; MPs, JOs, resumes, screens, PTCs, submittals and FTIs count unique contacts (`ParentId.Title`), falling back to the activity count when no parent is set. RPs also count by day (`When`, Pacific date) against 15 a day.

Secrets: the key stays in the environment. Never echo it, print request headers, write it into a script file, or paste a curl line that contains it. If a call fails, report the status code and the endpoint only.

## What you build

| Page | What is on it |
|---|---|
| Cover | Seven Pillars, the six Must-Dos, "At Eden we", how the Round Table runs (team board, guy by guy five minutes, core values, close) |
| Team board | One row per person in the fixed order (Max, Evan, Noah, Andrew, Bridger, then a rule, Nick, Kev), ten metric columns, a Team total row; KPI tiles for RPs, MPs, JOs, PTCs, submittals, FTIs |
| Per person | RPs by day against 15 (days at 15 or more in bold), the week's counts, the contacts behind PTCs, submittals, FTIs, MPs and JOs (names only, from Crelate), the blank 42-box card, the trend line from `trends-and-values.md` |

The pack is Eden Partner Group: header EDEN PARTNER GROUP with "Weekly Scorecard · Round Table" beneath, footer edenpartnergroup.com. It is printed for the room and discussed in person.

## Rules for the page

- No pay, commission, split or fee per person anywhere. No phone numbers or emails for the contacts listed. No health, family or age remarks.
- Label the pull time and whether Friday is complete. A partial week is never compared with a full one without saying so.
- A metric that looks wrong (Kev's notes inflating activity, a bulk stage change logged as screens) is flagged in a footnote and asked about, not silently fixed.

## Hand-off

Write the final week's row to `projects/workforce/scorecard-trend.md`, give Radar a three-line summary (headhunter RPs against 375, that is 5 x 75, the biggest mover, the one flag), and queue any draft email for Kev through QC. You do not email the team the pack; Kev hands it out at the Round Table.

## The Round Table board (Q, 23 Oct 2026)

Fridays, refresh the team board at the top of the Round Table with `npm run recruiting-board -- --out projects/workforce/board/current.json` (read-only Crelate pull, Sunday to now against last week to the same point, by active JO; add `--rev-csv <export of the 2026 Rev Report tab>` for per-recruiter revenue). Radar writes the file to the artifact as `board/current`; details in `projects/workforce/round-table.md`.

## The live card (Kev, 23 Oct 2026)

The card (43 boxes since 23 Oct: 35 daily, 8 weekly, with "Push your job orders forward" added) now lives in each person's Round Table folder ("This week's card"). It has clickable daily, weekly and core-value boxes, the recruiter's notes, and Kev's coach section with his score and a "Needs a PIP" box. Everything saves as Kev taps.

Fridays:
- 9:55am PT: a fresh Crelate pull.
- 5:07pm PT: the cards go to Kev as one PDF, and any PIP flagged on a card comes to you to draft for Kev.

Playbook: employees/radar/skills/round-table-friday.md. Scripts: `npm run scorecard-rows`, `npm run card-pdf`.

