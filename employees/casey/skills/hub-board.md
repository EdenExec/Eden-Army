# Hub board: the records you keep and how you write them

The Team Hub is https://claude.ai/artifact/7kccfScydYDcWoXfeeE8q6. You, Radar, Scout and Q write it with `ArtifactData`; editors also write job orders from the board, and recruiters answer asks in `team_asks` (`skills/team-asks.md`). Everyone Kev shares the Hub with can read every client in it, so a row holds names, role and status only. Full brief: `projects/team-hub/brief.md`.

## Collections

| Path | One document is | Fields you use |
|---|---|---|
| `jobs/{id}` | One job order | client, client_slug, discreet, role, location, status, opened, rank, leads [{title, url, count, built}], team [{recruiter, since, role_on_job, note}], condition, board_note, depth [{client_slug, chart, seat}], scout {requested, at, status}, updated, source |
| `clients/{slug}` | A client folder | name, sort, updated |
| `clients/{slug}/depth/{id}` | One depth chart | title, sort, source, updated, seats [{seat, loc, comments [{at, text}], people [{name, status, note, by}]}] |
| `clients/{slug}/notes/{id}` | One project note | title, status (active, waiting, done), owner, decision, next [..], links [{title, url}], updated |
| `clients/{slug}/meetings/{id}` | One client meeting | date, title, attendees (names and roles), notes, decisions, asks, next [..], source, updated |
| `clients/{slug}/leads/{id}` | One lead list (Scout's) | read only for you |
| `scout_queue/{id}` | A JO added on the board, waiting for Scout | job_id, client_slug, role, location, at, by, status (queued, briefed), ticket, briefed_at |

Field shapes in the live Hub can run ahead of this file: read a document before you write it and keep any field you do not recognise.

## Job order fields (as of 23 Oct 2026)

| Field | Values and rule |
|---|---|
| `id` | Kebab-case: `<client_slug>-<role>-<place>` (`triton-pm-south-beach`, `pb-south-bench-pm-wpb`). Old `discreet-` ids stay as they are; new rows use the client slug |
| `status` | `active`, `on-hold`, `filled`, `closed`, `killed`. Killed means Kev pulled it; the reason goes in `board_note`. Never delete a row |
| `board_note` | Kev's latest instruction on the JO in one or two sentences, close to his words ("Review Matt Paul for this."). Replace it when Kev gives a newer one; the old one goes in the intake record, not the row |
| `condition` | What has to be true for the JO to run ("Starts when Pruter signs the fee agreement"; "Pushed out to January") |
| `team` | One entry per recruiter: `recruiter` (first name), `since` (ISO date they started), `role_on_job` (lead, co-lead, backup, standby), `note`. A rotation is a new entry with `since` = the change date; the old entry comes off in the same write. Kev names recruiters; you never pick one |
| `depth` | Links the JO to depth-chart seats: `{client_slug, chart, seat}` with `seat` copied exactly from the chart's `seats[].seat` |
| `scout` | `{requested: true, at: <ISO>, status: "queued" | "briefed" | "landed"}`. Landed when Scout's sheet is linked in `leads` |
| `rank` | Kev's priority, 1 is hottest. Only change it when Kev ranks |
| `source`, `updated` | Every write: where it came from and today's date |

## Depth chart people

Status uses Crelate stage words: blank (to review), Pending PTC, PTC, Submitted, Interview, Offer, Placed, On hold, Out. A new name goes under the seat with `by` (the recruiter or Kev), `status` and a dated note ("Kev, 23 Oct: review Betsy for construction admin."). A move is a status change plus a dated note; a drop is "Out" with the reason. Nobody is removed. Seat order and names follow the chart Kev prints for the wall (`employees/radar/skills/standing-rules.md`, depth charts, 8 Oct).

## Named and referral-only clients

- **Baker is named; no client is discreet (Kev, 5 and 13 Nov 2026).** "Just say Baker." Baker Concrete and the INL work are written by name on every internal surface (Hub, tickets, briefs to Scout, drafts, team email): `client: "Baker Concrete"`, `client_slug: "baker"`. Never write "Client · discreet" or "discreet client"; `discreet` is false on every row. One client still never sees another client's name, and partner-facing JO descriptions stay blind.
- Moss is referral-only: a Moss JO can sit on the board, but Scout's brief says "referral asks only" and Moss people are never dial targets.
- Prometheus (Bay Area real-estate investor, `prometheus`) and Promethean (NYC and Miami GC, sister to PB South, `promethean`) are different clients. Never merge them.

## How you write

1. **Read first.** `ArtifactData list` the collections you will touch with an `out_dir` in your scratchpad (for example `jobs`, `clients/<slug>/depth`), and note each document's `version`.
2. **Plan the writes** as a table (doc, op, fields changed, source) before sending anything. New documents are `set` with no pin; existing ones are `update` with only the changed fields and `if_version`.
3. **One batch** of up to 50 writes, every existing document pinned. More than 50: split by client.
4. **A failed pin** means someone else wrote the row since your read. Re-read that document, redo the change on top of theirs, and send again. Never overwrite.
5. **Never `delete`.** Not a JO, not a person, not a seat. If Kev asks to remove something, set the status (killed, Out) and say so in the read-back.
6. **Save the record.** Every intake or board pass writes a dated file in the repo (`projects/team-hub/jo-meetings/<YYYY-MM-DD>-<what>.md`): what changed, row by row, and what is open for Kev. Names, roles and status only. Never commit; Radar commits.
