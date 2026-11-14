# Workshop: Kev's Sabbath study room

The workshop is a private page (an artifact only Kev can open, https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6, published 31 Oct 2026; source `projects/barny-workshop/workshop.html`) where Kev reads, journals, studies the Word and the charts we have built, and looks ahead on the Sabbath. It is lighter than Atlas's desk: research and learning, not a game. Seeds live in `employees/barnabas/workshop/seed/` as generic data (no private content).

## Prep (by Friday 1:50pm, before sunset)

1. Choose the Sabbath passage from Kev's Romans spine, or a rest passage tied to it, and say why. Never infer his place from private journal content; ask, or read Radar's check-out line if he points you to it.
2. Write the session as `sabbath-<date>.json` in the seed shape (passage, setting, observe, words, crossRefs, reflect, practice, pray, journalPrompts, carry). Follow `skills/study-guide.md`: quote ESV only if checked this session, otherwise reference and link; grade every claim; word notes only from a lexicon read this session, else mark them pending.
3. Offer the next study from `next.json`, recommendation first. Push nothing into the Sabbath. When Kev opens the workshop or a session on Saturday to study, study with him fully (Kev, 14 November 2026).

## Study series (Kev, 14 November 2026)

Kev asked to complete a study on the page and keep going through a book in the same layout. A Sabbath doc may carry `study` (a `studies` id) and `session` (its number), plus optional `sections` [{heading, body, grade}] rendered after the setting. The This Sabbath room opens on the first session in the series Kev has not completed, shows the series as chips, and ends with **Complete this study**, which ticks `progress.studies[study][session]` (the same ticks as the Studies room) and moves to the next session. After the last session the button becomes **Ask Barny for the next chapters**, which sets `choices.more` to the study id.

At the start of every session, read Kev's `choices` doc: if `more` names a study, set out its next three or four sessions in the same shape (doc id = the planned Saturday's date), add them to the `studies` doc's sessions, check every ESV quote this session, then clear `more` (keep `next`). The Hebrews series seeds live in `workshop/seed/hebrews/`.

## Filing content

File with ArtifactData on https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6 into these collections: `sabbath` (doc id = the Sabbath's date, YYYY-MM-DD; the page shows the latest), `studies` (with `order`), `people`, `next` (with `order`, recommendation at 0), `podcasts` (with `order`; add `script` and `audio` links when ready, `status` idea|script|ready), `charts` ({title, kind, about, link, order}). The framework is the doc `meta/framework` ({intro, rhythm [{step, minutes, what}], streams}). Use "set" for new docs and pin updates with if_version.

Kev's own data sits under `data/users/<his id>/`: journal entries (`j-<time>`: kind, text, ref, prompt, sabbath, at, notion), `progress` (sessions he has ticked) and `choices` (`next`: his pick for the next study). Read `choices` and `progress` when planning; they hold no private content. Never touch the journal collection to write; only read it as below. Podcast audio and scripts come later; any paid voice credits need Kev's yes (QC `spend`).

## Who needs prayer? and podcasts (Kev, 14 November 2026)

- **Who needs prayer?** is a Rhythm-style widget that stays open in the left rail under the menu on every room (Kev, 14 Nov); the full list with answered prayers is the room "Prayer list and answers". The rail opens with This Sabbath as the title line and the other rooms in a collapsible "Rooms" menu. Entries are `data/users/<his id>/p-*` ({who, for, started, days [YYYY-MM-DD he ticked], answered, answeredAt, answer}), private to Kev like the journal. Barny never reads, copies or summarises them unless Kev brings them into a session, and they never go to the repo, a ledger row, a ticket or the Sunday note.
- **Podcast widget** (top of the right column on This Sabbath; Kev, 14 Nov: no voice names, just Play or Pause, back and forward 15 seconds, Make a note (saved to the journal with the time stamp) and Generate new podcast). Generate opens a pop-up brief (themes, focus-area chips from the session sections, direction, ideal length 5 to 20 minutes, about 150 words a minute); the brief is saved on the episode as `brief`. It asks Claude, through the page's `sample` capability, for a seven-minute BARNY and ATLAS dialogue on the session. The prompt allows ESV quotation only from the session's checked `readAloud`, and requires DISPUTED points to be shown fairly. The script saves to `data/users/<id>/ep-*` ({title, ref, sabbath, script, at, studio}) and plays with the browser's speech voices. Kev vets each voice in the Podcasts room (`voices` doc).
- **Reading episodes without touching private entries:** never list `data/users/<id>` (a listing returns prayer and journal entries too). Query it with `where: [["kind","==","ep"]]` only; every episode carries `kind: "ep"`. While rendering, set `studio: "rendering"` (the page shows a soft red "Recording" light), then `audio` and `studio: "done"`.
- **Podcast library** (the Podcasts room; Kev, 14 Nov: no voice samples). Episodes are filed in collapsible folders by study series, each with its Notes, Concepts and Responses (journal entries carrying `ep` and `tag`), the script and a delete link. Make a note on the player files a Note under that episode.
- **Voices and audio (Kev, 14 Nov 2026: "use the 11 labs voices"):** no device voices. The Podcasts room plays ElevenLabs samples (`projects/barny-workshop/voices/*.mp3`, published at `voices/`) and Kev picks one voice for Barny and one for Atlas (`voices` doc {barny, atlas}: voice ids; Barny is J Thomas, `f5gk6ENs9vgDBvfkTj7e` (Kev, 14 Nov 2026); Atlas defaults to Michael Moody, `PerZoH0r6nxBZXCoIPpv`). **Render with ElevenLabs** sets `studio: "requested"` on an `ep-*` doc. In session, Barny reads the counter (`/v1/user/subscription`), renders the script line by line in the chosen voices (the stitch in `employees/atlas/tools/render_eleven.py`), publishes the MP3 as `files/episodes/<ep id>.mp3`, and sets `audio` on the doc. About 6,000 characters per episode on the paid Creator plan. If fewer than 20,000 remain before the reset, ask Kev first.

## Publishing while Kev is in the page (Kev, 14 Nov 2026: "dont do a hard reset... the window closed")

The page hands its working state (open podcast brief, note, chosen session, room, scroll) to the next version through `window.claude.hot`, and the brief also saves to local storage as he types. Still, when Kev is actively working in the workshop, batch changes and publish once, not after every comment, and say in the reply that the page refreshed.

## Journal entries are Kev's

Entries live in the page's own store, private to Kev. Barny does not read them unless Kev is there with him in the session. Nothing from them goes into the repo, `memory/live/`, a commit message, a Radar ledger line or the Sunday note beyond a generic ask. In a session, work from what Kev brings.

## Copying to Notion (only when Kev asks)

On request, copy that session's entries to Kev's private Notion page for Barny: create it on first use as a private page (not in a teamspace), give Kev the link, and append each session under a dated heading. Allowed without QC per Kev (21 Oct 2026); any other external write still needs QC. Never the repo.

## Keeping it fair

Streams and people carry grades and discernment notes (Comer, Willard, BibleProject, saints). Present contested views fairly (`memory/seed/doctrine-map.md`) and send disputed questions to his pastor, Micah, or an elder.
