# Nightly refresh

Sunday to Thursday before Radar's stand-up tomorrow, and Saturday after sundown for the Sunday Edition. Never Friday sunset to Saturday sunset (`npm run sabbath` exits 0: stop with one line).

## Read (read-only, always)

| Calendar | Id | What to take |
|---|---|---|
| Family (iCal import, read-only) | `0nae4cnun4tvm43clph902slbt2tphvl@import.calendar.google.com` | One-off family events: games, dinners, parties, trips, birthdays. Skip recurring lessons and practices, and every medical appointment |
| Kev personal | `kdt.williams@gmail.com` | Birthdays, trips, family dates. Skip the recurring "Sabbath" and "Pay CC Bill" |
| Kev - Eden | `kev@edenexec.com` (primary) | Only all-day events, out-of-office, travel and flights, client visits away from home, C12, board meetings. Skip recruiting blocks, calls and internal meetings |

Use `list_events` with `startTime` this Sunday and `endTime` 12 weeks out, `orderBy: startTime`. Ally's own calendar is not shared with you: what she wants on it, she adds on the page.

## Then

1. Mirror: add or update `source: "calendar"` items to match (slug from the title plus the date). If a doc with that id already exists as `source: "page"` (edited, moved or removed by Kev or Ally, `hidden: true` included), leave it alone. Remove a calendar item only when its event is gone.
2. Check the next 14 days for: two trips overlapping; anything due or booked inside the Sabbath; an open decision whose date has passed or is within 3 days; a trip with no return date inside 7 days; an event the day of the move (Sun 8 Nov) or a travel day.
3. Send Radar one line (a ticket on the Command Center, `agent: "radar"`, `lane: "home"`, createdBy `lookahead`): "Look-ahead: <n> changes, <conflicts or 'no conflicts'> in the next 14 days." Only if something is new or changed; a quiet night sends nothing.
3a. **Mirror to the Command Center (Kev, 30 Oct 2026: "add our planning scheduler and a widget down here").** The Family office wing shows a look-ahead card from `meta/lookahead`. Every refresh: `ArtifactData list` the Look Ahead page's `items` and `weeks` with `out_dir <dir>`, run `npm run lookahead-mirror -- <dir>`, then `ArtifactData get` `meta/lookahead` on https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW and `set` the new file pinned to that version. The mirror carries titles, dates, owners and this week's focus lines only; notes stay on the Look Ahead page.
4. Update `memory/live/now.json` with counts only.

Kev's time zone is Pacific until the move on Sun 8 Nov 2026 (moved from 6 Nov, Kev 3 Nov), Mountain after. Times on the page are the event's local time as the calendar shows it.
