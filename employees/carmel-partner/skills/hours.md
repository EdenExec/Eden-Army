# Hours (weekly billing for the Carmel engagement)

Kev, 23 Nov 2026: "I need to track hours for myself and for others here so that we'll be ready to invoice on a weekly cadence." The first 30 days of the Carmel agreement are hourly (Docket's draft; see `memory/seed/carmel-account.md`).

## Where

The **Hours** tab on the Carmel Tracker (https://claude.ai/artifact/GTjZyx5ZNEn7hnEoZXbPhH#hours). Collections:

| Collection | One document per | Fields |
|---|---|---|
| `hours` | Time entry | date, week (Monday id), person (`kev`, `michael`, `admin`), hours (0.25 steps), role_id (a `roles` id or `account`), task, note, status, source, created_by, created_at |
| `rates` | Person | person, label, rate ($/h, typed by Kev only), updated_at |
| `weeks` | Billing week (id = Monday, `YYYY-MM-DD`) | week, status (`open`/`closed`), submitted {person: ISO}, closed_at, billable_hours {person: h} |

Rates live only in the tracker database. Never write a rate into the repo, a ticket, a deck or a ledger row.

## Who logs and how (Kev's answers, 23 Nov 2026)

| Person | How | Status flow |
|---|---|---|
| Kev | Carmel's Partner drafts his lines each night from his Google Calendar (Kev - Eden), Plaud and Zoom calls, and his sent Carmel mail. Kev includes or excludes each one before he calls it a day | `draft` to `included` or `excluded` |
| Michael Duggan | Logs his own lines on the tracker and submits by Thursday night | `logged` to `submitted` |
| Admin (TBD) | Same as Michael. Kev names the person on the rates form | `logged` to `submitted` |

Only `included` and `submitted` lines are billed.

## The week

- The week runs Monday to Friday (Kev: "i don't care", so this is Radar's pick). Saturday and Sunday time counts toward the next Monday's week.
- **Thursday night:** Michael and Admin submit. On Friday morning, Carmel's Partner flags anyone who hasn't submitted in the EOD email to Kev and Michael.
- **Friday by 3:30pm MT** (before sunset): Kev clicks "Close week for invoicing". Lines lock and `weeks/<id>.billable_hours` is written.
- **Friday before sunset:** Radar drafts the invoice from the closed week (`employees/radar/skills/invoicing.md`, "Carmel hourly"). Kev sends it. Nothing goes on the Sabbath.

## Drafting Kev's lines (each weekday night)

1. Read the calendar for that day. Carmel events are the ones with Carmel in the title, a carmelpartners.com attendee, or a Carmel candidate screen. Draft the scheduled length. When it's unclear whether Kev attended (declined, a no-show, or a clash), say so in `source`.
2. Read Kev's sent mail that day for Carmel threads. Group the email time into one "Scheduling and coordination" line, 0.25 h per 2 to 3 substantive emails, and list the threads in `source`.
3. Plaud and Zoom recordings with Carmel content: use the recorded length.
4. Contract or fee work on Kev's own agreement is drafted with "usually not billed: your call" in `source`.
5. Never draft time for work an agent did (the hit list, the tracker, EOD emails).
6. `note` is what Carmel would read on the backup, with no candidate names, phones, emails or pay. `source` says where the estimate came from.
7. Write with one `ArtifactData batch`, doc id `h-<date>-kev-<slug>`, status `draft`, created_by `carmel-partner`. Never change a line Kev has already reviewed.
