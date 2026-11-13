# Board keeping (daily, Monday to Friday)

Once each weekday morning (and again whenever Kev adds a JO on the board), you keep the board honest and post one short note to Kev. The Sabbath (Friday sunset to Saturday sunset) holds: nothing runs. Sunday: nothing unless a ticket asks. Pacific time.

## Order of the pass

1. **Read.** `ArtifactData list` on `jobs`, `scout_queue` and the depth charts of every client with an active JO (`clients/<slug>/depth`), into your scratchpad with versions noted. Read `projects/leads/index.json` for when each JO's newest lead sheet landed.
2. **Work the Scout queue** (below). Always first: a queued JO is a JO with nobody looking for names.
3. **Run the flags** (below) over every `active` JO.
4. **Write.** Board writes the pass needs (scout status, queue status, `updated` dates only where you changed something) in one pinned `batch`. Flags are not written onto rows; they go in the post.
5. **Post** one note to Kev through Radar (format below), save it as `projects/team-hub/board/<YYYY-MM-DD>.md`, and update `memory/live/now.json`.

## Scout queue

A JO Kev adds on the board writes `scout_queue/{id}` with status `queued`; your voice-note intake writes one too. For each `queued` document, oldest first:

1. Read the JO row and the depth chart its `depth` links point to. A JO with no `depth` link: find the seat on that client's chart, or note "no seat yet".
2. Check the client rules: name the client as stored (Baker is "Baker Concrete"; no client is discreet since 13 Nov 2026), Moss (referral asks only), no fee agreement yet (do not brief; flag "waiting on fee agreement" and leave the queue item `queued` with a note).
3. Write the brief to `projects/team-hub/scout-briefs/<YYYY-MM-DD>-<job-id>.md`:

   | Line | What |
   |---|---|
   | JO | id, client (by name), role, location, rank, status |
   | Kev's words | board_note and condition, verbatim |
   | Seat | the depth chart and seat, who is already under it by name and stage (so Scout does not re-pull them) |
   | Owner | the lead recruiter, or "no owner yet" |
   | Existing lists | `leads` on the row and any sheet in `projects/leads/index.json` for this client and role |
   | Ask | "A lead list for this JO per `employees/scout/skills/lead-list.md`; land it by <date, never a Saturday>" |

4. File a Command Center ticket for Scout (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW, collection `tickets`): `{agent: "scout", ask: "<one sentence: lead list for <JO>, brief at <path>>", priority: "today" (rank 1 to 5) or "week", status: "open", owner: "kev", createdBy: "casey", lever: "board", createdAt, updatedAt}`, id `t-<YYYYMMDDHHMM>-<4 chars>`. Every hand-off goes on the agent's feed (`employees/radar/skills/standing-rules.md`). If the Command Center write is refused, put the brief path in your hand-off and Radar files the ticket.
5. Set the queue item `status: "briefed"`, `ticket: <id>`, `briefed_at: <ISO>`, and the JO's `scout.status: "briefed"`. When Scout's sheet is linked in the JO's `leads`, set `scout.status: "landed"`.

## Flags

| Flag | Test | What the post says |
|---|---|---|
| No owner | `team` empty, or only `standby` entries | "No owner: <JO>. Who leads it?" |
| No leads | `leads` empty and no Scout request briefed | "No leads: <JO>. Scout briefed today" (and brief it) |
| No depth movement | No person on the JO's linked seats has a dated note or status change in 7 days, or the JO has no seat at all | "Quiet 7 days: <JO>, <seat>, last move <date>" |
| Rotate | A `lead`, `co-lead` or `backup` team entry more than 14 days past `since` (standby entries are never flagged; the Hub's existing rule) | "14+ days, rotate? <recruiter> on <JO> since <date>" |
| Stale | `updated` more than 14 days ago | "Stale: <JO>, last updated <date>. Check with <owner>" |
| Waiting on a fee agreement | `condition` or `board_note` says fee agreement, or the client is not yet in the client list (`employees/scout/memory/seed/clients.md`) | "Waiting on fee agreement: <client>. Docket has the review" |
| On hold past its date | `on-hold` with a date in `condition` that has passed | "Back on? <JO> was held until <date>" |

Flags are for Kev's eyes: you never change an owner, rank or status because a flag fired. Killed, filled and closed JOs are not flagged.

## The post (one short note to Kev)

At most ten lines, result first, through Radar's hand-off (Radar carries it onto the paper and the Command Center). Example only; the counts and names are illustrative:

> Board, Tue 3 Nov: 31 active, 4 on hold, 2 killed this week. Scout briefed on 3 (bench PM WPB first).
> Needs an owner (3): bench PM WPB, South Beach PM, Megawatt Reno super.
> Rotate? (2): Noah on Prometheus Sr PM since 19 Oct; Evan on Triton MEP since 19 Oct.
> Quiet 7 days (2): VMG supers DC; Hoffman Amarillo LV supers.
> Waiting on fee agreement: Pruter.

Counts are from this pass, never estimated. Clients by name. No pay, phones or emails.

## Never

- Never brief Scout on Moss as dial targets, or on a JO whose client has not signed a fee agreement.
- Never delete a queue item or a row; never run on Saturday; never message a recruiter.
