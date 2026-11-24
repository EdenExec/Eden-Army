# Nick's agent kit: framework (plan only, 23 Nov 2026)

Kev, 23 Nov (voice): Nick "has his own [Claude suite] ready to go. We're just going to hand off agents, or I'll make some of my agents shareable that will be relevant for this... Basically, needs a radar... have radar start building the framework of how we can get Nick a cloned copy of all the tools that are helpful for him."

Plan for Kev's review. Nothing is shared, cloned or set up in Nick's account yet.

## Nick's seat (what the kit serves)

From the operating model: Leadership · Operations, becoming **hourly staffing (Eden Staffing) + high-level recruiting + accountability**. Today he also runs the new-hire pipeline (the hiring punch list, NDAs and Enneagrams for his list), the 1099 partner side, VMG with Peter, and leadership scorecards.

## The kit

| # | Agent for Nick | Built from | What it does for Nick | Clone or share |
|---|---|---|---|---|
| 1 | **Nick's Radar** (chief of staff) | Radar | His own ledger, inbox sweep, daily brief, check-out, his rules. Front door for his other agents. | Clone (new persona, his rules, his inbox) |
| 2 | **Pam** (project manager) | Pam | Eden Staffing launch schedule, milestones, Wednesday chase, Friday status. Pam already works the Eden Staffing project with Nick. | Clone; Kev's Pam keeps Kev's side projects |
| 3 | **Dean** (people and onboarding) | Dean | Hiring punch list, ramps, scorecards for his hires. | Share one Dean (one source of truth for onboarding) |
| 4 | **Casey** (client care) | Casey | JO board and depth charts for Nick's clients (VMG and others). | Share (the board is team-wide) |
| 5 | **Scout** (lead research) | Scout | Lead lists for staffing and partner searches. | Share; ZoomInfo seats stay per person |
| 6 | **Jenny** (comms) | Jenny | Drafts in Nick's voice to candidates, clients and hires. | Clone (needs his voice and his Superhuman) |
| 7 | **Docket** and **Tally** | Docket, Tally | Contracts and numbers for staffing deals. | Share, read-only for Nick; one numbers gate |

**Not in Nick's kit:** Kev's personal and family agents (Barnabas, Hale, Jethro, Gordo, Atlas, Keys, Hawk, Marlowe's housing work), Carmel's Partner (Kev's account), Ember and Q's back-of-house build team.

## How the handoff works on Nick's Claude

1. **Same repo, his own desk.** Nick gets access to this repository. His clones live beside Kev's: `employees/nick-radar/`, `employees/nick-pam/`, `employees/nick-host/`, each with its own persona, standing rules and memory. Shared agents (Dean, Casey, Scout, Docket, Tally) stay single and serve both.
2. **His own connectors.** Nick connects his own Superhuman, Google Calendar and Drive, Crelate key, CloudTalk and ZoomInfo seat in his Claude settings. Nothing of Kev's is shared: no tokens, no inbox and no keys.
3. **His own routines.** His brief, sweep and check-out run as scheduled tasks on his account, on his hours, with the Sabbath rule. They are not added to Kev's routine list. That fits the routine audit: Kev's count goes down, not up.
4. **Shared surfaces, not shared accounts.** Kev shares the artifacts Nick works in (the Round Table, the Eden Hub, the hiring punch list, the job order board) as Contributor. Agents on both sides write to the same databases.
5. **Boundaries.** Nick's agents never read Kev's mail, Kev's private pages or KDTW/family items. Kev's agents don't read Nick's. Cross-desk asks go through the shared ledger rows or a ticket.

## Build order (once Kev says go)

1. Nick's Radar: persona and standing rules (Kev's core rules plus Nick's seat), the ledger view filtered to Nick, and his daily brief. About half a day.
2. Nick's Pam pointed at `projects/eden-staffing/`.
3. Jenny clone with Nick's voice. Needs 10 to 20 of Nick's sent emails to learn it, with his OK.
4. Repo access for Nick and a one-page "how to use your agents" guide.
5. A one-week trial, then Nick's feedback, then turn on his routines.

## Decisions for Kev

1. Repo access for Nick (same repo, his own desk folders): yes or no?
2. Which shared artifacts Nick gets as Contributor.
3. Whether Nick's Radar can see Kev's ledger rows tagged to Nick (recommended: yes, those rows only).
4. Who pays for Nick's Claude plan and connectors (Eden or Nick).
