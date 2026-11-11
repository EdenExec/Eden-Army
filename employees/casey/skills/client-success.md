# Client success

Each client gets the same care: a depth chart that matches reality, notes from every call, a one-page review before the next call, and a follow-up drafted for Kev the same day. Clients and their slugs are in `memory/seed/names-and-clients.md`.

## After a client call (same day)

1. **Get the facts.** Kev's voice note on the call, the Zoom transcript (`mcp__Zoom_for_Claude__get_meeting_assets`), a Plaud recording, or the working doc. If there is nothing to read, ask Kev for a two-minute voice note.
2. **Meeting note.** `set clients/{slug}/meetings/<YYYY-MM-DD>-<topic>`: date, title, attendees (names and roles only), what was said in five lines or fewer, decisions, the client's asks, our next steps with owner and date, source.
3. **Depth chart.** Every candidate discussed moves to the stage the client gave (Interview, Offer, Out) with a dated note; new seats the client opened go on the chart and as new JOs (`skills/voice-note-intake.md`, New JO). Seats the client closed: the JO goes `killed` or `filled`, never deleted.
4. **Project note.** Update `clients/{slug}/notes/{id}` for the live project: status, decision, next steps.
5. **Follow-up draft** (below), and decisions Kev owes to Radar as proposed ledger rows.
6. **Re-render flag.** If the chart changed, tell Radar so the printed depth chart is re-rendered (`employees/radar/skills/standing-rules.md`, depth charts, 8 Oct); Radar files the PDF on the Eden Desk and in Drive.

## Before a client call: the one-page client review

The day before (from `mcp__Google_Calendar__list_events`, or a ticket), write `projects/team-hub/client-reviews/<slug>-<YYYY-MM-DD>.md`, one page, Eden standard:

| Section | What goes in it |
|---|---|
| Result | One line: where the account stands ("4 open seats, 2 candidates at interview, one decision for them") |
| Open seats | Table: seat, location, JO status, owner, days open |
| Candidates by stage | Table per seat: name, stage, last move date. Internal version only; see below |
| Our asks of them | Two or three: feedback owed, interview slots, a decision on a seat |
| Their asks of us | From the last meeting note, with status |
| Since last call | Placements, drops, new seats, three lines or fewer |

**Two versions when it might be shown.** The internal review carries names and stages. If Kev may screen-share it with the client, make a client copy: this client only, no other client's name anywhere, no internal notes (pipeline order, comp, who else the candidate is talking to). Submittal documents follow the client-agnostic rule in the standing rules (8 Oct).

## Follow-up drafts

- One draft per client call, from the meeting note: thanks in one line, what we heard, what we will do by when, what we need from them. Content only: Jenny (`host`) owns the tone and final wording of client email, and Kev sends.
- Save it as `projects/team-hub/drafts/<YYYY-MM-DD>-<slug>.md` and submit `npm run qc -- submit casey send_message "<summary>" "<exact text>" --to <recipient>`. Then stop.
- Calendar invites to clients are Kev's (title and Zoom rules in the standing rules, 23 Oct); you may draft the text, never send the invite.
- Never name another client or another client's candidate in anything a client sees.

## Who owns what around the client

| Need | Owner | You |
|---|---|---|
| Fee agreement, terms, client paper | Docket reviews, Kev signs | Flag the JO "waiting on fee agreement" and keep it on hold |
| Lead lists and talent pools | Scout | Brief from the board (`skills/board-keeping.md`) |
| Recruiter activity and scorecards | Dean | Never score recruiters; JO activity questions go to Dean through Radar |
| Client email voice | Jenny | Content drafts only |
| Invoices after a placement | Radar (invoicing), Tally | Tell Radar the placement date and seat; never a fee figure on the board |

## Rules

- Names, role and status only on the Hub, the board post and the review. No pay, comp, phones, emails or home addresses.
- **Baker is named (Kev, 5 Nov 2026).** "We can stop calling Baker discreet client, lets name them as Baker." Baker Concrete is written by name on every internal surface (Hub, tickets, briefs to Scout, drafts, team email): `client: "Baker Concrete"`, `client_slug: "baker"`. One client still never sees another client's name. `discreet: true` stays for any client Kev asks to keep unnamed later.
- Never send, book or publish; nothing at all from Friday sunset to Saturday sunset (the Sabbath).
