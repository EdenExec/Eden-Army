---
title: Agents working together, the weekly WIP, Radar's QC strip and the Duet feed
subtitle: Q's spec for Kev's 12 November 2026 Command Center idea
org: epg
status: spec only, nothing built or published
---

# Result

Four additions to the Command Center, all riding on the database, the ticket runner and the Friday routine that already exist. The first slice (dotted lines plus the WIP card data) needs no new permission and can ship next week. The Duet feed needs Kev's yes on a recurring message to himself and a check of what the Duet session accepts.

Kev, 12 Nov 2026: agents work directly together, shown with a dotted line; a weekly WIP of status, ideas and areas to help; a QC strip from Radar ("don't close the week with open tickets, don't close the day with open team requests"); Claude Duet as an Instagram-style feed of statuses, served at the time each calendar says.

Not changed by this spec: agent tool grants, permissions, the QC gate. A ticket is still delegation, never approval.

# 1. Collaboration on the floor

**The rule.** A ticket has one `lead` (accountable for the result and the only one who may close it) and zero to four `collaborators` (each owes one named piece). While the ticket is open, `picked`, `working` or `waiting`, the Floor draws a dotted line between the lead's desk and each collaborator's desk. When it closes the line fades; a line that has been up more than 24 hours with no log movement turns amber.

**Ticket fields** (`tickets/{id}`; existing fields unchanged; `agent` stays and equals `lead`, so today's page and runner keep working):

| Field | Holds |
|---|---|
| `lead` | agent id; defaults to `agent` |
| `collaborators` | array of `{agent, piece, status, resultLink}`; status is `open`, `working`, `done`, `blocked` |
| `handoffs` | array of `{from, to, at, note, artifact}`; append-only, newest last; `note` 140 characters max |
| `weighIn` | optional array of agent ids asked for a comment only (Marlowe in Kev's example); drawn as a lighter dotted line, no piece owed |
| `thread` | slug shared by sibling tickets (the WIP report is one thread) |
| `parentTicket` | id, when a collaborator piece is split into its own ticket |

**Alerts** (`alerts/{id}`) gain `pair` (array of two or more agent ids) and `ticket`. A `sync-collab-<ticket>` alert is derived, like the other `sync-` ids: it exists while any collaborator piece is `blocked` or older than 2 hours, so the Floor can pulse the line instead of the strip filling with noise. `agents/{id}` gains `withAgents` (ids currently sharing a ticket with it), which is what the page reads to draw lines without scanning every ticket.

**Where Kev sets it.** The Hand-a-ticket form gets one optional field, "Working with", a multi-select of desks, plus a "weigh in" toggle. Radar can also set it when it splits an ask. Nothing else about the form changes.

**How the runner hands work between agents** (additions to `employees/radar/skills/ticket-runner.md`; to be written after Kev's yes):

1. Step 3, pick-up: for a ticket with collaborators, Radar starts the lead and the collaborators in the same message, each with its `piece`, the ticket id and Kev's ask word for word.
2. Agents never write the database (existing rule). A collaborator returns its piece as a file plus a one-line result; Radar writes `collaborators[i].status = done`, `resultLink`, and appends a `handoffs` row.
3. When all pieces are `done`, Radar re-runs the lead once with every `resultLink` as input to assemble the result, then closes the ticket. One re-run, the same limit as the existing unstick rule.
4. A `weighIn` agent gets a read-only copy of the draft and returns up to three lines. Comments go in `handoffs`, not into the lead's file.
5. Gated work stays gated: if any piece would send, spend, publish or write to a live system, that piece alone goes to QC and the ticket is `gated`, with the other pieces shown done.
6. A collaborator piece stuck 2 hours is `blocked` with `blockedOn`, and the line turns amber. The lead is told which piece is missing instead of waiting silently.

**Cross-department synergy, made visible.** The Floor gets a small "pairs this week" tally (distinct agent pairs that shared a closed ticket). Counts only; it is the number Kev asked to grow.

**Privacy on the Floor.** Under Screen-share, tickets that touch finance, family or people (Tally, Docket, Atlas, Marlowe, Keys, Dean) draw the line but blank the title and piece, matching the existing screen-share switch. A client named in a piece shows as "Client · discreet" for Baker and INL; other client names stay in the Hub and the Floor shows counts and links only.

# 2. The weekly WIP report

**Shape.** One card per agent, five blocks, three lines each at most. The WIP is itself a collaborative ticket: lead Radar, collaborators every agent with an active project, `weighIn` any agent Kev names (in his example Jenny and Scout write, Marlowe weighs in).

| Block | Content | Source |
|---|---|---|
| Shipped this week | Up to three outcome lines, each with a link | The agent's `projects/<slug>/status/<date>.md`, closed tickets, commits under `employees/<id>`. Link is an artifact URL or a repo path; Dean's "built intern program and training modules" links to a shareable artifact holding the program and the Eden U links |
| In progress | Up to three projects: state, next step, date | Each project's schedule and `now.json` |
| Ideas | Up to two, each ready for yes or no | The agent's weekly idea tickets (already required) |
| Areas to help | Where another agent could take work (names the agent) | The agent's own call; feeds the `collaborators` suggestion on next week's tickets |
| Asks for Kev | Up to three, money first | Slide 2 of the lab-review deck |

**Where agents write it.** Each agent's last step on Friday is a file, `projects/<slug>/status/<date>.md` (existing) plus a new `employees/<id>/wip/<YYYY-MM-DD>.json` holding the five blocks. Agents write files only; Radar's Friday run reads them and pushes one `reports/wip-<date>` document and one `reports/wip-<date>/cards/<agent>` document per card (a card is a sub-document so the page can lazy-load). Shipped lines without a link are shown as "no link" and counted, not hidden. Figures need a source or the card says "not checked", as everywhere else.

**Clickable shipped items.** A shipped line's `artifact` is a Claude artifact URL (private to Kev by default). Making one shareable is publishing and stays a QC item; the card shows "Share" only after Kev approves that exact artifact.

**Friday cadence** (Pacific; the Sabbath rule holds):

| When | What |
|---|---|
| Thu 5:30pm check-out | Radar opens the WIP ticket with collaborators set, so agents have the night |
| Fri 1:50pm | Agent decks and `wip/<date>.json` due (this is the existing EOW deadline; the WIP is not a second one) |
| Fri 2:30pm | Radar assembles, runs the QC strip (section 3), writes `reports/wip-<date>` |
| Fri 3:50pm | Existing week review reads the WIP instead of rebuilding it |
| Sun | Lab review walk-through unchanged; the WIP is its first page |

The "WIP at any moment" lever Kev already has stays: it renders the same cards from the latest `wip-` document and marks anything older than today as "as of Friday".

# 3. Radar's QC strip

A band at the top of the WIP and a thin strip on the Floor. Each check is a row: green, amber (open items), red (broken), with a count, the source, and `asOf`. Radar runs it at day close (check-out prep) and week close (Friday 2:30pm). A check that cannot read its source shows "not checked" and never green.

| Check | Question | Data source (read-only) |
|---|---|---|
| What's broken | Failed or stale routines, expired connectors, blocked tickets, stale desks, un-synced tools | `agents/*` stale and silent flags, `tickets` with `status == blocked`, `meta/sync`, `friction.md`, `tools` quiet for twice cadence |
| Finance up to date (Tally) | Books closed through the last month end; bank and card feeds categorised; past-due list matches the invoice list | `benches/finance/rows` (`booksClosed`, `asOf`, `gate`); the gate files via `npm run gate -- list`; EPG Cash Pulse invoice list. Tally answers; Radar never computes it. Entity shown (EES or EPG), never blended |
| Contracts awaiting execution | Sent or approved, not countersigned; drafted, not yet sent | Docket's second-key tray (`gates/*.json`), `projects/*/legal/`, pending QC items of kind `send_message` or `publish` that carry a contract |
| Open PTC or client needs | Candidates presented to client with no client answer past the agreed window; client asks with no owner | Crelate (read-only) via the mirror when it is live, until then via Dean and Jenny's tickets; Team Hub `team_asks`; ledger rows tagged to a client |
| Open tickets at day close | Any ticket not `done` or `gated` with a dated reason | `tickets` collection |
| Open team requests at day close | `team_asks` and Desk cards still `open` | Team Hub `team_asks`, Desk cards, `qc/pending/` |
| Week close | The two lines above must be zero or each carry an owner and a date; otherwise Friday 2:30pm raises them to Kev as one decision batch | Same |

**The rule as code.** "Don't close the week with open tickets" becomes: at 2:30pm Friday, every open item gets one of three states in the strip (done, dated and owned, or put to Kev). Nothing is silently carried. The strip never closes a ticket itself.

**Privacy.** The strip shows counts, ticket ids and links. No comp, no phones, no emails. Candidates appear as name and role at most; Baker and INL appear as "Client · discreet".

# 4. The Duet feed

**What it is.** A short run of status cards in Kev's Claude Duet session, Instagram-style: one card per post, newest first, a picture-like header (the card's graphic), two lines of text, and tap targets. Not a dashboard; a feed that arrives at the moment each part of the day needs it.

**Schedule** (from the calendar rhythm; the exact times come from Kev's calendar blocks, not hard-coded):

| Slot | Posts |
|---|---|
| 5:30am brief | Today's agenda card, QC strip card (what's broken), top three decisions waiting |
| Midday | Pairs in flight (dotted-line tickets), anything newly blocked, one idea card |
| 5:30pm check-out | Day-close QC card (open tickets and team requests), what shipped today |
| Friday 2:30pm | The WIP: one card per agent, then the week-close QC card |
| Never | Between Friday sunset and Saturday sunset; held and posted after Saturday sundown |

**Card contents** (shared by the page and the feed, so there is one builder):

| Part | Holds |
|---|---|
| Header | Agent or pair, a status chip (done, working, blocked, needs you), time |
| Graphic | A small server-made image or SVG: lights, a count, a spark; brand rules apply (black, white, cream, greys, muted state colours only) |
| Text | Result first, two lines |
| Link | The artifact or repo path |
| Taps | The reply options below |
| Footer | Source and `asOf`; "Crelate is the system of record" where mirror data appears |

**How it is sent.** Radar pushes a card with `send_message` to the Duet session, one message per card, batched per slot. Facts to confirm before building, because I have not been able to verify them from the repo or a live session: whether `send_message` can address a named Duet session at all, whether it accepts an image or only text and a link, the per-message size, and whether cards from a scheduled run arrive when no one has Duet open. Assumed limits for planning: text with a link works; images are the risk. Fallback if images do not travel: the card is text plus a link to a graphic page published once as an Artifact (`/feed#<card>`, hash routing), which Duet opens. A message to Kev about Kev's own work is a send, so the first run of each slot goes through QC for his yes; after that, a standing approval for this exact slot list (see "Needs Kev's yes").

**What Kev can tap back.** Each card offers up to four:

| Tap | Effect |
|---|---|
| Approve | Only for a card that carries a QC item with its hash; clears that exact item |
| Go | Opens the ticket the card proposes (an idea card becomes a ticket on the right desk) |
| Not now | Marks seen; the idea returns in 7 days at most |
| Note | Free text, written to the ticket or the WIP card as Kev's follow-up, treated as his answer |

A reply in Duet reaches Radar the way any message from Kev does (his own message). Radar translates it to a `tickets` write or a QC approval. Nothing a card says is an approval by itself; the hash must match.

**Limits.** Duet is a push surface here, not a database: the Command Center stays the record. Radar sends in the slot windows only, so the feed is bounded (about 8 to 12 cards a weekday, 8 to 12 on Friday). Quiet hours follow Kev's calendar; focus blocks are respected.

# 5. Build order and effort

| Step | Work | Owner | Effort |
|---|---|---|---|
| A | Schema: `lead`, `collaborators`, `handoffs`, `weighIn`, `thread` on tickets; `pair` and `ticket` on alerts; `withAgents` on agents; `office sync` derives `withAgents` and `sync-collab-` alerts; tests | q-data | 1 day |
| B | Floor: dotted lines from `withAgents`, amber state, "pairs this week" tally, Working-with field in Hand-a-ticket, screen-share blanking | q-page | 1.5 days (one page helper at a time; the Floor panel is `floor.js`) |
| C | Runner rules for collaborators and hand-offs (skill edit for Radar) | Q drafts, Radar adopts | 0.5 day |
| D | WIP: `wip/<date>.json` schema, `reports/wip-` builder, card view on the page | q-data then q-page | 2 days |
| E | QC strip: checks and sources, `not checked` handling | q-data (reads), q-page (strip) | 2 days; the PTC check waits for the mirror or a Crelate-derived count |
| F | Duet feed: card builder, slot schedule, send path | q-data builds cards; Radar sends | 1.5 days after the `send_message` facts are known |
| G | q-qa on the merged tree: ticket with two collaborators draws a line and fades on close; screen-share blanks; a WIP card with no link is counted; QC strip never shows green when a source is unreadable; no comp, phone or email string anywhere in output (grep test) | q-qa | 1 day, rolling |

**Can ship next week (Mon 16 to Fri 20 Nov), nothing needing a new yes:** A, B and C (dotted lines and hand-offs), and D with the first real WIP on Friday 20 Nov. These touch only Eden's own Command Center database and files, which Radar already writes from a ticket Kev opened.

**Three things to ship first:**
1. Ticket fields plus the dotted line on the Floor (A and B).
2. The Friday WIP card data and view, with Jenny, Scout and Marlowe as the pilot (D).
3. The QC strip's open-tickets and open-team-requests rows, the two Kev named as hard rules (part of E, no new source needed).

# Needs Kev's yes

1. Recurring messages from Radar to his own Duet session on the slot list above (a send, so a standing approval for this exact list, or a QC touch each time).
2. Making any shipped artifact shareable (publishing), per artifact.
3. Paying nothing: no spend in this spec. If Duet graphics need a paid image service, that is a separate request.
4. The PTC definition for the strip: I read it as candidates presented to a client with no response (Crelate stage plus age), and "client needs" as client asks with no owner. Confirm, and name the response window.
5. Whether Marlowe (family) may appear on a pairing line at all on the Floor, or only in Kev's private view; the spec blanks the title under Screen-share either way.
6. Whether the WIP replaces the 3:50pm week review input or sits beside it.

# Risks

- One 330 KB page, so page work is serial; the panel files make it manageable.
- Hourly runner latency: a collaborative ticket takes at least two runs (pieces, then assembly). A 15-minute ticket routine (open question since the architecture note) would halve it.
- Duet limits are assumed, not proven. Step F does not start until a single test card has been sent with Kev's yes.
