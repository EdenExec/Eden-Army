- 2026-10-14: 2026-10-13 (Kev): mobile and direct numbers from Crelate MAY go on internal recruiter lead sheets (Eden-only Drive folders shared with named recruiters, never client-facing, never the hub, never shared outside Eden). 'If our job is to eliminate friction for the recruiter, include the mobile phone numbers.'

## Wednesday Headhunter Training (Kev, 14 Oct 2026)
- Tuesdays 5pm the Eden Recruiter Training project (a separate Claude project Radar can't see) drops a draft in Kev's Gmail. Same format every week: Note taker; Ice breaker (being a better conversationalist: a case study from our work or a role-play question); recap of the last 2-3 weeks (what we have put into action); two concepts, one construction and one recruiting; lightning-round check-out (each person's key takeaways); the note taker uploads the notes to the training project.
- Kev fills in the draft. Radar picks it up in the Tuesday night stand-up, builds the training pages into Wednesday's paper and a separate Letter PDF for the team, and never sends the draft.

## Crelate: loading leads into a job (14 Oct 2026)
- API v3: `POST jobs/{jobId}/contacts?contact_ids=<comma-separated ids>` with body `{"statusName":"Dawg Pound"}` (the lead-pool stage; stages from `GET workflowstatuses`). Verify with `GET jobs/{jobId}/contacts/history`. Spec: `api3/swagger/v3/swagger.json`.
- Only on Kev's say-so per job (a write to Crelate). First run: 344 Miami/Broward PMs into "Triton Construction Company - PM and Sr. PM - Miami" (job 8868), client-staff rows (Baker, Moss, Hoffman) left out.
- 2026-10-15: 2026-10-15 (Kev): Field Engineer seats (PB South WPB and anywhere else): GC side or sub side are both fine. Never write 'not from a GC' as a requirement again; lead lists and depth charts take both.
- 2026-10-15: 2026-10-15 (Kev): PB South 'not in GC' meant the seat's salary is not in general conditions (PB South funds it elsewhere), NOT a candidate filter. GC candidates are wanted for those seats (Garage Super, Field Engineers). Never write 'not in GC' on the hub again.
- 2026-10-16: 2026-10-15 (Kev): 'I need to do less and lift heavy tasks up.' Radar pre-builds the heavy lifts the night before (submittal drafts, call prep, assignment tables) so Kev only reviews and sends. Default to doing the work, not listing it.
- 2026-10-19: Kev's answers to the Sun 10/18 list ("Yes to all"):
  - Triton handoff: Nick on the client, Evan on sourcing.
  - Nida's leads: a radar@edenexec.com alias into Kev's mailbox, auto-labeled. Kev sets it up.
  - PB South job fair: go, on the plan as written (Thu Nov 19, WPB, $3,750). Host drafts the note to Vinny for Kev to send.
  - Decision log links go on both the Eden Daily and the Eden Desk.
  - VMG: Andrew works it, 3 resumes to Peter by Fri.
  - Spends: Jabra, ElevenLabs and Supabase approved in chat. They still clear QC by Kev's own approve.
  - Scheduled bots: Q's CloudTalk nightly first, then Scout's nightly buckets.
  - VMG seats: Project Executive (Baltimore/DC), not Managing Director. Also VDC Manager (Reston), Supers, PMs and PEs.
  - Lead sheets: leave Owner blank with a Suggested owner column. Kev assigns at the JO meeting.
  - Kev wants the Eden Day Board up on his computer every morning.
- 2026-10-19: Client map, from Kev:
  - **Prometheus vs Promethean.** These are two different companies. Never merge them.
    - Prometheus is a real estate investment firm in the Bay Area (Sr CM retail TI, Sr PM seat).
    - Promethean is a GC in NYC and Miami and a sister company to PB South.
  - **Bobby H. owns the Promethean / PB South structure.** He stands up each entity with partners:
    - Jeff and Vinny run PB South in WPB.
    - Garreth S. runs Miami interiors.
    - Jeff is helping Bobby build the NYC healthcare book, though he lives in Florida now.
    - The NYC occupied-healthcare JO is Promethean.
  - **INL safety JO.** The client is Baker, the concrete contractor on the job. Baker is named outright (Kev, 13 Nov 2026: no client is discreet). The seat needs NQA-1 certified safety people from nuclear projects, structural or GC side.
  - **Megawatt Quincy** is a traveling data center PM role.
  - **Nicknames:** "Juicy" is Andrew.
  - **Tim Norton** is going for the Prometheus Sr PM seat. If he doesn't land it, Noah takes Megawatt San Jose Sr PM/PX and Promethean NYC, and Andrew takes the Triton role (to confirm).
  - **No owner yet**, which Kev is fine with: Moss Interior Super, Moss Precon, Hoffman Amarillo low voltage.
  - **Job orders on the hub.** The hub gets a Job Orders folder (active JOs, lead sheets, who's on what). Flag any recruiter on one JO past 14 days so Kev can rotate.
- 2026-10-20: **The Seven Pillars are Eden's core values for 2026**, replacing the four values (Stewardship, Curiosity, Improvement, Dedication) in hiring and onboarding docs. Kev asked for new "2026 v2" versions with the originals kept: New Hire Flow v2 is doc 1DqC3t9asjWF8L4vR7LJQgq-zk6PZp4ObgzZ5bgduIP0.
- 2026-10-20: **Kyle Cockell joins as a recruiter in Boise.** He already has recruiting experience, so run him through the Eden workflow on an accelerated ramp with speed checkpoints, not the junior trainee track. Culture vetting (Enneagram, Kolbe, Working Genius, interview, references) comes before he starts.

- **Mountain time (Kev, 13 Nov 2026):** "everything will run on MT time now." Schedules, windows and day boundaries are America/Boise. Q moved the Day Board weather routine and set the Round Table Crelate pulls and the CloudTalk dials refresh in MT. Still on Pacific and not changed by Q: the Friday 9:55 PT Round Table pull, the ticket runner and Hawk's, Dean's and the team-watch routines. Radar: confirm with Kev which of those should move.
- **Round Table freshness (Kev, 13 Nov 2026):** Crelate board pulls Mon to Thu 5:08, 12:08, 15:08, 22:08 MT and Friday 5:08, 12:08, 15:08 (trig_01XcZWno2PBTayqAtetPXXiY, trig_01RkbwYPyLvPJz6X7GG9vA6Z). CloudTalk dials refresh Mon to Thu 5:14, 12:14, 17:14 MT and Friday 5:14, 12:14, 15:14 (trig_01RL9DfefxS3dqUoXBfPV2mv, trig_015gB8FiLjniotbRExTftuHQ), written to Command Center meta/phones and Round Table phones/current. Nothing Friday night or Saturday.
- **Future dates from calls go to Hawk (Kev, 13 Nov 2026):** whenever Kev dumps a call transcript or note, pull out every future date or window (a client visit in December, a PB South trip in December, a job fair, a deadline) and push it to Hawk as a Command Center ticket (agent lookahead, lever dates), with the date or window, who, where, confidence and source; Hawk tracks the mid range and sends Jenny a weekly 2/4/6-week runway in Marlowe's monthly block. Playbook: `skills/future-dates-to-hawk.md`. Ask Kev for the day when only a window was said, at the check-out.
