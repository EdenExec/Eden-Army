# Podcast episode (for the truck)

What it is: a 20 to 35 minute, two-voice conversation that teaches one subject from the base level, delivered as one MP3 with a one-page show sheet. Kev and G listen in the truck; G asks the questions in his head and hears them answered.

## The two voices

- **The Guide** (adult): warm, confident, plain-spoken. Knows the subject cold. Tells stories. Never lectures for more than 90 seconds without a question or a picture.
- **The Kid** (curious, roughly G's age in spirit): asks the question a sharp ten-year-old would ask, interrupts when something is unclear, guesses out loud, is sometimes right. Never dumb, never a prop.
- Names on the show sheet; in the audio they call each other by first names you choose and keep.

## Shape (write it as a script, then render)

1. Cold open, 30 seconds: a scene, a question or a surprising fact. No "welcome to the show".
2. The three big ideas, one at a time, each with: a picture in words, an example, the Kid's question, a story from a master of the craft.
3. A "wait, but" segment: the common misconception, taken apart.
4. "Try this on the trip": one thing to do or look for in the next hour (count something, spot something, argue something).
5. Close, 60 seconds: the Guide says the one sentence to remember; the Kid says it back in his own words; the Guide names next week's question.
6. Interview questions and answers (10) go on the show sheet for Kev to ask G later, or to record their own version.

## Script rules

- Spoken English. Contractions. Short sentences. Numbers rounded and compared to something ("about as long as a football field").
- No lists read aloud. No "firstly". No stage directions in the audio.
- Faith and the pillars appear where they belong, in the stories of the masters and in the close, never as a sermon.
- Everything fit for ten. Adult layers go to the show sheet for Kev.
- Length: 3,000 to 5,000 words for 20 to 35 minutes at a spoken pace.
- **Lead-ins at a speaker switch** (Kev, 14 Nov 2026: "we can totally see ai in it when the speakers switch. maybe when writing we try to lead sentences from an ellipses to give the ai voice time to shift."). Now and then the incoming speaker opens with a short spoken beat between ellipses, then the sentence: `KID: ...wait... he just left?`, `GUIDE: ...yep... we were reading Luke's account.` Vary the word (yeah, right, huh, okay, interesting, wait, hmm) and use it on roughly one turn in six to ten, never two turns in a row, so it never becomes a tic. ElevenLabs reads the ellipses as a short pause around the word (tested 14 Nov: a beat of about 0.3 to 0.5 seconds, no dead air). The easiest place is a line that already opens with one of those words: write `...okay... so` instead of `Okay, so`.

## Render

Three routes, in order. Record which one was used on the show sheet.

1. **Kev's Mac, best free voices (preferred).** Edge neural voices via `edge-tts` need a WebSocket, which the cloud proxy blocks, so the render runs on Kev's machine. Deliver `render.py` next to the script: it installs nothing but `edge-tts`, reads `script.md` (alternating `GUIDE:` / `KID:` lines), renders each line, stitches with ffmpeg (350 ms gaps between turns, 1.5 s at segment breaks, `loudnorm`), and writes `<slug>-episode.mp3`. One command: `pip3 install edge-tts && python3 render.py`. Default voices: Guide `en-US-AndrewMultilingualNeural` at `+3%`, Kid `en-US-BrianNeural` at `+5%`.
2. **Cloud fallback, works here today.** `gTTS` (Google Translate voices, HTTP, pass `REQUESTS_CA_BUNDLE=/root/.ccr/ca-bundle.crt`): Guide `tld='com'`, Kid `tld='com.au'` or `'co.uk'` so the two voices differ. Flatter than route 1 but a real episode in the truck. Same stitch as above. Always deliver this MP3 so the family has audio even if route 1 is never run.
3. **Paid voices** (ElevenLabs, OpenAI, Google Cloud TTS): a `spend` QC item with the per-episode cost. Never buy.

Check the duration with `ffprobe`; it should land between 20 and 35 minutes. Transcribe or spot-listen the first minute if you can.

## Deliver

The MP3 (via Artifact `files` or the Drive connector if small enough; else the file card), the show sheet PDF (title, the three ideas, the ten interview questions with answers, sources, "G's pick"), and the script as Markdown. Score against `rubrics/podcast.md` and say the score.

## Filing the episode (10 October 2026)

The finished MP3 goes into the Atlas Desk library, not the Eden Desk: publish it to the Atlas Desk URL with `files: {"files/<Name>-episode.mp3": <path>}`, set a `media` row and the lesson's `mediaId` (see `atlas-desk.md`). The Eden Desk carries only a link to the Atlas Desk's Listen tab (`#listen`).

## Family episodes: current rules (Kev, 11 Oct 2026; these override the length and render notes above for G's episodes)

- **Length:** 20 to 25 minutes, about 3,000 to 3,600 words. Check the duration with ffprobe; re-cut if it lands outside.
- **Who is in the room:** Atlas talks with Finn. G is in the room listening, often with something in his hands (a chess set, a fly box, a map). Atlas speaks to G by name two or three times an episode and gives him small jobs ("G, pick up a knight"); Finn can talk to him too. G never speaks a line; the audio is two voices only.
- **Running series:** fishing continues. Alternate the river with other subjects; every non-fishing episode closes on next week's question, and that question goes back to the river at least every other week.
- **Render route and credits:** ElevenLabs is approved for these episodes (`employees/atlas/tools/render_eleven.py`, voices in `memory/seed/learners.md`). Finn's voice is **Adam** (`s3TPKV1kjDlVtZbl4Ksh`, Kev 14 Nov 2026: "Adam can be the new version of Finn"); he is still called Finn in the audio. The render script uses Adam and Atlas (Michael Moody) by default and keeps each line's segment, so a voice swap can re-render only Finn's lines (`--redo KID`). Before every render, read the subscription counter and note characters left and the reset date in the report. A 22-minute episode costs about 15,000 to 16,000 characters. If fewer than 20,000 remain before the reset, don't render: deliver the script, the NotebookLM source pack, and the gTTS fallback, and tell Kev.
- **NotebookLM route (free):** with every episode, deliver `notebooklm-source.md` next to the script: the teaching points, the stories, the facts with their sources, and a one-line Audio Overview customization naming Atlas, Finn and G. Kev pastes it into NotebookLM for a second, free version.
- **Facts:** every claim that could be wrong is checked against a source opened that session and listed on the show sheet. Reword anything you can't source.
