---
org: kdtw
title: Runway block, design direction
---

# Runway block, design direction

**My recommendation: one cream sheet that reads top to bottom, from a glance to the detail.** A thin runway strip shows all 6 to 8 weeks in one line. Month blocks beneath it show every day. Plain lists and open decisions close it out. Hawk fills the data each week and Jenny reads it in under a minute.

## How it reads at a glance

| Layer | What it answers | How it is drawn |
|---|---|---|
| Runway strip | What big things are coming, and when | One line of days. Trips, milestones, deadlines and anything longer than a day. A heavy tick marks today |
| Month blocks | What is on each day | Two or three calendar blocks side by side, stacked on a phone |
| Lists and decisions | The detail, and what must be decided | Three columns by horizon in date order, then open decisions with "decide by" |

## The month block

- **The grid.** Weeks run Sunday to Saturday, to match the Look Ahead page (Kev, 13 Nov 2026), from `startSunday`. Rows show only the weeks on the runway, and the left gutter numbers them W1 to W8. A month with fewer than seven runway days folds into its neighbour, with the month named on the day (so "1 Jan" sits in December). Days already past sit on a darker cream. Today's date is set in a small ink box.
- **Bars and marks.** Multi-day events are bars across their days, squared off where they run on into the next row. Single-day items are a small mark and a label, which runs into the empty days beside it, so names are not cut short.
- **Milestones and deadlines.** A milestone is a solid ink diamond. A deadline is a short brass upright with brass text. A decide-by date is a hollow brass diamond.

## Horizons, kinds and status

- **The three horizons.** A heavy ink line closes 2, 4 and 6 weeks (and the end of the runway), each on a Saturday, so it runs under the whole week row. If a horizon date ever lands mid-week the line steps there, and the gutter labels it 2W, 4W, 6W or 8W. On the strip the same lines split the four zones: Next 2 weeks, Weeks 3 to 4, 5 to 6, and 7 to 8.
- **Kinds are told by shape and fill, never by colour.** Work is an ink outline, family is a warm stone fill, and travel is a fine hatch. Brass is the only accent, and it only ever means "due" or "decide".
- **Status is told by line.** Confirmed items are solid and upright. Tentative items are dashed and italic, carry a "?" and get a TENTATIVE tag in the lists. Lists also show where an item came from when it is not on the calendar ("From a call").

## The Sabbath

Saturday is the quiet stone column at the right edge of every week. Friday carries the same tint over its last quarter, for Friday sunset, so the rest closes each week. There are no words in the grid; the legend explains it once. Hawk never sets a due date inside it.

## Print and phone

| Medium | Behaviour |
|---|---|
| Print | One US Letter landscape page. White ground, black ink, smaller type. The sheet scales itself down if a busy week runs long |
| Phone (400 px) | Months stack, lists go to one column, strip zones shorten to 1-2, 3-4. Nothing scrolls sideways |
| Dark | Matte warm black with cream ink and the same brass, for screens only |

## Hawk's weekly routine

1. Write the week's JSON (schema in the brief: `asOf`, `owner`, `weeks`, `startSunday`, `events`, `horizons`, `openDecisions`). Horizons are Saturdays. The old name `startMonday` still works if it is a Sunday; otherwise it is ignored and the runway starts on the Sunday on or before `asOf`.
2. Run `node render-runway.mjs week.json week.png --pdf week.pdf --html week.html`. It warns on bad dates, a start that is not a Sunday, a horizon that is not a Saturday, sideways scroll or a second print page.
3. Hand Jenny the PNG and the HTML. Family items stay on this sheet only, and no health details ever go on it.

## Assumptions

- Sunday-start weeks, decided by Kev on 13 Nov 2026 to match the Look Ahead page.
- The strip leaves out one-day work and family items, to keep the glance clean.
- Montserrat is embedded from the repo's font files when rendering. In a browser without it, the page falls back to Helvetica Neue or Arial.
