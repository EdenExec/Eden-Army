# Mid-range scheduling and the weekly runway push to Jenny (Kev, 13 November 2026)

Kev: "Radar pushes future dates from my call transcripts to Hawk, who is going to start tracking mid-range scheduling, with a weekly push to Jenny for the 2 week / 4 week / 6 week look ahead plus major upcoming events, in a Marlowe-inspired monthly calendar block for a 6 to 8 week runway."

You keep the mid range (about one to eight weeks out) as the working picture between the 12-week strip and the week in front of Kev. Jenny (`host`) uses it to plan trips, events and visits.

## 1. Intake from Radar

Radar sends tickets with `lever: "dates"`, `agent: "lookahead"`: one line per date with what, when (a day or a window), who, where, confidence (firm, tentative, idea) and source. Handle them in your nightly refresh, and the same day if a ticket is marked today.

- Add each as an item on the Look Ahead page (source `call`). A firm date is a dated item. A window ("December") is an item with the window's first day as its placeholder and the text "window: December", plus an **open decision row**: "Pin the week for <item>", decide by a date two to three weeks before the window starts. Never invent a day.
- If it is already on the page, update it (firmer, moved, cancelled); never overwrite what Kev or Ally typed.
- Check it against Kev's calendars for conflicts and travel clashes (Thanksgiving, the Lincoln trip, family dates) and say so in the line you send Radar.
- Reply to Radar's ticket (done, with one line of what you added and any question for Kev). Questions go to Radar, who asks Kev at the check-out.

## 2. The weekly runway push to Jenny

When: every Sunday, after the stand-up prep (the "Hawk · Sunday stand-up prep" routine, Boise time). If the Sabbath is on, it waits for Saturday after sundown.

Build:
1. The data: all items from today through 8 weeks out (calendar mirror, call-sourced, page-sourced), status confirmed or tentative, open decisions with decide-by dates. Family items appear only as "Family" blocks with the date and no detail (and never kids' schools, health or anything on the no-list in your persona). Work items use client names only as the surface allows (a discreet client is "a client (discreet)").
2. The block: Marlowe's monthly runway template in `projects/lookahead/runway-block/` (see its README or design-direction.md). Write the data as JSON in its schema (see `sample.json` there) to `projects/lookahead/runway-block/weekly/<YYYY-MM-DD>.json`, then render: `node projects/lookahead/runway-block/render-runway.mjs <that json> <same path>.png --html <same path>.html` (add `--pdf` if Jenny wants one). The script warns on a bad date or kind; fix those before pushing. Weeks run Sunday to Saturday (Kev, 13 Nov 2026: "Sunday is my ideal" week start, matching the Look Ahead page); the data field is `startSunday`.
3. Three lists in the ticket: **Next 2 weeks**, **Weeks 3 to 4**, **Weeks 5 to 6** (and 7 to 8), each in date order, one line per item with the owner and what is still open.

Push: one ticket on the Command Center to `agent: "host"` (Jenny), `createdBy: "lookahead"`, title "Runway for the week of <Sunday>", the three lists in `ask`, and the paths to the PNG and JSON in the repo. A second one-line ticket to Radar ("Runway sent to Jenny: N dates, M tentative, K open decisions, what changed since last week"). Nothing is sent outside the Office; a hold on a calendar is still a QC item through Radar.

Changes since last week go first ("New: ...", "Moved: ...", "Dropped: ..."), then the lists.

## 3. Quality

- Dates as "Tue 8 Dec". Windows say "window". Tentative says tentative.
- Never claim an item is firm unless Kev or a calendar said so.
- If the runway has nothing new, still push it with "No changes".
- Keep the Sabbath: no due dates set inside it.
