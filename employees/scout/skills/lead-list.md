# Lead list (for a live job order)

Done means a recruiter opens one sheet and starts dialing, with nothing to look up.

## Steps

1. **Read the job.** Title, metro, company type the client wants people from, must-haves, and the client's own name. If the job order is thin, write the three questions for Radar and build the obvious list anyway.
2. **Plan the pull.** Titles from the Eden title tags plus their real-world variants (`zoominfo-search`), metro plus a commute radius or the wide net, company types in Tier 1 and Tier 2. Write the plan in the sheet's notes tab before pulling.
3. **Pull** from ZoomInfo, one title per call, two pages each (`zoominfo-search`). Add the LinkedIn Boolean string for the same bucket (`linkedin-search`) for the recruiter to run in Recruiter.
4. **Exclude clients** before anything else (`memory/seed/clients.md`): Moss names to a "Moss · referral asks only" tab, Baker rows named "Baker" in Note (Kev, 5 Nov: no longer discreet; one client never sees another's name), every other active client removed unless Kev made an exception.
5. **Dedupe against Crelate** by LinkedIn URL, then name plus company (Q's mirror once it runs; until then Radar checks). Rows already in Crelate keep the owner and last activity date.
6. **Tier.** Tier 1: the seat, at a company type the client hires from, in the metro. Tier 2: adjacent title or company type, or willing-to-relocate distance. Tier 3: long shots, kept on a separate tab.
7. **Write the sheet** (below). One CSV per role in `employees/scout/sheets/<YYYY-MM-DD>-<client>-<role>.csv`. Fill Mobile from Crelate for every row already in Crelate (Mobile source "Crelate"); leave the rest blank for the phone pass (see Columns).
8. **Land it, every time, in one place** (Kev, 21 Oct 2026: one folder the leads artifact reads, nothing left elsewhere). The destination lives in `projects/leads/destination.json`; do not pick another folder.
   1. `npm run leads -- stage` checks the sheet against the format and copies it into `projects/leads/sheets/` with the index. A FAIL means fix the sheet first (no State or Time Zone, a LinkedIn blank, a forbidden column, a ZoomInfo phone). `--keep-failed` is only for old sheets already out.
   2. Upload the same rows to the Drive folder named in `destination.json` as a Google Sheet titled `NN · Client · Role · N leads` (the existing naming), one file per call.
   3. `npm run leads -- link <file.csv> <sheet url>` records the Drive link in the index.
   4. A v2 replaces a v1: stage the v2 only and leave the v1 out (the stager skips it).
9. **Hand off.** One line to Radar: sheet link, counts (pulled, clients excluded, already in Crelate, new by tier), the Boolean string, and anything odd. Radar writes the sheet into the Hub's Job Orders row (`jobs/{id}.leads`). A list is not done until staged, uploaded and linked.

## Columns

Ref, #, Tier, Name, **Mobile, Mobile source, Direct, Phone notes**, Title, Company, Company type, Trade, City, State, Time Zone, LinkedIn, In Crelate (owner, last activity), Fit note (one line), Source (ZoomInfo id or "LinkedIn search"), Note (client flags), Suggested owner, Owner. Recruiters fill Called and Result.

**Phones first (Kev, 3 Nov 2026):** "We should make sure all cell phone columns land around column D or E; we want to see those immediately." Mobile is column E, right after Name. Run `python3 -I employees/scout/tools/phone_first.py <in.csv> <out.csv>` before staging any sheet. Every tool (checker, Noah's routine, BPO SOP, enrichment) finds phone columns by header name, never by position.

- **LinkedIn is never blank:** the exact profile URL when known (ZoomInfo record, enrichment, web search); otherwise `https://www.linkedin.com/search/results/people/?keywords=<First Last Company>` URL-encoded.
- **City, State and Time Zone are three separate columns on every upload, every row.** Kev, 13 October: the BPO team uploads these sheets to Crelate, and Crelate picks up each tag only from its own column. Use those exact headers. City is the city name; State is the two-letter code (FL); Time Zone is one of PST, MST, CST, EST (`memory/seed/buckets.md`). Use where the person lives when known; otherwise the company office's city, with "office location" in Note. Never one combined Metro or Location column.
- No personal email and no comp. Crelate mobile and direct numbers may appear on internal Eden-only recruiter sheets (Kev, 13 Oct), never client-facing and never on the hub; ZoomInfo-sourced rows carry no phone.
- Repo copies of a sheet (projects/leads/sheets, employees/scout/leads) never carry phone numbers: Mobile and Direct read "(in sheet)". The Drive sheet is the only place numbers live. Scrub before every commit (3 Nov 2026: 900+ Crelate numbers had slipped into repo copies; scrubbed).
- **Mobile, Mobile source, Direct, Phone notes** sit right after Name (3 Nov 2026; before that they were the last two columns, 21 Oct 2026). **Crelate first (Kev, 3 Nov 2026):** "Anytime we have a cell in Crelate we should link it to the Google Drive." After the Crelate dedupe, run `python3 -I employees/scout/tools/crelate_mobiles.py <sheet.csv> <out.json>` (read-only GETs) so every "Yes · <id>" row carries its Crelate mobile with Mobile source "Crelate" before the sheet lands; the phone pass (Noah, BPO, enrichment) only works the blanks. Tools: `employees/scout/tools/pull.py` (full read-only Crelate pull), `dedupe.py` (name + company match), `crelate_mobiles.py`. Mobile source says where the number came from: Crelate, the call, the candidate. Never ZoomInfo; the check refuses it.

## Quality bar

At least 25 Tier 1 names for a common title in a large metro, or a note saying why the market is thinner. Fewer than 10% of rows bounce as wrong person or wrong company when the recruiter checks.

## Working in tandem with Noah's agent (RETIRED 4 Nov 2026)

**Retired (Kev, 4 Nov):** Noah's own Scout package (`projects/team-hub/scout-for-noah/`, eden-scout.zip) is dead. One engine (Scout, `lead-gen-engine.md`) builds lists free and rotates the four Eden ZoomInfo seats; Noah is one of the people who clicks Export in the web app, not a second operator. The rules below are history; do not claim sheets or use EL-500+ any more.

Noah runs his own copy of Scout (skill package `projects/team-hub/scout-for-noah/`). Same folder, same Lead Log, same format. To keep from colliding:
- Claim a sheet before working it: append "Scout working · <date time PT>" to its Lead Log Owner note; clear it when done. Never work a sheet Noah's agent has claimed in the last 12 hours.
- Reference numbers: Scout EL-001 to EL-499; Noah's agent EL-500 and up.
- Separate ZoomInfo seats (Scout: Kev's; Noah's agent: Noah's). Never enrich a row whose Mobile is filled.
- Never insert, delete or reorder columns on a sheet Noah's agent made or is working.
- When the package's rules change (format, clients, phone pass), update the files in `projects/team-hub/scout-for-noah/`, re-zip, and tell Kev so Noah can re-upload.
