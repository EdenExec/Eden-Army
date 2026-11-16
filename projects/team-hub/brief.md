# Team hub: one place for depth charts, lead lists, project notes and resources (Kev, 12 October 2026)

Direction (Kev, 12 October, replaces the first plan):

- A **fresh standalone artifact**, shared with the whole team. The Eden Desk stays private to Kev and gets no team sections.
- **Segmented by client.** Each client (PB South, Triton, VMG, Prometheus, Hoffman, Pence Kelly, Megawatt and more) is a closed folder. Nothing from one client shows until that client is opened. Reason: when someone screen-shares with Triton, Triton must not see PB South, and VMG must not see Hoffman.
- Landing view is closed folders only: no cross-client totals, counts or names inside.
- Nothing from Kev's coaching, email or finance goes on it. Finance and Tally stay off.
- Private, named sharing only. No public link. Sharing is Kev's yes once he names the roster.

## What the draft does

`projects/team-hub/draft/eden-hub.html`, in Eden's look, with example rows until a database exists.

- Landing: a find box, a Screen-share mode button, closed client folders, and an "Eden playbooks" folder for material that is not client specific.
- Opening a folder replaces the list: only that client shows (depth chart as seat columns, lead lists table, project notes, resources). "All clients" returns.
- **Screen-share mode** hides every client name. You type the client you are presenting to and press Enter; only that client shows, with no way back to the list on screen. A link ending in `#triton` opens that client directly.
- When live, an open folder reads only that client's rows, so another client's data is never loaded into the page while presenting.
- The page only reads. Radar, Scout and Q write rows with `ArtifactData`; nobody edits from the page.

Checked once in a browser at 400px and desktop, light and dark: no sideways scroll, no script errors, and the isolation checks pass (opening Triton shows no PB South or VMG text; screen-share mode shows no client names). Not tested against a live database and not published or shared.

## Database layout (keyed by client)

| Path | One document is | Fields |
|---|---|---|
| `clients/{slug}` | A client folder | name, sort, updated |
| `clients/{slug}/depth/{id}` | One depth chart | title, updated, source, seats [{seat, loc, people [{name, status, note}]}] |
| `clients/{slug}/leads/{id}` | One lead list | pool, project, role, metro, leads, owner, sheet, built |
| `clients/{slug}/notes/{id}` | One project note | title, status (active, waiting, done), owner, decision, next [..], links [{title, url}], updated |
| `clients/{slug}/resources/{id}` | One link | title, kind, url, note, updated |
| `playbooks/{id}` | An Eden-wide resource | title, kind, url, note, updated |
| `jobs/{id}` | One job order, across every client (Job Orders folder) | client, client_slug, discreet (true hides the client; false on every row since 13 Nov 2026, as no client is discreet), role, location, status (active, on-hold, filled, closed, killed), opened, rank, leads [{title, url, count, built}], team [{recruiter, since, role_on_job (lead, co-lead, backup, standby), note}], condition, board_note, depth [{client_slug, chart, seat}], killed_on, filled_on, scout {requested, at, status}, updated, source |
| `scout_queue/{job id}` | A request for Scout to build leads on a JO added from the board | job_id, client, role, location, requested_at, status (queued, briefed, landed; Casey moves it on) |

Slugs are lowercase letters, digits and hyphens (`triton`, `pb-south`).

Declare `capabilities: {db: {rules: [{path: "", read: "view", write: "admin"}]}}` so teammates read and only editors write. A rule can later lock a single client's path if a client ever needs a separate audience. From version 13, `team_asks` is also writable at `interact` (Contributors) so recruiters can answer asks; see Asks for the team below.

## Rules

- Names plus role and status only. No pay, phone, email, home address or EEO data.
- Family and KDTW material stays out. Finance stays out.
- Source and date on every row. A row older than 14 days shows "check with owner".
- Anyone who can open the hub can read every client in it. The folders protect a screen share, not access: do not share with anyone who should not see all clients.

## Job Orders folder (Kev, 19 October 2026)

Kev: "Build a folder just for Job Orders so we always know what Job Orders are active, where their leads are, and who is on what job. If someone stays on a job more than 2 weeks, we need to be alerted to adjust who is on this."

- **An internal Eden folder.** One closed folder titled "Job Orders" (marked "Internal · Eden only") sits after the client folders. Its head shows no client names, counts or totals. It opens only when clicked: no link anchor and no find-box match opens it.
- **Screen-share safe.** It shows every client at once, so it is hidden in Screen-share mode, and turning Screen-share mode on closes it. Its rows load only while it is open and are dropped on close or when a client folder opens, so no other client's data sits in the page during a presentation.
- **What it shows.** A summary (active JOs, assignments past 14 days, JOs with no owner), then active JOs grouped by client (by best rank) or by recruiter. Each JO shows its lead sheet links with counts, who is on it with days on the job, any condition, and the source. On-hold, filled and closed JOs sit in a closed list at the bottom.
- **Rotate flag.** A team entry more than 14 days past its `since` gets "14+ days, rotate?" and its card turns red. Standby entries (on the job only if a condition is met) are not flagged. Radar's morning brief (`employees/radar/skills/morning-brief.md` step 5) and the Eden Daily build (`stand-up-tomorrow.md` step 1b) list the same assignments under "Rotate?" for Kev's decision.
- **Baker and INL.** Baker Concrete, including the INL work, may be named on the Team Hub (Kev, 23 Oct 2026: "put Baker INL stuff, no problem"): `client: "Baker Concrete"`, `client_slug: "baker"`, no `discreet` flag. Since 13 Nov 2026 (Kev: "just say Baker") Baker and INL are named outright everywhere internal; no client is discreet and nothing says "Client · discreet". Baker's name, like every client's, never goes in anything another client sees.
- **Prometheus vs Promethean.** Prometheus is the Bay Area real-estate investor. Promethean is the NYC and Miami GC, sister company to PB South. Different `client_slug` values: `prometheus`, `promethean`.
- **Writes.** Radar writes `jobs` with `ArtifactData` (batch for more than a couple, `if_version` on every existing row). A rotation is a new team entry with `since` = the change date; the old entry is removed. Names, roles and links only: no pay, phones or emails.

### Board fields and Casey (Kev, 23 October 2026)

Casey, the Client Care Manager (`employees/casey/`), now owns the job-order board and the depth charts; Radar and Scout still write when a playbook says so. New on `jobs`:

| Field | Meaning |
|---|---|
| `status` | Adds `killed` (Kev pulled the JO). Killed rows are never deleted; the reason goes in `board_note` |
| `board_note` | Kev's latest instruction on the JO, close to his words |
| `depth` | `[{client_slug, chart, seat}]`, linking the JO to seats on that client's depth chart (`seat` matches `seats[].seat`) |
| `scout` | `{requested, at, status}`: queued, briefed, landed |

`scout_queue/{id}` is written when a JO is added on the board; Casey briefs Scout from it (a `scout` ticket on the Command Center) and marks it briefed. `clients/{slug}/meetings/{id}` holds client meeting notes. Write rules and the voice-note intake: `employees/casey/skills/hub-board.md` and `voice-note-intake.md`.

### Seed (Radar, 19 October 2026)

26 rows from the 19 Oct JO meeting, Kev's answers, the "Who's taking what" Doc and Scout's bucket plan (`employees/scout/sheets/2026-10-19-bucket-refresh-plan.md`). Every `since` is 2026-10-19. 25 active, 1 on hold (Hoffman Houston area supers, not on the 19 Oct list). No owner: Moss Interior Super, Moss Precon, Hoffman Amarillo low-voltage supers. Standby (only if Tim Norton doesn't land the Prometheus Sr PM seat): Andrew on the Triton role to confirm ("NP"), Noah on Megawatt San Jose Sr PM/PX and on Promethean NYC occupied healthcare. To confirm with Kev: the client for Noah's "Supers, Miami" (filed under PB South).

## JO Board (Kev, 23 Oct 2026)

Kev, with a photo of the cork board in his office: "your job orders + leads break down could look just like this. click into the role, see the depth chart, see the leads, but at the 50k ft, we can glance at this and see what JO's are open. Plus we can add JO's right in it that this agent would then alert scout to." He also wants to see who is working on what and what is being killed.

- **Where.** A third view, "Board", inside the Job Orders folder, next to "By client" and "By recruiter". It is the default every time the folder opens. Every Job Orders rule above still holds: internal only, rows load only while the folder is open, hidden and closed in Screen-share mode, discreet rows scrubbed.
- **Look.** A cork board in a dark frame. One column per client: client folders in `clients.sort` order, then clients that exist only in `jobs` (A to Z), then "Client · discreet" last. Each column starts with an index card (client name; open, on-hold, filled and killed counts) and holds one yellow sticky per JO: short role, location, owner names (standby marked), and markers for Go, Rotate? (the 14-day rule, active JOs only), No owner, lead count, depth count and Scout status. Inside a column: active by rank, then on hold (faded paper, HOLD stamp, condition shown), filled (green FILLED stamp), closed, and killed last (grey, crossed out, killed date). Desktop packs the columns side by side; phones show each client as a full-width band with two stickies across, so the page never scrolls sideways.
- **Go.** A sticky gets the red pin and "Go" when the JO is active and its rank is 6 or better, or its `board_note` starts with "Go".
- **Depth count.** Live candidates (not Out, Pass or Withdrawn) in the seats the JO links to through `depth`. It is counted from the depth charts the landing page already watches for its open-seat counts, and the page keeps only the numbers.
- **Detail.** Tapping a sticky opens a panel showing the role, client, status, rank, location, opened date, "Latest from Kev" (`board_note`), condition, who is on it (days on the job, rotate flag), lead sheets with counts, and each linked depth-chart seat with its live candidates and status chips. Also an "Open the … folder" button (never for a discreet row). Depth docs (`clients/{slug}/depth/{chart}`) load only for the JO on screen and are dropped when the panel closes, when Screen-share mode turns on, or when a client folder opens. A seat is matched by its exact `seat` name; a renamed or removed seat says so.
- **Editors only** (people with write access; viewers see neither control):
  - **+ Add a JO**: client (pick an existing client or type a new one), role, location, owner (Open or the roster) and priority (Normal or Go). It writes `jobs/{slug of client and role}` (with `-2`, `-3` if that id is taken) as status active, opened today, rank 5 for Go and 30 for Normal, team = the owner as lead since today, empty leads, depth and board_note, source "Added on the board by Kev" and `scout: {requested: true, at, status: "queued"}`. It also writes `scout_queue/{same id}`. Casey (Client Care) picks up queued rows and briefs Scout, then moves `scout.status` on the job and the queue row (queued, briefed, landed; see Board fields and Casey above). A typed discreet client (or "Client · discreet") is saved as `client: "Client · discreet"`, `client_slug: "discreet"`, `discreet: true`, with the name scrubbed from role and location. A new client typed here does not create a client folder.
  - **Status buttons** in the panel: Go (active, rank 5), Active (active; a Go rank of 6 or better drops to 30), Hold (on-hold), Kill (asks to confirm on the page, then writes `killed` and `killed_on`), Filled (`filled` and `filled_on`). Every write also sets `updated`. A JO whose `board_note` starts with "Go" keeps its Go marker until Radar edits the note.
- **Writes** use the page's one-write-at-a-time helper. Rows still saving are not overwritten by live updates, and the page never deletes a document. "By client" and "By recruiter" still show active JOs, and the closed list below them is now "On hold, filled, closed or killed".
- **Checked before publishing (version 11, 23 Oct 2026).** Tested in Chromium at 390 and 1280 px, light and dark, against a stub of the database seeded with the 52 live jobs, 7 client folders and 6 depth charts. Checks: no script errors, no sideways page scroll, all 12 client columns, no discreet name shown (including a test row typed with the real name), linked seats load in the panel and drop on close, Add a JO writes both documents for editors and is absent for viewers, Kill confirms and the killed sticky moves to the bottom, and Screen-share mode hides the folder.

## Asks for the team (Kev, 25 October 2026)

Kev: agents may ask the recruiting team for things directly, internal only, through asks on the Team Hub that the team checks daily. Goal: take work off Kev's plate. Casey first, then Jenny (`host`); Ember (`ember`, 28 Oct 2026) posts touch asks for warm people not in process, by Casey's protocol, at most 2 per recruiter a day. No email, text or client contact from an agent; client-facing comes later, after a clean month.

- **Where.** A closed folder, "Asks for the team" (marked "Internal · Eden only"), above the client folders. Its head carries a count badge: open asks (for the picked person, or everyone) and how many are overdue. Like Job Orders it is hidden in Screen-share mode, its rows are dropped when Screen-share turns on, and opening a client folder or Job Orders closes it.
- **Inside.** A "My asks" picker (Everyone, Max, Evan, Andrew, Noah, Bridger, Kyle, Nick), remembered per browser. Open asks first, soonest due first, overdue ones marked red; then a closed "Done or can't" list (last 20) with a Reopen button. Each ask shows who it is for, which agent asked and when, the due chip, the ask, the why, and a link to the job order (opens the Job Orders folder on that JO).
- **Recruiter.** Type a short reply (280 characters), tap **Done**, or tap **Can't** (a reply saying why is required). The page writes `status`, `reply` and `doneAt` back to the ask.
- **Who can reply.** The db rule for `team_asks` is `write: "interact"`: Contributors and up. A recruiter shared as Viewer reads asks but cannot save a reply; the page says so and asks them to get Contributor access from Kev. Everything else on the Hub stays editors-only.
- **Kev sees every ask** on the Command Center: Casey mirrors each ask as a ticket (`employees/casey/skills/team-asks.md`).

| Path | One document is | Fields |
|---|---|---|
| `team_asks/{id}` | One ask from an agent to one recruiter | id, to (max, evan, andrew, noah, bridger, kyle, nick), from (casey, host, ember), ask (one or two lines), why (one line), job (optional `jobs/{id}`), due (ISO date or date-time), status (open, done, cant), reply, createdAt, doneAt |

Rules: one person and one action per ask; no pay, health or anything private; Hub rules hold (no phones, emails or comp; Baker/INL may be named). Declaration from version 13: `capabilities: {db: {rules: [{path: "", read: "view", write: "admin"}, {path: "team_asks", read: "view", write: "interact"}]}, downloads: {}, user: {}}`.

Checked before publishing (version 13, 26 Oct 2026): Chromium at 390 and 1280 px against a stub database. No script errors, no sideways scroll, open asks sorted by due with overdue first, the picker filters and persists, Can't without a reply is refused on the page, Done and Can't write `status`, `reply`, `doneAt`, the job link opens that JO, Screen-share mode empties the folder, and a refused write turns the panel read-only with the Contributor note.

## Seed (Radar, 12 October)

- PB South: Project X (Miami) has 11 role buckets, 651 leads, built 9 Oct. Pool A, one sheet per role, folder `1yO3P2KJ_9fzWtLlt6MwCv2cIXm5uXfMU` (PE 65, SPM 66, VT 69, Asst MEP 66, Safety 51, Controller 60). Pool B, one sheet per role, folder `1X8FZdKoiLsld7PGKLDni_wcPEvcztWGm` (Accountant 57, Procurement 58, Admin 59, BIM 57, Demo 43). Controller owner Noah; the other ten unassigned.
- VMG Supers DC (25) and Prometheus Sr PM/PM (27), both owned by Andrew.
- Triton: depth chart and shot clock from `projects/eden-crm/reports/2026-10-12-triton-screener-stats.md` (internal names; the client version never shows names).

## Steps

1. Radar publishes `eden-hub.html` as a new private artifact with the db declaration above.
2. Seed the client folders with `ArtifactData`, one client at a time.
3. Read back one client as a lower-level viewer to confirm teammates can read.
4. Kev names the roster and approves sharing.

## Candidates in process (Kev, 27 October 2026)

Internal folder on the Hub listing everyone in process across clients: pending start, started (30/60/90), interviewing, and submitted or PTC with no touch in 7 days. Rows come live from the depth charts; `care/{client slug}--{name slug}` docs hold `start`, `owner`, `touches [{at, by, note}]` and `checks` (offer_signed, resigned, background, day_one, counter, d30, d60, d90, referral). Contributors can write `care` (db rule `care` write interact), like `team_asks`. Hidden in screen-share mode. "Print Nick's sheet" prints the weekly one-sheet. Routine: `employees/casey/routines/candidate-care-list.md`.


## Version 15: JO board as a ranked list (5 Nov 2026)

Kev: "I don't love the post it note design, lets make it a little cleaner." The cork board is replaced with Marlowe's spec (`draft/jo-board-design-marlowe.md`): one ranked list with By rank / By client / By recruiter; filled, closed and killed JOs in a collapsed Closed out; a red edge and "Rotate?" at 14+ days, amber at 10 to 13. Two new booleans on `jobs/{id}`, `hot` (Hot next week) and `partner_share` (goes to the 1099 partner board), are toggled by editors, plus rank editing (number field and up/down). Ranks are per client and may repeat; nothing is renumbered. Each change writes the field plus `updated`. Checked before publishing: Chromium at 390 and 1280 px against a stub database, 46 checks, no script errors, no sideways scroll, writes and refused-write rollback, viewers get no controls, and screen-share mode hides the board. Open for Kev: Hot replaces the automatic Go chip, and whether to keep the amber warning.
