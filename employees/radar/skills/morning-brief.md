# The 5:30am brief

Runs weekdays and Sunday at 5:30am Pacific (never Saturday). Delivery only: the paper was built last night by Stand Up Tomorrow (or the Sunday Edition build). Do not re-plan the day, rebuild the paper or add calendar events.

## Steps

1. **Find today's paper.** Drive folder "The Eden Daily" (id `1DvqQIdEi0gt9AEImtR20_T3HdQAa8AaN`): Google Doc "Eden Daily delivered - <Day> <Mon> <D>". Read it. If missing, say so plainly in the brief and include today's calendar as a plain list so Kev is not blind.
2. **Overnight check, light touch.** Superhuman `list_threads` since 8pm last night, Important split first. Only things that change today's plan: a client or candidate reply, a cancelled or moved interview, a family calendar change. Most mornings there are none. Never list routine mail.
3. **Open with the journal.** First line of the brief is the journaling prompt, then the day's chapter and one verse from the paper. Kev journals before he reads the paper. Keep the prompt to one sentence tied to the chapter or to yesterday's check-out (a win to give thanks for, a miss to hand back).
4. **Then the day.** Top three Must-Hits from the Doc. The one-line count ("TWO POWER HOURS · ONE INTERVIEW"). An OVERNIGHT strip only if step 2 found something, at most three one-line items.
5. **Rotate? (job orders, Kev 19 Oct 2026: "If someone stays on a job more than 2 weeks, we need to be alerted").** `ArtifactData` `query` on the team hub (`https://claude.ai/artifact/7kccfScydYDcWoXfeeE8q6`), collection `jobs`, `where` status == "active". For each `team` entry whose `role_on_job` is not "standby" and whose `since` is more than 14 days before today, write one line under a **ROTATE? · KEV DECIDES** strip: "<recruiter> · <client> · <role> · day <n> · keep or rotate?". Use the row's `client` exactly as stored (Baker is "Baker"; no client is discreet since 13 Nov 2026). No assignment past 14 days: leave the strip out. Read only: Radar changes a `team` only after Kev answers (a new entry with `since` = the change date, written with `if_version`).
6. **Deliver twice.** One `PushNotification` under 200 characters: "Radar · Journal first. Then: <must-hit 1>. Paper is in last night's run." Then one email via Superhuman `create_or_update_draft` + `send_draft` to kev@edenexec.com only (sending to Kev himself is allowed at every trust stage), subject "The Eden Daily · <Weekday, Mon D>", Eden style: white, Montserrat, black lettering, no emoji. Body order: journal prompt, chapter and verse, must-hits, count, overnight strip, Rotate? strip (only when step 5 found one), one line saying where the paper is.

## Rubric (self-check before sending)

- Journal prompt is first and is one sentence.
- Nothing in the brief is invented; every must-hit is in the Doc or on the calendar.
- Under 120 words excluding the verse and the Rotate? strip.
- Every Rotate? line is a `jobs` row past 14 days today; standby entries are not listed; each client is named as stored.
