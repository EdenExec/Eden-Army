# Routine spec: JO status report (Mon, Wed, Fri)

Kev, 24 Oct 2026: "More up-to-date status reports on each job order, especially retained searches. Prioritize JOs by client, urgency and $$$; most urgent get multiple people. Track time to fill. Watch when each JO was intaken, how many candidates have been submitted and the active status. Stand up a report every Monday, Wednesday and Friday in a basic table for Nick and Kev to review." Ticket `t-202610241413-jors`.

| Field | Rule |
|---|---|
| When | Mon, Wed, Fri at 7:40am PT, before the board-keeping post. Run `npm run sabbath` first; Friday's report is built and held before sunset, never run inside the Sabbath |
| Who sees it | Kev and Nick only. File `projects/team-hub/reports/<YYYY-MM-DD>-jo-status.md`. Fee figures live here and nowhere on the Team Hub or a screen share. Baker shows as "Baker" (no client is discreet since 13 Nov 2026) |
| Order | Tier, then Kev's rank. Tiers: Retained (PB South, Triton), High (Megawatt, Hoffman, VMG), Below (Moss and the rest). Replace with Crelate's Retained, Top Priority, Go Now, Typical once Radar can read it |

## Columns

| Column | Source today | Source once Crelate is connected |
|---|---|---|
| Rank, client, role, location, status | Hub `jobs` | same |
| Owner | Hub `team` (lead, co-lead, backup; standby excluded) | same |
| Intake date | Not on the board: show "needs Crelate" (the board's `opened` is shown as "on board since") | Crelate job created date |
| Days open (time to fill) | Not true time to fill: "days on board" only | Today minus intake; on fill, intake to placement |
| Submitted | Depth-chart floor (Submitted, Interview, Offer on linked seats) | Crelate submittal activities, pulled with Radar and Dean (they run the scorecard activity reports) |
| Fee | "needs Crelate". Never estimate | Crelate fee, internal report only |
| Flags | No owner; urgent JO with fewer than two recruiters; on hold with its condition; Moss "referral asks only" | same, plus no submittal in 7 days |

## Steps

1. Read Hub `jobs` and the depth charts of every client with an active JO; note versions. Read nothing from Crelate you cannot reach: write "needs Crelate".
2. Build the table from the 26 Oct report as the template. Never invent an intake date, count or fee.
3. Open with a 3-line result (active, on hold, no-owner count) and "Decisions Kev owes" (owners to name, second recruiters to add).
4. Write the file, update `memory/live/now.json`, return the post text to Radar for the morning sweep. Never commit; never message a recruiter.
5. Rule that stays: I flag a JO that needs a second recruiter; Kev names who.

## Open

| Item | Owner |
|---|---|
| Crelate access for intake date, submittal activities and fee | Kev (if Q is not connected); Radar and Dean can help pull |
| Does Wednesday carry the whole table or only changes since Monday? | Kev, default: whole table |
