# Cadence, tags and lanes (seeded 28 October 2026)

Source: Kev's comment on the Client work zone, 28 Oct 2026, and the hiring ticket. The tag names are a proposal until Kev says yes to `projects/mpc/crelate-tag-plan.md`; when he changes a name or a number, update this file through Radar.

## The five tags and what each one means for you

| Tag (exact) | Meaning | Touch every | Red alert to Radar | Picked for market? |
|---|---|---|---|---|
| `MPC` | Most Placeable Candidate: strong, open to a move, Eden markets them without a job order | 30 days | Yes, past 60 days with no touch | Yes (Monday picks) |
| `Follow-up 14` | Hot follow-up: a recruiter promised a call back, or something changes soon (bonus paid, project ends) | 14 days | No | No (unless also MPC) |
| `Follow-up 30` | Warm follow-up: worth a monthly touch | 30 days | No | No (unless also MPC) |
| `Passive A` | Passive A-player: not looking, but someone Eden wants to know when they are | 90 days | No | No |
| `Do-not-market` | Never shown to a client: asked for confidentiality, works for a client, or Kev said so | (none of its own) | No | Never, whatever else they carry |

- A person with two cadence tags runs on the shorter one.
- Untagged people Ember finds itself (a screen in the last 60 days, not in process, no tag) are listed as "Suggested: tag or leave" for the owner and Kev to decide. Ember never tags them.

## What counts as a touch

Any of these activities logged in Crelate on the person, by anyone: RP, MP, Screen, Set Call, Resume, PTC, Submittal, FTI (verb ids in `crelate-reads.md`). An email or call logged under another activity type is not counted until its verb id is verified; the list says "touch types counted: the eight known" in its footer.

## Lanes

| Person is | Owner | Ember does |
|---|---|---|
| Submitted, PTC, interviewing, offer, placed (pending start or within 120 days), on any depth chart at those stages, or has a `care/` doc on the Team Hub | Casey ("Candidates in process") | Shows them as "in process: Casey's" and posts nothing |
| Out of process (status Out, killed JO, filled by someone else) and still tagged | Ember | Back on the due list the next pass |
| Tagged or suggested, not in process | Ember | List, cadence, asks, Monday picks |

## The team (ask targets)

Recruiter slugs for `team_asks.to`: `max`, `evan`, `noah`, `andrew`, `bridger`, `kyle` (starts 2 Nov 2026), `nick` (operations). Never Kev: his items go through Radar. Crelate user ids to slugs: `ROSTER` in `workshop/workforce/recruiting-board.ts`.

**Owner recruiter** = the person who applied the tag (or added them to the Warm card), else the owner of their last touch, else "owner: Kev to name". Ember never assigns an owner.

## Clients (who is never a target for poaching)

| Client | Rule for Ember |
|---|---|
| Baker Concrete, including the INL work | Named "Baker" in everything Ember writes (no client is discreet since 13 Nov 2026). A Baker employee is never picked to market |
| Moss | Referral asks only; never marketed to as a poaching target, never a Moss employee picked; Moss material never names another client |
| Triton, PB South, VMG, Megawatt, Hoffman, Pence Kelly and its GC Fortis, Carmel, Promethean, Prometheus, Swinerton, Pruter, MK Sherrill | Clients: fine as MPC targets (Kev markets to clients). A candidate who works at one is never picked |

Full client list: `employees/scout/memory/seed/clients.md` and `employees/casey/memory/seed/names-and-clients.md`. A new client signed goes there first.

## Dates

- Pacific time. The Sabbath runs Friday sunset to Saturday sunset (`npm run sabbath`).
- A due date that falls on a Friday evening, Saturday or Sunday moves to Monday. Eden's working week is Monday to Friday.
