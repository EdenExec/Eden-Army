# Dean's piece: team newsletter and the Eden University turret

Status: scope only, nothing built or sent. Asked by Radar for Kev, 5 Nov 2026. Goes to Kev before anything ships; Jenny owns design and publishing.

## 1. Weekly team newsletter: Dean's section

**What I send:** one "Workforce" block, the same four parts every week. All of it comes from work I already do, so it adds about 20 minutes of my run and nothing for Kev or the team.

| Part | What it says | Source I already keep |
|---|---|---|
| Team scoreboard | Team totals only (RPs, PTCs, submittals, FTIs) this week vs the 4-week average, and the direction | Friday Round Table pull |
| Training recap | The week's two concepts in three lines each, plus the one question to ask on a call | The Wednesday run of show in `projects/workforce/eden-university/` |
| Word of the week | One construction term with a plain definition and the ladder (e.g. VDC Coordinator vs VDC Manager) | Same training file |
| Eden University | Modules finished and sign-offs that week, by name and date only | Track progress sheets |

**Rules:** no individual numbers, no ranking, no pay, nothing about health, family or age. Scorecards stay in person (standing rule). Shout-outs name the win, not the person's numbers.

**Cadence and hand-off:** Fridays, written right after the Round Table pull (about 4pm PT), as a markdown block at `projects/newsletter/<date>/dean.md`. Jenny picks it up for design. Scout writes its own block beside it.

**Asks for Kev:** (1) OK to name people on Eden University sign-offs in a team-wide letter? My pick: yes, names and the module only. (2) Team totals in the letter, or only the direction (up, flat, down)? My pick: totals, since the whole team is the audience.

## 2. The turret: one track engine for every Eden University track

**What it is:** a scheduled routine that runs every track from data, not from a person remembering. New hire = one roster row (name, track id, start date, supervisor). Everything else is derived from that track's `track.json`, which every track already shares (intern-ops, intern-sales, intern-marketing, intern-comms, recruiter-desk).

**What it does each weekday morning:**
1. Reads the roster and each hire's progress sheet.
2. Works out what is due this week from the track's phases and the start date.
3. Opens one Command Center ticket per supervisor: who is due a sign-off, who is behind (past the phase's last week with modules open), who finishes this week and needs an end review.
4. On a new roster row: produces the Day 0 checklist and a fresh progress sheet from the track, and opens a "before Day 1" ticket with the account and access items for Kev's yes.

**Why it is a turret, not a script:**
- **Track-agnostic.** It reads the schema, not a track. A new track (Sadie's EA track, a Client Success track) works the day its `track.json` lands.
- **Doesn't break silently.** `npm test` validates every `track.json` against one schema; a run that cannot read a sheet opens a ticket saying so instead of skipping.
- **Low input.** Supervisors only tick modules on the progress sheet. Nobody maintains the engine.
- **Safe.** Read-only on proofs; never messages a hire or sends anything; accounts and invites stay QC items for Kev.

**Effort to build:** about a day with Q (roster sheet, the routine, the schema test). **Needs:** where the roster lives (my pick: a tab in the Eden University sheet Bridger already uses) and Kev's yes to run it weekdays.
