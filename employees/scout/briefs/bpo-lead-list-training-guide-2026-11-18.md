---
title: Building and Loading Lead Lists
subtitle: Training guide for the BPO team
author: Eden Partner Group
date: 18 Nov 2026
cover: false
toc: false
---

## Executive summary

You will pull candidate lists from ZoomInfo Sales with bulk credits, clean and tag them, and load them into Crelate so recruiters can start calling. The same steps work for every client and every role.

Each list starts with a one-page list brief from Scout. This guide uses one Moss list as the worked example.

| Item | Detail |
|---|---|
| Your result | One clean Crelate bucket per list, one Drive sheet per list, a dated Lead Log row per list |
| Credits | Bulk credits only. One credit per exported contact. |
| Tools | ZoomInfo Sales (your BPO seat), Google Drive, Crelate |
| Questions | Kev Williams or radar@edenexec.com |

## The five rules

| Rule | Why |
|---|---|
| Use ZoomInfo Sales (Advanced Search, then Lists). Never use GTM Studio. | GTM Studio exports spend enrichment credits. Sales exports spend bulk credits. |
| Check the credit type before you click Export. | If the screen says enrichment or AI credits, cancel and message Kev. |
| Clean the list before you export it. | Every exported row costs a credit, so remove rows you do not want first. |
| Remove every client's staff, not only the client the list is for. | We recruit for our clients. We never recruit from them. |
| Phone numbers stay inside Eden. | Never put them in an email, chat or anything outside Drive and Crelate. |

## Part 1: Start from the list brief

Scout sends one brief per list. Do not start a list without one. If a field is blank, ask Radar.

| Field | What it tells you |
|---|---|
| Client and role | Names the list, the Crelate bucket and the tags |
| Location | The ZoomInfo metros, and the City and State for the sheet |
| Job titles | The title filter, plus any titles to exclude |
| Company filters | Industry and company size |
| Expected size | The row count to expect. Ask before exporting if you are 50 rows or more above it. |
| Tier rules | What makes a Tier 1 or Tier 2 person for this role |
| Special rules | Anything unusual for this client, such as referral asks only |

## Part 2: Pull the list in ZoomInfo Sales

| Step | What to do |
|---|---|
| 1 | Open ZoomInfo Sales and sign in with your BPO seat. Choose Advanced Search, then Contacts. |
| 2 | Set the filters from the list brief: location, job titles, industry and company size. |
| 3 | Exclude every client. In the Company filter use Exclude and add each client name (see "Find the client list" below). |
| 4 | Also exclude homebuilders and electrical or trade subcontractors, unless the brief says otherwise. |
| 5 | Filter to contacts that have a mobile phone. |
| 6 | Scan the first two pages of results. If you see companies that do not fit (software, equipment, homebuilders), exclude them and search again. |
| 7 | Save the search with today's date, client and role. Select all, then Add to List. Name it "YYYY-MM-DD - Client - Role". |

Filter labels move around in ZoomInfo, so match each one to what the screen shows. If a filter is missing, tell Kev.

### Find the client list

Clients change as new fee agreements are signed. Use these sources in this order.

| Source | How to use it |
|---|---|
| Crelate | Companies with Client status. This is the source of truth. |
| The appendix | The list as of this guide's date. Use it if Crelate is not available. |
| Radar | Ask when you are not sure. A company you cannot place gets skipped. |

## Part 3: Export with bulk credits

| Step | What to do |
|---|---|
| 1 | Open Lists and open the list you built. Delete rows that do not belong: client staff, homebuilders, wrong titles. |
| 2 | Write down the row count that remains. This is your credit estimate. |
| 3 | Click Export and choose CSV. Read the confirmation screen. |
| 4 | The credit type must say bulk (or data or export) credits. If it says enrichment or AI credits, cancel, take a screenshot and send it to Kev. |
| 5 | Confirm. Never export the same list twice. |
| 6 | Save the file as "YYYY-MM-DD - Client - Role - raw.csv" in your working folder. |

## Part 4: Clean the file

| Check | Action |
|---|---|
| Client staff | Delete any row whose Company is a client, including the client the list is for. Count them. |
| Homebuilders and trade subs | Delete the rows, unless the brief says otherwise. |
| Mobile marked Do Not Call | Keep the person, leave the Mobile cell blank, and write "DNC flag" in Phone notes. |
| No name or no company | Delete the row. Count it. |
| Duplicate people | Keep one row per person. |

Company names vary, so search for the client's name inside the Company column, not only an exact match. "Moss", "Moss & Associates" and "Moss Construction" are all the same client.

## Part 5: Build the sheet

Create one Google Sheet per list, titled "YYYY-MM-DD · Client · Role · City · N leads". If a list covers two cities, make one sheet per city. Use these columns in this order.

| Column | What goes in it |
|---|---|
| Ref | Client initials, role code and a number, for example MS-PRE-001. Scout gives you the codes in the brief. |
| Tier | 1 or 2, using the brief's tier rules |
| Name, Title, Company | From the export. Fix capitalization. |
| Mobile, Mobile source | The mobile from the export. Mobile source: "ZoomInfo export". Blank if none. |
| Direct, Phone notes | Direct phone if present. Phone notes: "DNC flag" or blank. |
| City, State, Time Zone | Three separate columns. State is two letters. Time Zone is PST, MST, CST or EST. Never one combined location. |
| LinkedIn | The profile URL. If blank, use a people-search link: linkedin.com/search/results/people/?keywords=First Last Company |
| Fit note | One line. Any experience the brief asks you to flag goes here. |
| Source | "ZoomInfo Sales export" and the date |
| Note | Anything the recruiter should know |

| Time zone | States |
|---|---|
| PST | CA, WA, OR, NV |
| MST | ID, UT, AZ, CO, MT, WY, NM |
| CST | TX, LA, IL, MN, WI, MO, OK, KS, NE, IA, AR, MS, AL, ND, SD |
| EST | FL, GA, NC, SC, VA, MD, DC, PA, NJ, NY, CT, MA, OH, MI, IN, KY, TN, WV |

Use the person's city to settle split states, such as the Idaho panhandle or the Florida panhandle. If you are unsure, ask Radar.

If the brief asks you to judge years of experience, open the LinkedIn profile and estimate. If you cannot tell in two minutes, mark Tier 2 and write "years unclear" in Fit note.

## Part 6: Load into Crelate

Lists go into a bucket in the Leads / Buckets column. Never load them onto an active job order and never create a job order for a list.

| Step | What to do |
|---|---|
| 1 | Find the bucket named "Client - Role - City Leads". Create it in Leads / Buckets only if it does not exist. |
| 2 | Check for duplicates first. Search Crelate by LinkedIn URL, then by name plus company. |
| 3 | If the person exists, add the existing record to the bucket. Add the mobile only if the record has none. Do not change the owner, status or notes. |
| 4 | If the person is new, create one record with Name, Title, Company, LinkedIn URL, City, State, Time Zone and Mobile. |
| 5 | Set Source to "Eden lead load YYYY-MM-DD" (the day you load). |
| 6 | Add the tags below to every record, plus any extra tags the brief names. |

| Tag | Example |
|---|---|
| Client | The client's name from the brief |
| Role | The role from the brief |
| Time Zone | PST, MST, CST or EST |
| Lead date | Lead YYYY-MM-DD |

Skip any person Crelate already marks do-not-contact and count them. Never upload pay, age, ethnicity, gender, home address or personal email, even if a column has it.

## Part 7: Finish and report

| Step | What to do |
|---|---|
| 1 | Save the final sheet in the master lead folder in Drive. Do not move, rename or copy any other sheet. |
| 2 | In the Lead Log, put the load date in the In Crelate column. In Owner note write counts only: loaded, already in Crelate, skipped, removed as client staff, and the bucket name. |
| 3 | In the same Owner note, log the credits: the row count you exported. |
| 4 | Email radar@edenexec.com one short note: sheets loaded, records created, duplicates matched, rows skipped, anything odd. No names or phone numbers in the email. |

## Worked example: Moss, Tampa pre-construction

This is a filled-in brief. Use it to check your own work.

| Field | Setting |
|---|---|
| Client and role | Moss, Senior and Chief Pre-Construction Manager |
| Location | Tampa Bay metro. City and State on the sheet: the person's city, FL. Time Zone: EST |
| Job titles | Preconstruction Manager, Senior Preconstruction Manager, Director of Preconstruction, Chief Preconstruction Officer, VP of Preconstruction, Preconstruction Executive, Senior Estimator, Chief Estimator, Director of Estimating |
| Company filters | Commercial and Residential Construction, 50+ employees |
| Expected size | About 200 |
| Tier rules | Tier 1: pre-con manager through VP at a commercial contractor. Tier 2: estimators. |
| Special rules | Moss prefers healthcare experience, then transportation and public works. Flag healthcare contractors in Fit note. |
| Excluded | Moss and every other client. Moss staff are never loaded. |
| Bucket and tags | Moss - Pre-Con Manager - Tampa Leads. Tags: Moss, Pre-Con Manager, EST, Lead YYYY-MM-DD |

Two more Moss briefs run the same way. Superintendents: senior and general superintendents at contractors with 200+ employees in Tampa Bay. Schedulers: scheduler titles with no manager or controls titles, in West Palm Beach and Miami, with 2 to 10 years and P6 checked from LinkedIn.

## If something goes wrong

| Problem | What to do |
|---|---|
| Export screen says enrichment or AI credits | Cancel. Screenshot. Message Kev. Do not click confirm. |
| A filter is missing in ZoomInfo | Use the closest filter, note it in the Lead Log, and tell Kev. |
| The list is much bigger or smaller than expected | Check your filters against the brief, then ask Kev before exporting. |
| A client's staff member slipped into Crelate | Tell Radar the same day with the record name only. Do not delete the record. |
| You are not sure whether a company is a client | Skip it and ask Radar. |

<!-- pagebreak -->

## Appendix: current client list

Confidential. For the BPO team only. Do not share outside Eden. Never load staff of any of these companies. This list is as of 18 Nov 2026, and Crelate's Client status is the source of truth.

| Client | Note |
|---|---|
| Moss | Referral asks only: if the brief says so, a Moss person can go on a separate "referral asks" list and is never a lead |
| Baker Concrete, Swinerton, XL Construction | Active clients |
| Triton, PB South, Promethean, Prometheus, VMG, Megawatt, Hoffman, Pence Kelly, Fortis, Carmel | Active clients |
| Steed Construction | Treat as a client until Radar says otherwise |

New clients appear in Crelate with Client status before this list is updated. Skip them too.
