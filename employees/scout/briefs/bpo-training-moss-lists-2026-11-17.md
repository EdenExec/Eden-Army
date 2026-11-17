---
title: Building and Loading Lead Lists
subtitle: Training guide for Rubab and the BPO team, first run: three Moss lists
author: Eden Partner Group
date: 17 Nov 2026
cover: false
toc: false
---

## Executive summary

You will pull three candidate lists from ZoomInfo Sales with bulk credits, clean and tag them, and load them into Crelate so recruiters can start calling.

The first run is three lists for Moss: Tampa pre-construction, Tampa senior superintendent, and West Palm and Miami schedulers. About 420 people in total.

| Item | Detail |
|---|---|
| Your result | Three clean lists in Crelate buckets, one Drive sheet each, a dated Lead Log row each |
| Credits | Bulk credits only. One credit per exported contact. |
| Tools | ZoomInfo Sales (your BPO seat), Google Drive, Crelate |
| Questions | Kev Williams or radar@edenexec.com |

## The five rules

| Rule | Why |
|---|---|
| Use ZoomInfo Sales (Advanced Search, then Lists). Never use GTM Studio. | GTM Studio exports spend enrichment credits. Sales exports spend bulk credits. |
| Check the credit type before you click Export. | If the screen says enrichment or AI credits, cancel and message Kev. |
| Clean the list before you export it. | Every exported row costs a credit, so remove rows you do not want first. |
| Never load Moss's own employees. | Moss is our client. We recruit for them, not from them. |
| Phone numbers stay inside Eden. | Never put them in an email, chat or anything outside Drive and Crelate. |


## Part 1: Pull the list in ZoomInfo Sales

| Step | What to do |
|---|---|
| 1 | Open ZoomInfo Sales and sign in with your BPO seat. Choose Advanced Search, then Contacts. |
| 2 | Set the filters for the list (Part 2). |
| 3 | Add the exclusions: in the Company filter use Exclude and add every name on the exclusion list (last page). Also exclude homebuilders and electrical or trade subcontractors. |
| 4 | Filter to contacts that have a mobile phone. |
| 5 | Scan the first two pages of results. If you see homebuilders, equipment or software companies, add them to the exclusions and search again. |
| 6 | Save the search (Saved Searches). Name it with today's date, client and role. |
| 7 | Select all results, then Add to List. Name it "2026-11-17 - Moss - [role]". |

Filter labels move around in ZoomInfo, so match each one to what the screen shows. If a filter is missing, tell Kev.

## Part 2: The three Moss searches

### List 1: Tampa senior and chief pre-construction

| Filter | Setting |
|---|---|
| Location | Tampa Bay metro |
| Industry | Commercial and Residential Construction |
| Company size | 50+ employees |
| Job titles | Preconstruction Manager, Senior Preconstruction Manager, Director of Preconstruction, Chief Preconstruction Officer, VP of Preconstruction, Preconstruction Executive, Senior Estimator, Chief Estimator, Director of Estimating |
| Expected size | About 200 |

Moss prefers healthcare experience, then transportation and public works. Flag any healthcare contractor in the Fit note column.

### List 2: Tampa senior superintendent

| Filter | Setting |
|---|---|
| Location | Tampa Bay metro |
| Industry | Commercial and Residential Construction |
| Company size | 200+ employees |
| Job titles | Senior Superintendent, General Superintendent, Senior Project Superintendent |
| Expected size | About 140 before removing homebuilders |

### List 3: West Palm and Miami schedulers

| Filter | Setting |
|---|---|
| Location | West Palm Beach and Miami metros |
| Industry | Commercial and Residential Construction |
| Company size | 100+ employees |
| Job titles | Scheduler, Project Scheduler, Construction Scheduler, Planner Scheduler, Assistant Scheduler, Assistant Planner, Scheduling Engineer, Senior Scheduler, Planning Engineer |
| Exclude titles | Manager, Director, Vice President, Controls, Project Controls, Production |
| Expected size | About 80 |

Moss wants a scheduler with 2 to 5 years of experience and P6, with 10 years the maximum. It does not want a manager.

<!-- pagebreak -->

## Part 3: Export with bulk credits

| Step | What to do |
|---|---|
| 1 | Open Lists and open the list you built. Delete rows that do not belong: Moss employees, other clients, homebuilders, wrong titles. |
| 2 | Write down the row count that remains. This is your credit estimate. |
| 3 | Click Export and choose CSV. Read the confirmation screen. |
| 4 | The credit type must say bulk (or data or export) credits. If it says enrichment or AI credits, cancel, take a screenshot and send it to Kev. |
| 5 | Confirm. Never export the same list twice. |
| 6 | Save the file as "2026-11-17 - Moss - [role] - raw.csv" in your working folder. |

If the row count is more than 50 above the expected size in Part 2, stop and ask Kev before you export.

## Part 4: Clean the file

| Check | Action |
|---|---|
| Moss employees | Delete the row. Any Company containing "Moss" goes. Count them. |
| Other clients | Delete the rows (exclusion list, last page). Count them. |
| Homebuilders and trade subs | Delete the rows. Examples: Taylor Morrison, Lennar, electrical contractors. |
| Mobile marked Do Not Call | Keep the person, leave the Mobile cell blank, and write "DNC flag" in Phone notes. |
| No name or no company | Delete the row. Count it. |
| Duplicate people | Keep one row per person. |

## Part 5: Build the sheet

Create one Google Sheet per list, titled "2026-11-17 · Moss · [Role] · [City] · N leads". Split the scheduler list into one sheet for West Palm and one for Miami. Use these columns in this order.

| Column | What goes in it |
|---|---|
| Ref | List code plus a number: MS-PRE-001, MS-SUP-001, MS-SCH-001 |
| Tier | 1 or 2 (rules below) |
| Name, Title, Company | From the export. Fix capitalization. |
| Mobile, Mobile source | The mobile from the export. Mobile source: "ZoomInfo export". Blank if none. |
| Direct, Phone notes | Direct phone if present. Phone notes: "DNC flag" or blank. |
| City, State, Time Zone | Three separate columns. State is two letters (FL). Time Zone is EST for every Moss list. Never one combined location. |
| LinkedIn | The profile URL. If blank, use a people-search link: linkedin.com/search/results/people/?keywords=First Last Company |
| Fit note | One line. Healthcare, public works or P6 notes go here. |
| Source | "ZoomInfo Sales export" and the date |
| Note | Anything the recruiter should know |

| Tier | Pre-construction | Superintendent | Scheduler |
|---|---|---|---|
| 1 | Pre-con manager, senior pre-con manager, director or VP at a commercial contractor in Tampa Bay | Senior or general superintendent at a commercial contractor | Scheduler or planner scheduler, about 2 to 5 years |
| 2 | Estimators and chief estimators | Other superintendent titles | About 5 to 10 years, or years unclear |

For schedulers, open the LinkedIn profile and estimate years of experience. If you cannot tell in two minutes, mark Tier 2 and write "years unclear" in Fit note. Anyone over 10 years goes in Fit note only: "over 10 years, check with Scout".


## Part 6: Load into Crelate

Lists go into a bucket in the Leads / Buckets column. Never load them onto an active job order and never create a job order for a list.

| Step | What to do |
|---|---|
| 1 | Find the bucket. Names: "Moss - Pre-Con Manager - Tampa Leads", "Moss - Senior Superintendent - Tampa Leads", "Moss - Scheduler - West Palm Leads", "Moss - Scheduler - Miami Leads". Create any that do not exist, in Leads / Buckets only. |
| 2 | Check for duplicates first. Search Crelate by LinkedIn URL, then by name plus company. |
| 3 | If the person exists, add the existing record to the bucket. Add the mobile only if the record has none. Do not change the owner, status or notes. |
| 4 | If the person is new, create one record with Name, Title, Company, LinkedIn URL, City, State, Time Zone and Mobile. |
| 5 | Set Source to "Eden lead load 2026-11-17" (the day you load). |
| 6 | Add the tags below to every record. |

| Tag | Example |
|---|---|
| Client | Moss |
| Role | Pre-Con Manager, Senior Superintendent or Scheduler |
| Time Zone | EST |
| Lead date | Lead 2026-11-17 |

Skip any person Crelate already marks do-not-contact and count them. Never upload pay, age, ethnicity, gender, home address or personal email, even if a column has it.

## Part 7: Finish and report

| Step | What to do |
|---|---|
| 1 | Save the final sheet in the master lead folder in Drive. Do not move, rename or copy any other sheet. |
| 2 | In the Lead Log, put the load date in the In Crelate column. In Owner note write counts only: loaded, already in Crelate, skipped, removed as Moss or other clients, and the bucket name. |
| 3 | Log the credits: row count exported and which list, in the Lead Log Owner note. |
| 4 | Email radar@edenexec.com one short note: sheets loaded, records created, duplicates matched, rows skipped, anything odd. No names or phone numbers in the email. |

## If something goes wrong

| Problem | What to do |
|---|---|
| Export screen says enrichment or AI credits | Cancel. Screenshot. Message Kev. Do not click confirm. |
| Filter is missing in ZoomInfo | Use the closest filter, note it in the Lead Log, and tell Kev. |
| The list is much bigger or smaller than expected | Check your filters against Part 2, then ask Kev before exporting. |
| A Moss employee slipped into Crelate | Tell Radar the same day with the record name only. Do not delete the record. |
| You are not sure whether a company is a client | Skip it and ask Radar. |

<!-- pagebreak -->

## Appendix: companies to exclude from every list

Confidential. For the BPO team only. Do not share outside Eden.

| Group | Companies |
|---|---|
| Never load their staff | Moss, Swinerton, XL Construction, Triton, PB South, Promethean Builders, Prometheus, VMG, Megawatt, Hoffman, Pence Kelly, Fortis, Carmel |
| Also skip | Homebuilders and electrical or trade subcontractors |

If Crelate shows a company with Client status that is not on this list, skip it and tell Radar.
