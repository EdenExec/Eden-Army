# Hourly inbox sweep

Runs weekdays, every hour from 7am to 6pm Pacific. Silent: no message to Kev unless an interrupt rule fires. Goal: Superhuman inbox at zero by the check-out with nothing lost.

## Steps

0. **Eden Office first, every sweep.** Run the four Office steps in "Eden Office" below (tickets, actions, desk chats, sync) before the inbox. Never defer them to the check-out.

1. **Radar's own mail first (Kev, 21 Oct 2026: "Radar email was not working").** radar@edenexec.com is an alias into Kev's mailbox, so Gmail files a message Kev sends to it from kev@edenexec.com under **Sent only, never the inbox**. Every sweep, run `list_threads` with `to: ["radar@edenexec.com"]` and `start_date` = today (no label filter, so Sent is included). Any message from kev@edenexec.com or kdt.williams@gmail.com is a direct instruction from Kev: act on it this sweep like a chat message (call lists, reach-outs, tickets, ledger rows), then reply nothing and label the thread `Radar/Handled`. Mail from anyone else to radar@ (Nida's nightly note, lead sheets) is intake: file it per the leads pipeline and the BPO SOP. Skip threads already labelled `Radar/Handled`.
2. **Pull.** `list_threads` with `labels: ["INBOX"]`, newest first, up to 50, plus the Important split explicitly. Skip threads already handled this day (Radar labels them, see step 5).
3. **Classify each thread** into one action:

| Class | Examples | Action at trust stage 1 |
|---|---|---|
| Interrupt | See `interrupt-rules.md` | Push now, draft the reply, ledger row Lane Mine |
| Ask of Kev | Someone needs a reply, a decision or a file | Draft the reply in Kev's voice (`create_or_update_draft` with `instructions`, type `reply`), ledger row: Lane Batch if it is a small decision, Lane Mine if only Kev can write it. Leave the thread in the inbox. |
| Waiting | Kev is owed a reply | `create_or_update_reminder` with `mark_done: false`, remind in 2 business days (clients, candidates) or 5 (vendors). Ledger row Lane Waiting on. |
| Bill or finance | Finance split, Taxes and Bills label, invoices, statements | Ledger row Lane Batch, Bill rate Admin, Due ten days before the stated due date, Owner Kev or Joel. Never pay, never reply. Leave in the inbox. Receivables work (building, sending or chasing an invoice): read `employees/radar/skills/invoicing.md` in the repo first. |
| Family | Family calendar, school, Ally, kids, church | Ledger row Lane Mine or Scheduled, Bill rate Family. Never archive. |
| Team | Recruiters, Nida, Nick, Joel | Ledger row only if it asks Kev something. Otherwise leave it. |
| Noise | Newsletters, notifications, marketing, receipts already filed, Coaching Briefs older than today, calendar acceptances | Archive (`update_thread`, remove INBOX). Count it. |

4. **Draft, never send. Jenny writes (Kev, 21 Oct 2026).** Written comms with clients, candidates, vendors and the public are Jenny's: follow `employees/host/skills/inbox-management.md` and `comms-voice.md` for every draft, and label her threads `Jenny/Swept`. Radar keeps classification for the ledger, interrupts, strategy and the team. Each draft becomes a `send_message` QC item carrying the `draft` field. Stage 1 drafts only. Stage 2 and 3 rules are in `trust-ramp.md`. A draft must read as Kev: short, direct, warm, no filler. Use `instructions`, not `body`, so the writer keeps his style.
5. **Mark.** Apply a Superhuman label `Radar/Swept` to every thread handled so the next sweep skips it. Ledger rows carry Source = "<subject> from <sender>, <date>".
6. **Log.** Append one line to the sweep log row in the ledger ("Radar sweep · <date>", Category Other, Lane Scheduled, Owner Radar): hour, archived count, drafts written, rows created, interrupts sent. One row per day, updated each hour, Status Done at 6pm.

## Never

- Never archive anything from a client, a candidate in process, family, finance or legal.
- Never reply to a thread that mentions money, offers, compensation, legal or family.
- Never push twice for the same thread.

## Admin split (Kev, 8 October 2026)

admin@edenexec.com auto-forwards into kev@ (and joel@) and lands in a Superhuman split called Admin (`deliveredto:admin@edenexec.com OR to:admin@edenexec.com`). Sweep it as its own class every hour: vendor notices, portal and compliance mail, W-9 and banking requests, state agency mail (SAW, DOR, L&I, ESD) and invoices file to the ledger with Category Admin / Emma Gap and Owner Joel where it is his; receipts and notifications already filed are noise and archive, and obvious junk is unsubscribed on sight (Kev's standing yes, 8 October 2026), logged on the sweep row; anything with money, legal or a signature goes to the Batch, never answered. Replies to Admin threads are drafted from the admin@ send-as alias, not from kev@. The personal Gmail (kdt.williams@gmail.com, on the Gmail connector) is Personal and family only: file, never archive.

## The hit list (11 October 2026)

At the end of every weekday sweep, follow `hit-list.md`: act on the Answers in "Radar · What I need from Kev", rebuild the Work and Home lists, rewrite the doc, and send "Radar wants to talk" when its threshold is met.

## Call-backs (Kev, 11 October 2026)

Kev: "All incoming calls in CloudTalk should just route to one number, the Google Voice line. Then you could watch missed calls and voicemails, run them against our Crelate contacts and leads, and rank and prioritize my call backs." Every weekday sweep:

1. Read new Google Voice voicemail and missed-call emails (voicemail transcripts arrive by email once Kev turns that on in Google Voice settings) in the inbox they land in.
2. Match each caller's number and name against Crelate (API key or Nida's weekly contact export), Superhuman contacts and signatures, the lead sheets and the ledger. Unknown numbers stay "unknown", never guessed.
3. Rank: clients with an open job order and candidates in process (offer, interview, submittal) first, then warm leads, then new names, then vendors and spam. One line each: who, company, what they want (from the transcript), why it ranks there, and the number to dial.
4. Put the ranked call-backs at the top of the hit list's Work section and on the paper; spam and robocalls are dropped and counted, not listed.

## Eden Office (Kev, 21 October 2026)

Office: https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW (brief: `projects/virtual-office/brief.md`).

Kev, 21 Oct: every ready draft gets a Superhuman link, so he can send it from Superhuman.
- **Any agent's `send_message` QC item:** Radar creates the Superhuman draft (`create_or_update_draft`, recipients filled when known).
- Then Radar writes `"draft": {"app": "superhuman", "id": "<draft_id>", "subject": "<subject>"}` onto the QC item, and the Office shows a "Send in Superhuman" button.
- Radar never sends the draft itself.

**Every sweep runs these Office steps first, before the inbox, and never skips them** (Kev, 21 Oct 2026: "I see open tickets for the agents to be working on but don't see them taking action"). The 21 Oct afternoon sweeps deferred them "to the check-out" and 15 tickets sat all day; that is not allowed. An Office ticket is Kev handing work across the desk: it beats inbox triage. If the hour runs short, cut the inbox, not the tickets.

1. **Tickets.** `ArtifactData list tickets`. Any ticket still `open` gets worked this sweep:
   - First close exact duplicates (same agent, same ask, minutes apart) as `done` with `result.summary` "Duplicate of <id>".
   - Set the rest to `picked` with `pickedAt` (pin `if_version`) so the desk lights green on the floor.
   - Run each agent with the Agent tool (`subagent_type` = the ticket's agent, in the background, all at once). Tell it the ticket id and ask, to write files without committing, and to update its `memory/live/now.json`. If the Agent tool is not available in the routine, do the work as Radar from that agent's playbooks.
   - A ticket for Radar is Radar's own work this sweep.
   - Write back `done` with `result {summary, link}` when the agent returns. If the work would send, spend or publish, set it to `gated` with `proposed {kind, exact}` and the QC id. Drafts for Kev go into Superhuman Drafts and the link goes in `result.link`. A ticket is delegation, never approval.
   - A ticket `picked` for more than 2 hours with no result gets re-run or a `result.summary` naming what blocks it.
   - **Upload tickets:** a ticket with `attachments: [{asset, type, name}]` carries a photo, PDF, CSV or text file Kev uploaded. A spreadsheet arrives as one CSV per sheet. Fetch each one with `Artifact read` (the Office url, `path` = the asset id), Read the saved image, then do the ask.
   - **Blank-note photos:** with no ask beyond "make sense of it", Radar decides where the photo belongs: a ledger row, an agent's ticket, the Hub (names and roles only), or a note to Kev.
2. **Actions.** `ArtifactData list actions` where `applied` is false. Apply each one Kev tapped:
   - **`done` means Kev did it himself** (Kev, 23 Oct 2026: "I book a flight then say done, it means I executed the task, it's done, move on"). Close the source item and make sure no agent carries it out: cancel any open or gated ticket for it (`done`, result "Kev handled it himself, Office <date>"), and never send, book, buy or publish on a `done` tap. Done is never approval. A QC item becomes `npm run qc -- reject <id> "handled by Kev outside the queue (Office, <date>)"`; never approve. If that command is denied (it was on 21 Oct for spend items), leave the QC item for Kev to close on the Eden Desk and say so in the sweep log. A ledger row becomes Status Done.
   - **`approve`** is Kev's yes, given with two taps (Approve, then "Confirm: <exact action>"; Kev, 23 Oct 2026). Save the action doc straight from the Office (`ArtifactData get actions/<key>` with `out_dir`) and run `npm run qc -- office-approve <qc id> --action <that file>`. It records the approval only if the tap is Kev's, confirmed, for that exact QC item, and the item has not changed since (fingerprint). If it passes, carry out exactly that action once, close the ticket or item, and log it with the action key and time. If it is refused, do nothing: leave the item pending, mark the action applied with the refusal in `note`, and raise one `needsKev` item that names the reason (most often "the action changed after you approved; approve the new version"). **Never write an `approve` action yourself**, never edit one, and never run office-approve on a file you built rather than saved from the Office.
   - **`followup`:** a ledger row with Lane Waiting on, Owner Kev and a due date 7 days out, Source "Eden Office follow-up". When the action carries a `note` (Kev typed it on the desk line, 29 Oct), it is his answer: for a `ticket-<id>-blocked` or `-gated` key, set that ticket back to `open` with the note appended to its `ask` as "Kev, <date>: <note>" so the agent acts on it next pass; put the note in the ledger row's item too.
   - **`snooze`:** leave it alone. The page hides the item until `until`.
   - Then `update` the action with `applied: true` (pin `if_version`).
3. **Desk chats.** For each agent, `ArtifactData query chats/<agent>/messages` where `filed` is false. File every "Direction:" line Kev agreed to:
   - **Most agents:** `npm run memory -- add <agent> "<date>: <direction>"`.
   - **Hale, Jethro and Barny:** that agent's private Notion page, never the repo.
   - Then `update` each message with `filed: true`.
   A "Ticket:" line Kev did not turn into a ticket stays a suggestion.
4. **Sync.** Save the tickets (`ArtifactData list tickets` with `out_dir`), join them into one JSON array, and run `npm run office -- sync --tickets <that file>` so each desk counts its open tickets and lights green while one is picked. Then push `.office-outbox/batch-*.json` with one `batch`.
5. **Lead sheets (Kev, 21 Oct 2026).** Open the Lead Log in the Drive master folder (1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9). Any sheet with "In Crelate" dated and "Moved" blank: move it with Drive `update_file` `parentId=1ToXMnrgReSVHyTS24PT4WEh498VDa8Kk` (Uploaded to Crelate), date Moved in the Lead Log, then `npm run leads -- stage-set <file> crelate|moved` so the repo index agrees. Never move a sheet that is not dated In Crelate.

## New JO catch (Kev, 24 Oct 2026; via Casey, 25 Oct)

Every weekday sweep: read Crelate `jobs` created since the last sweep in the Retained, Top Priority, Go Now and Typical columns (read-only, `jobs?statuses=...&fields=Id,JobNum,Name,CreatedOn,Owners`). Any new JO: ticket **Scout** (lead gen for the JO) and **Casey** (place it on the board, depth chart, Must Dos). Write the client as Crelate stores it (Baker is "Baker"). Never create the ticket twice for the same JobNum.
