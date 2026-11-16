# Routines: Sunday ask and Monday build

Proposed for Q to build. All disabled until Kev's yes. Times Mountain; Monday only for the report. Sales Kickoff is 7:00 AM Pacific = 8:00 AM Mountain.

## Sunday

| Time MT | Who | Step |
|---|---|---|
| ~2:13 PM | Hawk | Sunday stand-up prep (existing). |
| ~4:00 PM | Radar | Send the look-ahead Duet card to Kev's own session (standing yes, 12 Nov). Text in `sunday-lookahead-card.md`. |
| On answer | Radar | Relay answers to Hawk as one ticket (`agent: lookahead`, `lever: dates`). Hawk updates the Look Ahead page and runway block. Unanswered by Monday 4:00 AM: report runs on last week's look ahead, marked "not refreshed". |

## Monday

| Time MT | Who | Step |
|---|---|---|
| 4:00 AM | Casey, Dean | Refresh pipeline data (Friday Pipeline Review build), JO board, depth charts, funnel numbers. |
| 4:00 AM | Tally, Docket | AR aging, AP due, cash forecast through the numbers gate. |
| 4:00 AM | Scout, Ember, Radar | Pitches and leads, MPCs, deal desk offers and FTIs. |
| 4:00 AM | Hawk | 6-week look ahead block, with PTO via Tally. |
| 5:00 AM | Radar | Assemble, lint against the brand and privacy rules, mark UNVERIFIED / NOT GATED / STALE, republish the same artifact URL, render the PDF. |
| 5:30 AM | Radar | Email to kev@edenexec.com only (artifact link plus PDF) and a Duet card with the link, alongside the 5:30 brief. |

## Failure handling

- A section pull that has not landed by 5:00 shows its fallback and the owner's name; the report still ships at 5:30.
- If assembly fails, the Duet card goes at 5:30 saying so, with the last good artifact link.
- Usage stewardship: the 4:00 pulls can run as one routine with four steps rather than four routines; Q to choose the cheaper shape and log it in the Friday usage row.

## Gates

- The standing Monday email to Kev's own inbox needs one QC approval before the first send. Nothing goes to anyone else.
- No pulls, sends or publishes in the Sabbath (`npm run sabbath` before every run).
