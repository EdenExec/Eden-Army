# Eden Friday Scorecard as two Google Forms

Owner: Dean. Engineering review: Q. Built 5 Nov 2026 from Kev's approved brief (relayed by Radar). **Build only:** nothing is sent, shared or put on a calendar until Kev says go. First run: Fri 6 Nov, fill 10:00 to 10:30am PT, Scorecard Review at 10:30.

| Form | Who fills it | Tab in the responses Sheet |
|---|---|---|
| Eden Friday Scorecard, week ending <Thursday> | Max, Evan, Noah, Andrew, Bridger (not Kyle or Kunji yet) | Recruiters |
| Eden Friday Scorecard · Leadership, week ending <Thursday> | Kev, Nick | Leadership |

## Set it up (about 10 minutes, once, from kev@edenexec.com)

1. Open https://script.google.com and click **New project**. Name it "Eden Friday Scorecard".
2. **Project Settings** (gear icon): set the time zone to **(GMT-08:00) Pacific Time - Los Angeles**.
   Optional extra safety: tick **Show "appsscript.json" manifest file in editor**, open it, and replace its contents with `appsscript.json` from this folder (Pacific time, V8). The code does its week maths in Pacific regardless, so skipping this is fine.
3. Back in **Editor**: replace `Code.gs` with `shared.gs`. Click **+** > Script and add `recruiter-form.gs`, then again for `leadership-form.gs`. Paste each file whole. Save.
4. Run, in this order, approving Google's permissions the first time:
   1. `buildRecruiterForm`
   2. `buildLeadershipForm`
   3. `installScorecard`
   If a run stops with a permissions screen, click **Review permissions**, pick kev@edenexec.com, **Advanced > Go to Eden Friday Scorecard (unsafe) > Allow**, then run the same function again.
5. The execution log prints the two edit links, the two form links and the responses Sheet. Paste them back to Dean (or Radar); nothing else to do.

What you end up with: two Forms and one Sheet ("Eden · Friday Scorecard responses") in your Drive, shared with no one. The Sheet has three tabs: Recruiters, Leadership, Prefill.

## Settings on both forms

- Sign-in required, edenexec.com accounts only; email collected automatically; one response per person.
- Answers can be edited until about **Friday 10:30am PT** (Google runs timed triggers within 15 minutes of the set minute, so the lock lands between 10:15 and 10:45), then editing turns off (`lockEdits` trigger). A late first answer is still accepted.
- **Thursday noon PT** (`weeklyReset`): the title moves to the new week ending date, the page 0 note shows the new Friday-to-Thursday window, last week's answers are cleared from the Form (the Sheet keeps every week), and editing opens again.
- **Every hour** (`buildPrefillLinks`): for any Prefill row with numbers, writes (or refreshes) that person's prefilled link in the Link column. Rows with no numbers are skipped. It sends nothing.

## Page 0 numbers: the Thursday prefill

Each Thursday by 2:30pm PT, Dean (with Radar and Q) fills the **Prefill** tab, one row per person:

| Column | Source |
|---|---|
| RPs, Days at 15 RPs, FTIs, MPs, PTCs, Resumes, Submittals | Radar's Crelate leaderboard, summed Friday to Thursday |
| Dials out, Dials answered | CloudTalk outbound |
| Placements | Names on the 2026 Rev Report tab of "2026 - EPG Dashboard (Hub)" not in last week's snapshot (Rec. column: Juice = Andrew, Bridge = Bridger). Baseline saved Thu 5 Nov; first real comparison 12 Nov |
| Team rows (leadership) | The five recruiters' totals |

Within the hour of a row getting numbers, its link appears in the Link column. **They go out only on Kev's go.**

Not prefilled yet:
- **Placements, this first week:** only Thursday's additions are caught. Recruiters add the rest in 4.1.
- **Talk time:** CloudTalk doesn't report it.
- **Revenue, commission and draw:** these wait on Tally's QuickBooks reconnect. Page 0 says "Revenue, commission and draw aren't shown yet."
- **The activity window:** if the leaderboard can't sum Friday to Thursday by day, prefill what's available and name the window in the page 0 note (edit the section header text).

## Where the answers land (the copy-into-Round-Table step after each run; not built yet)

| Form answers | Round Table |
|---|---|
| Page 0 numbers and 4.1 | Numbers and trend, scorecards by week |
| 2.1 to 2.6 | This week's card, weekly boxes |
| 1.1 to 1.3 | Coaching, win |
| 2.7 and 2.8 | Coaching, pillar |
| 4.9 | Coaching, one change |
| 4.10 | Coaching, next rep |
| 3.4 and 3.5 | Coaching, ask |
| 1.4 and 1.5 | 10-5-3-1, progress note |
| 4.2 to 4.8 | Deliverables and JOs, one row each |
| 3.1 | Coaching, score only |
| 3.2 and 3.3 | **Never copied.** They stay in Kev's Sheet; the folder shows "talk in person" |
| Leadership answers | Leadership folder in the Round Table; L3, L4 and L9 stay in Kev's Sheet only |

No health or family details anywhere in the Round Table. Dean never reads or copies 3.2 or 3.3.

## Known limits

- Google Forms can't make 4.9 conditional, so it is required for everyone ("hit my numbers" if they did).
- `setRequireLogin` only works on a Google Workspace account, which kev@edenexec.com is.
- The prefill only fills short-answer fields whose titles match the Prefill tab headers exactly. Don't rename page 0 questions in the Form editor.

## Option A (built 5 Nov): the scorecard as a Claude page, no Google setup

Kev asked the agents to build the forms today without his lift. No agent can create a Google Form, so `scorecard-page.html` is the same scorecard as a private claude.ai page: https://claude.ai/artifact/M6AXCD9ekLjnJnQuXsiLkZ

- Each person signs in with their Eden Claude account. Recruiters see the recruiter form; Kev and Nick see the leadership form plus a Team view.
- Page 0 is prefilled from Dean's Crelate and CloudTalk pull (db `prefill/<name>`, `prefill/team`); the week, window and 10:30 lock live in `meta/week`.
- Editing closes at 10:30am PT sharp (enforced by the page; the data rules don't know the time).
- Storage and who reads it, checked on the server with lowered access levels on 5 Nov (probe rows written, read and deleted):
  - `responses/<id>`: the recruiter's own pages 0, 1, 2 and 4. A recruiter reads and writes only their own. Kev and Nick read all.
  - `candor/<id>`: section 3, plus L3, L4 and L9. A recruiter reads and writes only their own. Only Kev (owner) reads all; Nick does not.
  - `leadership/<id>`: Kev's and Nick's leadership answers; both read them.
  - `prefill/*` and `meta/*`: every team member can read the week's activity numbers (the same counts as the leaderboard); only editors write.
- Who is who (fixed 5 Nov after Kev's dry run showed "not on the list": the org does not share email with the page): the owner is Kev; otherwise the Eden email if shared, else the account name (e.g. "Max Betcher"), else a one-time name pick saved in `claims/<id>` (Kev and Nick can read claims; each person writes only their own). `identity-check.cjs` runs the page in Chromium with a stand-in store for all three paths. Still unproven with a real second person: a recruiter saving into their own slot.
- Sharing (Kev, Share menu, on his go): the five recruiters as Contributors, Nick as Editor.
