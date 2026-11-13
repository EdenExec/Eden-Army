**RETIRED 4 Nov 2026.** Never ran live; superseded by `lead-gen-engine.md`, which uses free list-building plus a manual web-app export instead of the per-record API calls below. Kept only for history.

# Nightly phone enrichment (Kev, 27 Oct 2026)

Kev moved Noah's lead-sheet phone enrichment to Scout, run at night on the **kev1** ZoomInfo seat (the ZoomInfo connector is signed in as Kev1). It is API only: no browser and no ZoomInfo web app. Kev's standing credit cap is **100 Data (Bulk) credits a night**. This cap is Kev's yes for this job only; every other enrichment still follows `zoominfo-search` and QC.

## When

Every weeknight at 10:00pm Pacific, after lists land by 8pm. Run `npm run sabbath -- --json` first: if it is the Sabbath, stop and do nothing. Never on Saturday.

## What you need

ZoomInfo, Google Drive and **Google Sheets** (to write cells in the existing sheet). If no Google Sheets tool is available, change nothing, write one line to Radar's feed ("phone enrichment blocked: Google Sheets connector missing") and stop. Never rebuild a sheet as a copy to get around it.

## Steps

1. **Queue.** Read the Lead Log (`1gqMc-aBqTGrNL7r3Li4qEXrrSplrWfeuw9YIXwoSNoY`) and list the master folder (`1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9`; page through `next_page_token`). Work on sheets whose title does not end "Phones Added" and whose Lead Log "Phones added" cell is blank, oldest Landed first. Skip the Lead Log, docs, subfolders and anything in Superseded. An old Owner note that says discreet client no longer means skip: no client is discreet since 13 Nov 2026.
2. **Read the sheet** with the Sheets connector (`get_values`, not Drive's sample). Note the row count and the person-ID column (Source, "ZoomInfo 1234567"; negative IDs are valid), Name and Company. If any Mobile is already filled, never touch that row.
3. **Free pass first (no credits).** `search_contacts` with `personIdList` (50 at a time), `underManagement: true`, no `redeem`. For each person record: `hasMobilePhone`, `hasDirectPhone`, `mobilePhoneDoNotCall`, `directPhoneDoNotCall`, `lastUpdatedDate`, under management or not, and whether the title or company differs from the sheet. Rows with no ID: search by full name and company; if the match is not certain, note "verify" and do not enrich.
4. **Pull numbers.** `enrich_contacts` by `personId`, 10 per call, `requiredFields: ["phone","mobilePhone","mobilePhoneDoNotCall","directPhoneDoNotCall","positionStartDate","jobTitle","companyName"]`. Never request email. Order:
   - under management first (free);
   - then unmanaged rows that have a mobile or direct, Tier 1 before 2 before 3, until the night's paid count reaches 100;
   - never pay for a person with neither a mobile nor a direct (write "none in ZoomInfo"), and never enrich the same person twice.
   Keep a running count of paid enrichments; stop paying at 100 and carry the rest to the next night.
5. **Write the sheet in place** (one batch per sheet; read `references/sheets.md` in the google-workspace skill first). Keep every existing column and row order. Find **Mobile, Mobile source, Direct, Phone notes** by header name; on sheets landed from 3 Nov 2026 they sit in columns E to H, right after Name. If an older sheet lacks Direct or Phone notes, add them right after Mobile source only when the sheet is your own and nobody else is working it; otherwise put them at the end. Mobile source is "ZoomInfo" or "ZoomInfo direct" (when only a direct exists, it goes in Mobile too, as Noah's routine did). Write numbers as text so Sheets does not turn them into numbers. Phone notes, short and semicolon-separated:
   - "Mobile on Do Not Call list" (and set that cell's text bold red);
   - lead outside the sheet's target metro; direct-line area code that does not match the lead's city;
   - new in role (started within about 6 months), or title or company differs from the sheet;
   - data glitch (for example a 1970 start date): "verify";
   - "none in ZoomInfo" when neither number exists.
6. **Finish a sheet** only when every row is done: rename it with Drive `update_file` to "<title> · Phones Added" (same link), date "Phones added" on its Lead Log row (YYYY-MM-DD) and write in Owner note: mobiles, directs, none, DNC count, credits paid. Counts only. A sheet cut off by the cap stays unrenamed with Owner note "partial: N of M rows, resumes tomorrow".
7. **Verify.** Read the sheet back: same row count, every name still on its row, counts match your tally. Spot-check 4 rows against the enrich output.
8. **Report.** Append one line per night to `employees/scout/memory/live/credits.md` (date, sheets, rows, paid credits, free). Post one done ticket on your Command Center feed: sheets finished, mobiles / directs / none, DNC count, credits paid, anything skipped. Counts only.

## If something stops you

- ZoomInfo rate limit or a credit error: stop paying, keep what is written, note "resume" in the Lead Log, and try again once 2 hours later in the same run if time allows; otherwise the next night picks it up.
- A sheet with missing columns or odd rows: note it in the Lead Log Owner note and move on. Do not make a copy.

## Never

- Never put a phone number, or a name next to a number, in the repo, memory, a ticket, an email, a chat or the Lead Log. Numbers live only in the sheet and in Crelate. Working files stay in the session scratchpad and are not committed.
- Never request or write personal email, even if ZoomInfo offers it.
- Never move, copy, delete or share a sheet; the BPO team uploads from the master folder and Radar moves finished sheets.
- Never go past 100 paid credits in a night. More needs a `spend` QC item from Kev.

## Seat safety (keep the ZoomInfo seats from being flagged or shut down)

Added 27 Oct 2026 at Kev's ask. These come from the terms shown in the ZoomInfo connector itself; Docket should read Eden's actual ZoomInfo agreement and confirm each point, and no one has yet.

- **Automation and rate limits.** The connector states requests are rate limited per subscription and that automated scraping is prohibited. Stay on the API and the connector tools only. No browser automation, no web app, no scripts that hammer the endpoints. Batches of 10 to 50 as above; on a rate-limit or 429 error, stop and wait; never retry in a loop or from a second session.
- **One seat, one operator at a time.** Run enrichment only through the kev1 seat, one session at a time. Do not run it at the same time as Noah's routine, a second Scout session, or anyone else's login on that seat. Two agents on one seat looks like shared credentials.
- **Do not share or resell the data.** Kev, 27 Oct: internal use only, not resold, no issue; DNC and consent are monitored directly by Eden, no issue. Kept here so the rule is not re-argued.
- **(original note)** The connector bars sharing or reselling ZoomInfo data to third parties. Numbers stay on Eden-only recruiter sheets and in Crelate. The BPO team uploads from the master folder: confirm with Docket that this is allowed under the agreement (it is outside the licensed seat if the BPO team are not Eden users).
- **Respect Do Not Call.** Keep writing the DNC flags. Do not dial or text a DNC number. California and EU/UK people carry extra consent rules; request the `withinCalifornia` and `withinEu` flags in `outputFields` and put "CA" or "EU" in Phone notes so recruiters know before dialing.
- **No personal email, no bulk outreach lists.** The connector bars lists for cold outreach without a legal basis and asks for data minimization. Never request email; enrich only people on a live lead sheet, never the whole database.
- **Stay inside the credit allowance.** Hard cap of 100 paid credits a night and never the same person twice. Already-managed records are free: use them first. Log every night's count in `memory/live/credits.md` so usage is visible if ZoomInfo asks.
- **No exports to circumvent limits.** Do not combine tools, accounts or sessions to get past a monthly or per-seat limit. If credits run out, stop and ask Kev.
- **Ask ZoomInfo, in writing.** Kev or Radar should ask the Eden ZoomInfo rep to confirm: (1) API and MCP automation on the seat is allowed, (2) the nightly enrichment pattern is within the plan, (3) the BPO team may receive the numbers, (4) how many seats Eden has and who is licensed. Until then, treat this routine as unconfirmed.

- **Pattern, not disguise.** Kev wants phone pulls to look like normal use. Do that by being normal use: the sanctioned connector, one seat, small batches inside the nightly cap, only people on live lead sheets. Do not add random delays, rotate sessions or seats, or otherwise hide automation from ZoomInfo. If ZoomInfo's written answer says API or MCP automation is not allowed on the plan, stop the routine and go back to Noah's workflow.
