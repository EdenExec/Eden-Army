# Kev's flow through the Command Center: Marlowe's design (4 Nov 2026)

Kev, 4 Nov, on a desk's "Review · 63 finished, ready to look": "Too much crap in here that I don't need. Instant decision fatigue ... each agent should have a running to do list they're keeping, more like a clipboard ... A running bullet list with either most recent or most impactful bullets at the top. Bullets could be expandable and I could leave notes right there ... How would Marlowe engineer my flow within the Eden command center?"

## 1. Diagnosis
- Every finished ticket becomes a job for Kev: a done ticket he has not marked seen becomes a needs-Kev "review" item (office/core.js, the needs builder), so 63 closed tickets are 63 cards asking for a tap.
- The system rewards making tickets: the runner's 60-minute FAIL, the board's closed and points, weekly idea tickets.
- One item can show in five places: Needs Kev strip, Clear the stack, the Line, each desk sheet, and Today's Decisions and Needs your input.

## 2. The clipboard (one running list per agent)
- A bullet is one line (10 words or fewer, written as an outcome), an owner, one "why it matters" line, and a state: now, next, waiting on Kev, parked, done.
- Order: impact first, ranked by the agent; ties go to the most recently touched; waiting on Kev pins to the top. Not most-recent first.
- Expand: detail, links, the last three things that happened, the tickets underneath, and a note line where Kev types and presses Enter. The agent answers on the bullet on its next pass.
- Done leaves the clipboard for a quiet log. Each agent writes one Friday digest (five lines or fewer) in place of the review cards.

## 3. Projects above bullets
A project is a title, a status line, one named next step and 3 to 5 bullets. A desk shows active projects as rows that expand to their bullets; loose bullets sit under "Other", capped at 3. A project with no next step is flagged "stalled" to the agent and reaches Kev only if the agent can't unstick it.

## 4. Kev's daily path
- Land on Today. At the top is one Decisions box: everything truly waiting on Kev across all agents, ranked money then age, capped at 5, with the QC two-tap inside. This is the only place he decides.
- Then the scratch pad and the call sheets, then one line per agent ("Marlowe · Ranch massing study · 4 more") that opens its clipboard.
- Collapsed by default: the floor plan, the board, the leaderboard and the pulse. Shown only on request: the done log, ticket history, SLA timers and autopsies.
- Remove the Review group and the needs-Kev light on done tickets. Merge the strip, Clear the stack and Today's Needs your input into Decisions. Retire the Line to a Radar tool. The board moves to Recruit mode and the Friday review.

## 5. Agents and Radar
- Most work is a bullet. A ticket is only for a request Kev hands over, or a gated spend, send, publish or delete. Ideas become parked bullets.
- Each agent tidies its own clipboard every run: re-rank, merge duplicates, park anything untouched for 7 days, log what's done.
- Radar checks the caps every hour: 5 bullets shown per desk, 5 decisions on Today.
- Points come from moving project steps forward, not from closing tickets.

## 6. Data
Add a `clipboard` collection, one document per bullet: agent, project, line, why, state (now|next|kev|parked|done), rank, detail, links, notes[{at,by,text}], ticketIds[], doneAt, digestWeek. Projects stay in agents/{id}.projects and gain a `next` field. Tickets stay readable. Kev's notes save as `actions` keyed `clip-<id>-note`. A done ticket marks itself seen when its bullet is logged.

## 7. Phases
1. This week: done tickets stop raising needs-Kev (Review goes to 0); the strip and Clear the stack merge into Today's Decisions, capped at 5; the Line and the board are collapsed by default.
2. Next: the clipboard collection and the desk sheet rebuilt as Projects then bullets, with inline notes and the done log; runner steps for tidying and caps.
3. Then: the Friday digest card per agent, the scoring change, and retiring the Line from Kev's view.

## Phase 2 status (4 Nov 2026, built in the repo, not published, not committed)
- Built: `draft/office/clipboard.js` (ordering, cap of 5, projects above bullets, loose cap 3, stalled flag, done log, 7-day park rule, note docs), the desk sheet's Clipboard section (waiting-on-Kev pinned, expandable bullets, inline note saved as action `clip-<id>-note`, old Projects folded under "Tickets and shipped work"), a `clipboard` collection listener, 6 tests.
- Not yet: nothing writes bullets into the `clipboard` collection, so desks look unchanged until the runner steps do (agents tidy and write bullets; Radar checks caps with `Clip.capProblems`; answers to notes mark `applied`). Phase 3 (Friday digest, scoring) untouched.
