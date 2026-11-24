# The Carmel Tracker

- URL: https://claude.ai/artifact/GTjZyx5ZNEn7hnEoZXbPhH (private to Kev; published 19 Nov 2026; sharing unchanged)
- Source: `projects/carmel/tracker/index.html` (no data in the page; every row is in the database)
- Capabilities: `db` with one rule (root read and write at `interact`, so a view-only share sees nothing) and `user`
- Collections: `roles`, `candidates`, `people`, `comms`, `steps`, `eod` (fields in `skills/tracker-keeping.md`)
- Seeded 19 Nov 2026: 10 roles, 24 next steps, 22 people rows, 9 comms rows, 11 EOD lines. `candidates` left empty: Kev or the agent adds them with the page's form or `ArtifactData`.
- Sharing with Michael or Noah: Kev's call, from the page's Share menu, at Contributor (they can then write). The Client view toggle hides fee basis and internal notes; never shared with a hiring manager without Kev's yes.

## 24 Nov 2026 (v8): pipeline, process, scorecards, HA review
- New tabs: **Pipeline** (Needs scheduling table from `sched_status`/`sched_with`/`availability`/`replied_at`/`draft_waiting` on candidates, a deadline banner from a role's `sched_deadline` + `sched_deadline_note`, then a depth chart by stage per role), **Process** (role `process_steps`, `interviewers`, `assessment`, stage counts), **Scorecards** (role `scorecard_url` plus collection `scorecards`: candidate_id, role_id, scorer, date, total, max, recommendation Advance/Hold/Decline/null, doc_url, notes), **HA review** (collection `reviews`: candidate_id, role_id, ha, round, date, decision Pending/Advance/Hold/Decline, feedback, next_step, source; candidates at HM 1/HM 2/Final with no decided review show as "feedback owed").
- `sched_status` values: Needs reply, Needs time, Proposed, Booked, Done, Blocked.
- A&D: 10 candidates loaded 24 Nov, all sched_with Elaine; deadline 8 Dec (Elaine out from 9 Dec; Stephanie out 25 Nov to 4 Dec).
