# The lead-gen engine (Kev, 4 Nov 2026: "run it like a job description")

Supersedes `phone-enrichment.md` (27 Oct) — that routine never went live and relied on per-record API `enrich_contacts` calls, which is the exact cost pattern Kev moved away from on 3-4 Nov. Do not run it again.

**The job, in one line:** Scout builds the lists; one human clicks export; BPO cleans and loads; Nick says what comes first.

Kev, 4 Nov: "We own all 4 seats. All credits are ours." November is the first month Eden tries to actually use its full monthly ZoomInfo allowance, seat by seat, by the last Friday of the month. This is Kev's standing yes for ZoomInfo credit spend inside the limits below — no separate QC item needed per list, per `scout/persona.md`'s "ask Kev first" rule, as long as you stay inside them. Going over a seat's monthly cap, or spending before confirming a seat's identity, still needs to stop and ask.

**Update, 12 Nov 2026 (Kev): exports move to BPO.** "Move it all to BPO, I've already asked my rep, we're good." From now on Scout builds the list (free search, ZoomInfo audience or upload CSV) and hands it to the BPO team, who export, clean and load into Crelate the same night. Scout no longer asks Kev or Noah to click Export. Noah helps set this up when he is back from Hawaii. Everything below still applies to building and costing the list.

## The four seats

Eden owns all four ZoomInfo seats on the "ZoomInfo Logins" Drive sheet Docket found (do not quote the sheet itself here or anywhere else; it holds plain-text passwords Kev should move to a password manager). Confirm the four seat names/logins from that sheet before the first rotation and record them (names only, no passwords) in `employees/scout/memory/live/seats.md`. Each seat carries 2,000 download credits a month, resetting on the 1st. Total: 8,000 credits a month across all four.

## The weekly pace

Target 1,700 to 2,000 credits on the seat currently in use, each week, before rotating to the next. Four seats across roughly four weeks should land the month near its 8,000-credit ceiling by the last Friday (27 Nov this month). Track actuals, don't guess: a web-app export costs the same 1 credit per record as the old per-record enrich call, so the credit cost of a list is its row count once you strip out anyone already free (Crelate-sourced, under management, or already downloaded this month). Log every list's estimated and (once confirmed by whoever exports it) actual cost in `employees/scout/memory/live/credits.md`: date, seat, list, rows, running total for that seat.

## Every list, in order

1. **Priority.** Pull the day's ranked job-order list from Casey's new-JO report (Nick ranks it; see `employees/casey/skills/*` once she builds the daily report, or ask Radar for it until then). Work top to bottom. A job order with no fresh list in `projects/leads/index.json` in the last 7 days, or none yet, goes first.
2. **Build the list, free.** `search_contacts` with `requiredFieldsList: ["mobilePhone"]` (or `directPhone` when mobile is thin for that title) plus the usual title, metro and company-type criteria from `lead-list.md`. This is search, not enrich: no credit spent yet. Pull the DNC and management-status flags in the same free call so they're visible before anyone exports.
3. **Clean it the way `lead-list.md` already does:** exclude active clients, dedupe against Crelate (Crelate-sourced mobiles are free and already have a number — never re-pull those), tier it.
4. **Estimate the cost.** Rows left after dedupe and DNC removal, minus anyone under management (free for a year) = the credits this export will spend. Check it against the current seat's running weekly total. If it would push the seat past about 2,000 for the month, stop and name the next seat in rotation instead (round-robin unless one seat is closer to its monthly reset).
5. **Ask for the click — the dumbed-down way.** Scout has no browser control and cannot click Export in the ZoomInfo web app. Send this exact shape to Kev and Noah (`AskUserQuestion` if interactive, otherwise a ticket on Scout's Command Center desk plus a line in the hand-off; Radar relays it if neither reaches them directly):

   > Lead list ready: **\<client/role>**, **\<N>** names, seat **\<seat name>** (≈\<N> credits, seat running total \<X> of 2,000 this month).
   > To download: open **\<direct ZoomInfo project/list URL>**, click **Export**, save as CSV, and drop it in **\<Drive master folder link, from `destination.json`>**.
   > That's the only step either of you needs to do.

   One link to the list, one link to the folder, the exact two clicks. Nothing else in the message.
6. **Wait, don't nag.** A list not exported in 48 hours gets one follow-up, same format, then goes on Radar's chase list.
7. **Hand off downstream exactly as `lead-list.md` step 9 says**, once the CSV lands: stage it, land it in the master folder per `destination.json`, log the credits actually spent (ask whoever exported it to confirm the row count if it's not obvious from the file), and let BPO clean and load per Q's column spec (coming separately).

## Never

- Never call `enrich_contacts` or `redeem` for phone numbers again on this pipeline — the web-app export is the only paid path now.
- Never export yourself; you have no browser control on these seats, and building one would recreate the automation risk this whole design was built to avoid.
- Never exceed a seat's 2,000-credit month without stopping to ask Kev first.
- Never guess which seat is "kev1" versus the others from memory; read `employees/scout/memory/live/seats.md` (or the Logins sheet) each rotation.
