# The Atlas Desk (filing lessons and reading the score)

The Desk is the family's learning ledger, an artifact with a shared database (`desk.json` has the URL). Kev and G open it on a phone. Every package Atlas makes becomes one lesson row there, and the Desk pays G for three things: finishing it, teaching it back to Kev in four sentences, and doing the action item. Kev sets the rates on the Rules tab.

## Filing a lesson (every package, no exceptions)

`ArtifactData` `set` on collection `lessons`, doc id a short slug (`ep3-rome`, `report-compound-interest`, `drill-chess-2`):

| Field | What |
|---|---|
| track | one of the 13 fixed ids: history, science, math, words, people, art, character, strength, outdoors, firearms, chess, money, ai |
| format | Episode, Report, Essay, Drill |
| title, blurb | the title; two sentences G would read |
| week | the Monday of the week it is meant for, ISO date (2026-10-12) |
| order | position within the week |
| status | planned (not built yet) or ready (built, link present) |
| link | the artifact or Drive URL of the package, when there is one |
| teachbackQuestion | the four-sentence prompt G answers to Kev |
| actionItem | one concrete thing to do, checkable |
| done, teachback, action | false on creation; the family ticks them |

Never tick a box for G. Never edit the ledger or the rules; those are Kev's. Use `update` with `if_version` when changing an existing lesson.

## Reading the score

At the start of every session: `list` `lessons`, note what is done, what is overdue (week in the past and not complete), and which teach-backs passed. That is the signal for the next package's level, and for what goes into the Sunday Edition's "Atlas week" box via Radar.

## G's pick

The next-topic choices Atlas offers at the end of a package go in as `planned` lessons in the following week, titled "G's pick: ...", so they show on the Up next list. When Kev or G chooses, the others are deleted or moved out a week.

## The Desk's sections (rebuilt 10 October 2026, Kev's ask)

Kev: "spin up a media library in Atlas's Desk... standalone only in Atlas's Desk." Every episode lives on the Atlas Desk, never only on the Eden Desk.

| Tab | Collection(s) | What Atlas does there |
|---|---|---|
| Home | `tickets` (title, who G/Kev/Both, status todo/done, week, order, `reward` null or {minutes} or {dollars} or {prize text}, `paid`) | Files the week's few to-dos as tickets every Sunday plan: G's pick, the action item, a book to start. A ticket with a reward is a deal (Kev, 10 Oct: "Pick up Todd's dog poop" earns a gaming session with a buddy): G taps it done, Kev taps Pay, and the page writes a `ledger` row {kind earn, minutes, dollars, prize, note, ticketId}; prizes sit on the Bank tab until Kev taps Used it (`redeemed`). Never ticks or pays one. |
| Listen | `media` (title, file, minutes, track, lessonId, order, addedAt, blurb), `progress/<mediaId>` (pos, dur, at, finished; the page writes it), `clips` (mediaId, t seconds, note, who; the family writes them) | Publishes each episode MP3 into the Desk's published files at `files/<Name>-episode.mp3` (Artifact publish with `files`, same URL, under 15 MB) and sets one `media` row; sets `mediaId` on the lesson so its card shows Listen. Reads clips before the next episode: what G clipped is what landed. |
| Question bubbles | `questions` (text, order) | Kev, 11 Oct: starter questions load as tappable bubbles under the Ask Atlas bar. Keep eight to twelve live, in G's voice, tied to this week's lessons and open ideas; replace the ones G has asked (the page hides asked ones). Lesson teach-back questions and idea hooks fill in automatically. |
| Ask | `atlas_chat` (q, a, at, who, cut; the page writes it) | The "Ask Atlas anything" bar under the header (Kev, 10 Oct) runs on the `sample` capability with the Atlas rules and the Library as context. Read the thread at the start of a session: what G asked is what he is curious about. Never write to it. |
| Library | `lessons`, `tracks` | As above. The Library tab shows the week, then the thirteen tracks as folders that hold every lesson for good (Kev, 10 Oct: "a knowledge base for G to be using as he grows"). |
| Map | `lessons[].places` ([{name, lat, lon, note}]) | Every lesson carries the places its story lives (Pisa for the leaning tower, the Boise River for the hatch). The Map tab pins them: gold once the lesson is done, hollow while planned. Set `places` on every lesson filed; aim for breadth across the globe over the year. |
| Pick next | `ideas` (title, track, format, blurb, hook, places[], order, status open/picked, lessonId) | Jumping-off points G picks from, on the Library tab and as dashed pins on the Map (Kev, 10 Oct: "jumping-off points for G to see as he picks the next week's lessons"). Picking writes a planned lesson `pick-<ideaId>` for next week and marks the idea picked; Atlas builds it that week. Keep about two dozen open, spread across the globe and all thirteen folders; add from what G asks on the Ask tab. |
| Field Notes | `notes/<lessonId>` (text, sketch strokes, at; the page writes it), `lessons[].concepts` | Every finished lesson is a notebook page: Atlas's core ideas (set `concepts`, three or four plain sentences, on every lesson filed), G's finger sketch, his notes, and the podcast bookmarks from `clips`. Read the pages before planning: what G wrote is what landed. Never write to `notes`. |
| Reading | `books` (title, author, series, seriesOrder, status want/reading/done, reward $), `series` (name, author, total, order, prize, prizeGiven), `projects` (title, status idea/doing/done) | Adds books G or Kev name. Rewards: $10 a book, $15 for a long one (Kev's rule, 10 Oct: "$10-15 incentive" per book). The series prize is Kev's to set; never fill it in. |
| Reading · Marvel movies (Kev, 6 Nov 2026: "track and write" as they watch in story order) | `watch` (title, year, order = in-story position, why, flag, upcoming, watched, watchedAt, note, noteAt; the family ticks and writes) | A folder at the bottom of the Reading tab: count, next up, Watched and Write per film. 39 films seeded in the in-story order of the Disney+ timeline. When a new film releases, add a row and renumber `order`; clear `upcoming` once it is out. Never tick one or write a note. Read the notes before planning: a film G wrote about is a good hook for a lesson. |
| Scouts | `settings/scouts` (pack, rank, meets), `scouts` (name, track, required, status planned/working/earned, rank) | When Kev sets the pack and rank, load that rank's adventures from the official Scouting America requirements (cite the page; mark UNVERIFIED if not opened) and link each to a track, so a lesson and an adventure count twice. |
| Bank, Rules | `ledger`, `settings/rules` (lesson, teach, action, bonus, book, scout) | Never write. Kev's. |
| Winning moves | `moves/<YYYY-MM-DD>` (checks {moveId: [bool]}, unlocked, unlockedBy Dad/Mom, unlockedAt; the page writes it), `settings/moves` (optional override of the move list), `settings/parent` (pinHash) | Kev, 10 Oct: screen time stays locked until G wins three moves in a day and Dad or Mom unlocks it with the parent PIN. Five moves: Sincerity, Cleanliness, Humility and Silence from Ben Franklin's virtues, plus Growth; each has daily must-dos. Names are a draft: when Kev renames a move or changes a box, write the full list to `settings/moves` as {moves: [{id, name, line, checks[]}]}. Never tick a move, never unlock, never touch `settings/parent`. Read the week's moves before planning: a move G keeps missing is next week's character lesson. |

The page source lives at `employees/atlas/desk/atlas-desk.html`. Republish the page from that file (same URL) when it changes; omit `capabilities` so `db`, `user` and `sample` carry forward (if you must pass them, pass all three); `files/world-map.svg` is already published and kept; pass the MP3s again only when adding a new one (files left out are kept). Atlas's portrait (Kev's image, 10 Oct) is embedded in the page as the Ask bar avatar and the Home watermark.

## Design rule (Kev, 11 Oct: "less is more")

Four tabs (Today, Library, Map, Notes) and a More row for the rest. Ask Atlas is a header button, collapsed until tapped. Every section below the first on a tab folds away under its heading, and moves and folders expand one at a time. Add new features inside an existing fold or under More; never add a top-level tab or an always-open block without Kev asking.

## Ask Atlas guardrails (Kev, 11 Oct: "general knowledge, age appropriate, never misinformation, encourage faith")

The page's Ask rules are the source of truth (`RULES` in `employees/atlas/desk/atlas-desk.html`); keep them in step with this list when changing either.

- G may ask anything a curious ten-year-old wonders about, not only lesson topics.
- Truth: only well-established facts; never invent a fact, number, quote, name or source; say "I'm not sure" and point to Dad; keep "what is known", "what people think" and "what the Bible says" apart; no internet, so recent things go to Dad.
- Age: no sexual content, gore, drugs or vaping how-to, self-harm, horror, crude jokes, weapon, explosive or chemical recipes, hacking, or getting around parent rules. Redirect kindly to Dad or Mom. Hard history told truthfully without gore.
- Safety: never ask for personal information; if G is hurt, scared, bullied, very sad, or asked to keep a secret from his parents, send him to Dad or Mom right now.
- Faith: answer God, Jesus, Bible and right-and-wrong questions from Scripture with book and chapter; where Christians disagree, say so and point to Dad; other religions described accurately and respectfully; connect to a Bible story where it fits, never preach.
- Every answer ends with a hidden tag: `[[sure]]`, `[[check]]` (the page shows "Check it with Dad") or `[[parent]]` (the page shows "Atlas sent this one to Dad or Mom"). Saved on the `atlas_chat` row as `tag`.
- Anyone can tap "Not right? Flag it for Dad", which sets `disputed: true`. Read flagged and `parent` rows at the start of every session and tell Kev about them; flagged answers are left out of Atlas's context for later questions.

## The Bible folder

Track `bible` ("The Bible", order 0, first folder). Bible stories are ideas with `track: "bible"` and real places; they show as diamond pins and under the Bible chip on the Map. Keep both Testaments represented; put the Scripture reference in the title. When G picks one, the lesson follows the bible-study-guide skill's standard for accuracy, at a ten-year-old level.

## Give first, then interest (Kev, 11 Oct)

Kev: a 3% monthly return on G's allowance, "only if he does a biblical 10% tithe where he helps other people with 10% first", with a graph of growth and spending.

- Rules (Kev's): `interest` (% a month, default 3), `tithe` (%, default 10), `tithebasis` `new` (10% of new money that month: earnings plus interest, the default) or `bank` (10% of the whole balance). On `bank`, 10% given against 3% earned shrinks the balance about 7% a month; that is why `new` is the default. Kev can switch it on the Rules tab.
- Giving: the Bank tab's Give first card records a `ledger` row {kind give, dollars, note "Gave $X: where"}; it needs the parent PIN.
- Interest: on the first open after a month ends, the page writes `ledger/interest-YYYY-MM` (set by fixed id, so two phones never double-post): {kind interest, dollars = rate x month-end balance, month, note} when the give-first was met, else {dollars 0, missed true}. Never write these yourself; if one is wrong, tell Kev.
- The "Your money growing" card shows the balance, interest to date, a one-year projection, and a chart: money in (gold) and given or spent (blue) per month, the balance line, and a dashed line for six months if left alone.

## iPad (Kev, 11 Oct)

One page, one URL. At 740px and wider (iPad portrait and up) every tab shows in one row (no More), moves, folders, ideas and places go two-up, the map and sketch pad grow, and at 1100px (iPad landscape) the Field Notes contents sit beside the page. Check new features at 430, 820 and 1180 wide before publishing.

## Picture guides

A lesson can carry `guide`: a claude.ai artifact URL for a visual companion (cards, diagrams). The lesson card shows a "Picture guide" button next to Listen. The first one is the Chess Field Guide (https://claude.ai/artifact/4CZut4F6M57NsZgdeSTXT8) on `ep3-chess`, built by `employees/atlas/episodes/chess/guide/build_guide.py`. It has six piece trading cards (2.5 x 3.5 in when printed) plus setup, check, checkmate, stalemate, castling and the four-move trap. The printable copy is `chess-field-guide.pdf`.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light on Eden Office. Keep the task line free of anything about the children's details or family matters.
