# Future dates from calls go to Hawk (Kev, 13 November 2026)

Kev: "As I dump notes from calls (transcripts) into Radar throughout the day, if we talk about dates in the future (example: Hoffman coming to town in December) or us going to PB South in December, he should push those dates to Hawk, who is going to start tracking mid-range scheduling."

## The rule

Every time Kev gives you a call transcript, voice note, call summary or any dump, read it for **future dates**: anything dated or windowed beyond the current week. Examples: a client visiting Boise in December, Kev and the team going to PB South in December, a job fair, a trip, a deadline, an offer or start date, a board or forum date, a hiring window, "after Thanksgiving", "week of the 7th". Same-week items stay on the ledger as usual (skills/ledger.md); this is for the mid range (about one to ten weeks out) and anything later that has a date on it.

For each one, in the same pass as the rest of the dump (do not wait for the next sweep):

1. **Write one line** with: what, when, who, where, confidence, source.
   - *When*: the exact date if one was said ("Tue 8 Dec"); otherwise the window as said ("December", "week of 7 Dec", "mid-Dec", "after Thanksgiving") and mark it `window`. Never invent a day.
   - *Confidence*: `firm` (a date was agreed), `tentative` (talked about, not confirmed), or `idea` (floated).
   - *Source*: the call and day ("Hoffman call, Fri 13 Nov"), never the transcript text.
2. **Check first** whether Hawk already has it: read the Look Ahead page items (https://claude.ai/artifact/W6m2KGscEaeG7i2Q2w3CHU, collection `items`). If it is there, only send a change (new date, firmer, cancelled).
3. **Push it to Hawk** as one ticket on the Command Center (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW, collection `tickets`): `agent: "lookahead"`, `lane: "work"` (use `"home"` only for family items, never named), `createdBy: "radar"`, `priority: "today"`, `lever: "dates"`, title "Dates from <call>", and one line per date in `ask`. Batch every date from one dump into one ticket.
4. **Say so in your close to Kev** in one line ("Sent Hawk 2 dates: Hoffman visit in December (window), PB South trip in December (window)"), and add a question if a window needs a day ("Which week in December for Hoffman?"). Put that question in the check-out, not as an interrupt, unless the date is inside 14 days.
5. When Kev answers, send Hawk the update the same way.

## Limits

- You push dates; Hawk owns the mid-range schedule. Never put a hold on Kev's calendar from this (a calendar hold is a QC item).
- Client names: use the name only as a surface already allows it. A discreet client goes as "a client (discreet)". No pay, no candidate names, no health detail, no phone numbers.
- Family dates go with `lane: "home"`, first names and the activity only, and never to an Eden surface.
- Do not push a date you are not sure was said about the future. If it is unclear whether it is a past or future date, ask Kev.
- Sabbath: nothing is pushed or asked between Friday sunset and Saturday sunset; it waits for Saturday after sundown.
