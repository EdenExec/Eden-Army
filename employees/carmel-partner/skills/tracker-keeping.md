# Tracker keeping

You own the Carmel Tracker: a private claude.ai artifact (URL in `memory/live/tracker.md`), read and written with `ArtifactData`. Source of the page: `projects/carmel/tracker/index.html`. The page holds no data; every row lives in its database.

## Collections

| Collection | One document per | Key fields |
|---|---|---|
| `roles` | Covered role (Schedule 1, plus the Marina Shores PE and the IR analyst) | title, location, hiring_manager, scheduler, stage, next_step, owner (Kev, Michael, Noah or Carmel), fee_basis, fee_source, last_touch, last_touch_source, schedule1, intake, source |
| `candidates` | Candidate on a role (added by Kev or by you from Kev's or Carmel's notes) | role_id, name, stage, source_type, next_step, next_due, last_touch, fee_basis, notes, source |
| `people` | Carmel person in the hiring process | name, title, office, process_role, roles, assistant, habits, prediction, notes, source |
| `comms` | Open or recently closed Carmel email thread | subject (no candidate name), thread_id, with, owes (eden or carmel), owner, opened_at, closed_at, status, note, source |
| `steps` | Next step | text, owner, due, done, role_id, source |
| `eod` | Workstream line for one day (id `<YYYY-MM-DD>-<workstream>`) | date, workstream, status (green, amber, red), line, source |

## Rules

- **Read before write.** `ArtifactData list` on the collection, note each document's `version`, then one `batch` with `if_version` on every existing document. A failed pin means someone else (Kev, Michael) changed it: re-read and redo that row, never force.
- **Never delete.** A role that ends is stage `Closed` or `Filled`; a candidate who drops is stage `Out` with a note; a done step is `done: true`. A delete is a QC item and you do not propose it.
- **Every number and date carries its source** in the row's `source` field (or `fee_source`, `last_touch_source`): "Call sheet 19 Nov", "Bob Robinson email 19 Nov 11:09am MT", "Agreement draft 6.1". The page shows it under the value.
- **Times are ISO with a zone** (`2026-11-19T19:31:49Z`). The page shows them in the viewer's local time.
- **Candidate rows** carry no phone, email, age, pay history or address. Pay expectations go in `notes` only when the candidate stated them, labelled "expectation".
- **Fee basis** comes from `memory/seed/carmel-account.md` and changes only when Kev, Brandy's signed paper or Schedule 2 says so; quote which.
- **After every call, email and note:** update the role's `last_touch`, add or close steps, add a comms row for any thread where someone now owes a reply, and update the day's EOD line for that workstream.

## Mirror to the Team Hub

Carmel JOs also sit on Casey's Team Hub board. You do not write the Hub; once a day send Casey (through Radar) one line per Carmel role whose stage changed, so both boards agree.
