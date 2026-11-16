# Monday Morning EPG Report: plan

Ticket t-202611141830-mmepg (Kev, Sat 14 Nov 2026, standing request). Picked Sun 15 Nov after the Sabbath. Status: plan only. Nothing is built, scheduled or sent; first delivery needs Kev's yes and a QC touch point for the email.

## Result

- Every Monday by 5:30 AM Mountain, ahead of Sales Kickoff (7:00 AM Pacific / 8:00 AM Mountain), Kev gets one report: a private artifact at a fixed URL, a PDF of it, an email to kev@edenexec.com only, and a Duet card with the link.
- Radar is editor and assembler. Each section has one owner, one source and one fallback. A missing source prints UNVERIFIED, never a guess.
- Sunday before, a four-question Duet card gathers the look-ahead answers Hawk needs (see `sunday-lookahead-card.md`).

## Section owners

| # | Section | Owner (second) | Source | Shown if missing |
|---|---|---|---|---|
| 1 | WIP and pipeline, 75k view | Casey (Dean) | Friday Pipeline Review data refreshed Monday early; job-order board, depth charts; Dean's recruiter numbers. Funnel: Dial, RP, Resume, PTC, FTI | Last Friday's figures, dated, marked STALE |
| 2 | Cash, invoices, bills to sign off | Tally (Docket second key) | QuickBooks AR aging, AP due this week, cash forecast, through the numbers gate | Each figure not gated reads NOT GATED |
| 3 | Big candidates, deals moving, pitches out | Casey, Radar deal desk, Scout, Ember | Candidates in process (Casey); offers out and FTIs to set (deal desk); pitches and new leads (Scout, from Crelate); MPCs to market (Ember) | UNVERIFIED per line |
| 4 | JO meeting agenda | Casey, Dean, Hawk (Jenny) | JOs new / active / on hold / killed / filled with owner (Casey); critical numbers and expectations (Dean's Friday scorecard); 6-week look ahead (Hawk, PTO from Gusto via Tally) | UNVERIFIED per block |
| - | Design and template | Marlowe (look), Q (artifact, routines) | Cream and ink, Montserrat, one page per section, 75k view on page one | - |

## Defaults in force until Kev answers

- **Pitches tracked:** Crelate and the deal desk.
- **Marketable dates:** dates a candidate is available, or an event Eden can market around.
- **Delivery:** both email and artifact.
- **JO meeting:** taken to be the agenda block of Monday Sales Kickoff. Confirm in the first Sunday card if it is a separate meeting.

## Rules on the page

- Counts and dates only. No pay, no fee or compensation figures beyond gated cash totals, no candidate contact details, clients named outright on Kev's copy (Kev, 13 Nov: never "discreet client"), no health or family detail.
- Header EDEN PARTNER GROUP, title *Monday Morning EPG Report* in bold italic; footer edenpartnergroup.com and EDEN PARTNER GROUP.
- Sabbath check before every run (`npm run sabbath`); Monday runs never fall inside it.

## Next steps (in order)

1. Kev: yes on the plan and the three defaults (in tonight's batch, or the first Sunday card).
2. Marlowe: page design against `template-outline.md`. Q: artifact template and the three Monday routines in `routines.md`, routines left disabled.
3. Dry run one Monday into the artifact only. Kev reviews; then QC the standing email to his own inbox and switch routines on.

## Files

- `template-outline.md`: page-by-page layout.
- `routines.md`: Sunday and Monday schedule, owners, failure handling.
- `sunday-lookahead-card.md`: Duet card text for Kev.
