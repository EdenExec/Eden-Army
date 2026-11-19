# Eden Hub v1: the overnight build (Kev, 19 Nov 2026)

Kev, 19 Nov, 1:30am MT: "launch the big lift on tying everything into one... run on that overnight and really lift it off the ground. Getting all agents working together, Marlowe to design, plugging Scout, Dean, Jenny, etc in. I say we go on this." He also said yes to a claude.ai login for every new team member, which is how people get in.

From his brain dump (Kev's Whiteboard, Nov 18): one master single point of entry ("my SharePoint") with a sub-folder per department, and role-based access:
- **President:** sees all.
- **Recruiters:** the daily board, recruiting scoreboards, JO boards, the training center, comms channels and the ticket system.
- **Bridger:** also sees the interns' scorecards.
- **Command Center layer:** clicks through to every artifact (WIP and Pipe, Cash Pulse, depth charts and the rest).
- **Main page:** welcome, messages, handbook, forums (trainings, chat channels, podcasts), research reports, ticket requests (leads, travel, reimbursement, pooled non-urgent asks for decision windows), job board, revenue and activity leaderboards, CloudTalk dials, the GGOTW award, and a cross at the bottom.
- **A desk per recruiter:** the day laid out from the calendar, tasks that collapse when done, notes logged and tagged.
- **JO check-out:** finish JOs before checking out new ones. About 20 RPs a day earns 3 JOs; about 15 a day, at most 2.
- **1099 partners:** close partners get a username. Arm's-length partners get a weekly JO list behind a unique Eden PIN, linked to a lead list they can open without an Eden email.
- **New hires:** each gets an artifact (ramp, training, scorecards) from one framework, then role specifics.
- **Later:** Cody Ballah (Nexora, built Rhaven) helps take it to the next level. Kev meets him Thu 19 Nov at 2:30pm MT. This build is what we show him, so it must be honest about what is wired and what is a placeholder.

## What v1 is

One new **team-facing** artifact, the **Eden Hub**: the front door for everyone at Eden.
- The Command Center (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW) stays Kev's private cockpit. The Hub links to it for the President only.
- v1 is a **front end over what exists**: it links to and summarises the live artifacts. It does not rebuild them.

**Sections (tabs or a left rail):**
1. **Home:** welcome, a message of the day, announcements, the leaderboards (RPs this week, CloudTalk dials), the GGOTW award, the cross.
2. **My Desk:** today for the person signed in, with a JO check-out showing their limit from their RP pace, and tasks that collapse.
3. **Recruiting:** the daily board, the Round Table scoreboard, JO boards, depth charts, open roles.
4. **Training:** Eden University, the Recruiter Kit, Headhunter Training, the submittal standard, new-hire tracks.
5. **Tickets:** request forms (leads, travel, reimbursement, IT, a pooled "decision window" ask). They land in the Hub's own database for Radar to pick up.
6. **Comms:** channels (announcements, wins, help). Simple posts in the Hub's own database.
7. **Partners:** the 1099 view. Weekly JO list behind a PIN, client-blind.
8. **President:** Command Center, Cash Pulse, WIP and Pipe, Runway, Credit Burn, the agent org chart. **Only Kev sees this tab.**

**Role-based access:** the artifact knows who is signed in (`user` capability). A roles document in its database maps people to roles (president, admin, recruiter, intern, partner). Kev edits the roles in a Settings panel only he sees. Anyone not listed sees Home and Training only.

## Hard rules (from Radar's standing rules)

- **Private by default.** Publish as a new private artifact. Never change sharing; Kev shares it when he is ready.
- **Nothing on any team surface:** no phone numbers, emails, pay or comp, health, family or age. CloudTalk shows counts only. Crelate is read-only.
- **Clients:** client names may appear on internal recruiting boards, but the Partners tab is client-blind. No client ever sees another client's name.
- **No live-system writes:** nothing is written to Crelate, CloudTalk, email or calendars. The Hub writes only to its own database.
- **No sending, spending or publishing outside Eden.** No paid API calls. Any metered service over 5,000 credits needs Kev's fresh yes.
- **Sabbath:** the Hub shows a calm rest state from Friday sunset to Saturday sunset (Boise), the way the Command Center does. Look at its Sabbath code. Never schedule anything into it.
- **Look:** Eden brand (cream, Montserrat, collapsible tiles, "Augusta Masters scoreboard" for performance). It must work on a phone and in dark mode. Marlowe owns the design pass.
- **Honest data:** every number shows its source and time. A section that is not wired yet says "coming" plainly, never with fake numbers.

## Existing pieces to link or feed from

| Piece | Link |
|---|---|
| Command Center | https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW |
| Round Table (scoreboard; db board/current, phones/current) | https://claude.ai/artifact/DTXbu7B6F3B2s8NEnmYdCE |
| Eden Day Board | https://claude.ai/artifact/4QFTb8NFvWhbc2jg5zD4hc |
| WIP and Pipe | https://claude.ai/artifact/4fueMmheVrnVz79KuDDMs2 |
| Cash Pulse | https://claude.ai/artifact/LxaFb1CvQgqcsrMn5KXie7 |
| Runway | https://claude.ai/artifact/LL1hw8T3s9Bqk8tJchv8Xv |
| Depth charts | https://claude.ai/artifact/7kccfScydYDcWoXfeeE8q6 |
| PB South Staffing Board | https://claude.ai/artifact/Q7G53Lu6MQopPnKVthYCaV |
| Open roles (partner, client-blind) | https://claude.ai/artifact/PJr7WQT2p8FBVAVSg1P3zv |
| Eden University | https://claude.ai/artifact/3PcejY9tXPRs4TkaFLagGX |
| Recruiter Kit | https://claude.ai/artifact/PnmcT8riSACwvfK71VfKc3 |
| Recruiter Pre-screen Bench | https://claude.ai/artifact/4Nasro5TiVN8G5Wta6k2jT |
| Agent org chart | https://claude.ai/artifact/CyZ475DJjbNNaGbfc93nZN |
| Eden Daily (today's) | https://claude.ai/artifact/FCrzGTCDJAovVNC2HA2oux |
| Eden Weekly newsletter plan | https://claude.ai/artifact/2deVesv7c176vwBcKw4cKr |
| Eden Army Playbook | https://claude.ai/artifact/TRoaPMoZ2wMppE2SaQVW9B |
| Credit Burn | https://claude.ai/artifact/29SgfQbFS2y4ZmVLzfX3h7 |
| Eden App wireframe for Cody | https://claude.ai/artifact/Ka7gVfWkRv78fwhzWoG5Dh |
| Cody brief | `projects/eden-app/cody-brief.md` |
| Virtual office brief | `projects/virtual-office/brief.md` |
| Board data builder | `npm run recruiting-board` (`workshop/workforce/`) |

**Live numbers in v1.** The Hub keeps its own copy in its database (`board/current`, `phones/current`), the same schema as the Round Table. The Round Table and CloudTalk routines can later write here too (Radar adds that). Seed it tonight from the latest files: `projects/workforce/board/current.json` from `npm run recruiting-board`, and the phones doc from the Round Table.

## Who does what tonight

| Owner | Piece | Output |
|---|---|---|
| Q (Fable) | Architecture and the v1 build: data model, roles, every tab, Sabbath, seed data; published private | `projects/eden-app/hub/`, the artifact URL |
| Dean | Training tab and new-hire framework content; My Desk rules (JO check-out, daily RP standard) | `projects/eden-app/content/dean-*.md` / `.json` |
| Jenny | Home and Comms content in Eden's voice: welcome, message-of-the-day bank, handbook outline, channels, GGOTW, ticket types and forms | `projects/eden-app/content/jenny-*.md` / `.json` |
| Scout | Partners tab: weekly JO list behind a PIN, client-blind, lead-list link; how a 1099 gets in | `projects/eden-app/content/scout-partners.md` |
| Marlowe | Design pass on v1 once it is up: look, layout, phone, dark mode, the cross; the org chart | Edits via Q, `projects/eden-app/content/marlowe-review.md` |
| Q's tester | Three widths, light and dark, every control, leak sweep | PASS/FAIL report |
| Radar | This brief, sequencing, the morning report to Kev | Morning summary |

Done for the morning means a private Hub URL that Kev can open on his phone: every tab present, the honest links live, scoreboard numbers seeded, roles working for him, and a short list of what is wired, what is a placeholder, and what Cody could take further.
