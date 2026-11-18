# Friction log

One dated line per slowdown: what stopped, why, what would remove it. Q reads this every Friday.

- 2026-10-21: CloudTalk nightly: Kev approved, but triggers made by an agent carry no connectors in this org, so Kev must create it himself in claude.ai (one-time). Q: find a way around this.
- 2026-10-21: QC approvals need Kev on the Eden Desk card; Office items now link straight to the Desk.
- 2026-10-21: QuickBooks sign-in expired; Tally blocked until Kev reconnects.
- 2026-10-21: EOW lab-report routine has no connectors attached.

- 2026-10-21: Office tickets sat idle all day (15 open, none picked). The Sonnet hourly sweep skipped the Office steps on purpose ("deferred to the check-out"), and the check-out had no ticket step. Fix: the Office steps are now step 0 of every sweep and can't be skipped, the check-out catches anything left over, and the sync takes `--tickets` so desks light green while a ticket is picked. Also: `npm run qc -- reject` for spend items Kev tapped done was denied in a live session; those stay for Kev on the Eden Desk.

- 2026-10-21: radar@edenexec.com "not working". It is an alias into Kev's own mailbox, so Gmail keeps anything Kev sends to it from kev@edenexec.com in Sent only; it never reaches the inbox, and the sweep only read INBOX. Mail from outside (kdt.williams@gmail.com test) does arrive. Fix: sweep step 1 and the stand-up now search `to: radar@edenexec.com` with Sent included. Four of Kev's 21 Oct instructions sat unread until then.

- 2026-10-22: the new ticket runner (trig_011ZgL3VQ6xsdJiLeSCoaA1H) can read the Office and clone the repo but cannot push (403: repo not in the session's authorized sources), because routines Radar creates carry no repo and no connectors. Fallback in ticket-runner.md: deliverables go into result.body. Real fix: Kev re-creates the routine in claude.ai with the repo plus Superhuman, Drive, Docs and Notion attached, then Radar disables this one.
- 2026-10-25 23:47 PT: ticket t-202610260544-4fkx (filed 22:44 PT) sat 60 min because the runner stops at 10pm Pacific; tickets filed after 10pm wait for the next run.
- 2026-10-28: FAIL autopsies. vtmd (filed 18:30 PT, picked 19:45 PT, 75 min): the 18:4x run read its dump before the ticket landed and the next run was an hour later. Fix: re-list open tickets right before pick-up and again as a last look (ticket-runner steps 3 and 9b). qtly (Tally benches, filed 08:22 PT): sat as `waiting` on the QuickBooks sign-in, a status the runner never swept, and 8a was skipped as a short run on every pass until it was run on 27 Oct. Fix: `waiting` older than 60 min is re-checked and set `blocked` with a needsKev alert; 8a runs once the auth alert clears.
- 2026-11-18: Tally's and Docket's subagents get no QuickBooks tools in the runner because their agent files list `mcp__Intuit_QuickBooks__*` and the connector here is `mcp__Intuit-QuickBooks__*` (hyphen). Same likely for Google_Drive, Google_Docs, Superhuman_Mail, Google_Calendar, Zoom_for_Claude on other agents. Workaround today: the runner pulled QuickBooks read-only and handed Tally the raw file. Fix for Q: correct the tool names in `.claude/agents/*.md`.
- 2026-11-18: about 60 Office action rows from 28 Oct to 12 Nov still read applied:false (daily decision taps and pre-"alert-" strip taps). The runner applied the 29 ticket-line taps today; the rest need ledger context. Q or a live Radar session: one reconciliation pass.
