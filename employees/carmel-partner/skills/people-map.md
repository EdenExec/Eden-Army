# People map

The movers and shakers at Carmel: who decides, who schedules for whom, who gives feedback, and how each person works. Kept on the tracker's `people` collection; seeded from `memory/seed/carmel-people.md`.

## What a person row holds

| Field | Example |
|---|---|
| Name, title, office | Sarah Converse, VP Design, San Francisco |
| Role in the process | Decider, hiring manager, panel, scheduler, HR partner, feedback giver, contract owner |
| Roles they touch | Role ids on the tracker |
| Assistant | Who schedules for them, or "books own" |
| Habits (learned) | Response speed, channel, format, preferences: "Replied within the hour to a candidate's times and sent the invite herself (19 Nov)" |
| Prediction | What you expect next, marked as a prediction, with the date you will check it |
| Notes | Work facts with source and date |

## Work facts only

Write down how a person works: titles, reporting lines, who they schedule for, how fast they answer, how they like submittals, what they test for. Never write personal, health, family, home, age or opinion-of-character details, even when a note has them (old Crelate notes carry some; leave them there). Translate a blunt note into a work fact or leave it out: "high bar on detail; expects polished, finished work" is a work fact; a name-calling line is not. No phone numbers or email addresses on a row: the email lives in Kev's inbox, the row says "email in Kev's thread of 19 Nov".

## How it learns

1. After every email, call and note, update the habits of each Carmel person in it: time from message to reply (in working hours, Pacific for San Francisco and Santa Monica, Eastern for New York), who they copied, who actually scheduled.
2. After three observations, write a habit as a pattern ("answers same day, usually after 4pm ET"). Before three, it is "seen once".
3. Each prediction is checked on its date and marked held or missed. Missed predictions change the habit.
4. Scheduler mapping is the most valuable fact: which assistant books for which hiring manager. Brandy's 19 Nov announcement copied the assistants who "support 1 or more members" of each hiring team, without saying who supports whom. Fill the mapping one confirmed invite at a time; until confirmed, mark it "to confirm".

## Crelate (read-only)

Carmel Partners company id `f7004fed-b4a9-4608-588c-6a0d9ff7dc08`. `GET /api3/companies/{id}/contacts?include_former=true` lists its people; `GET /api3/notes?parent_id=<contact>` and `GET /api3/activities?parent_ids=<contact>` give their history (note: `activities` ignores `parent_id`, use `parent_ids`). Header `X-Api-Key: $CRELATE_API_KEY` and a browser User-Agent; never print the key. Read only. Field and project staff in Crelate (superintendents, project managers, engineers) may be former Eden placements: they are not hiring-process people and their names stay off the people map unless they become a hiring manager or panelist.

## Who to ask

When a fact matters (who decides, who schedules) and you cannot confirm it from the notes, it becomes one question for Kev or Michael in the EOD, not a guess.
