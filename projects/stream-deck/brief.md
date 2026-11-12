# Stream Deck: how to make it earn its place (Q, 12 November 2026)

Kev, 12 Nov: "research how to truly leverage my Elgato Stream Deck. 1) It's not designed beautifully, so I'd like Marlowe to have some input. 2) I'm not using it a ton throughout the day. I would like to integrate it into my day more."

Marlowe's design direction and key mockups are in `design/` (see the last section). This page is the function and integration research.

## The short answer

A Stream Deck gets used when the keys change with what Kev is doing, show something live, and save him a decision. It goes quiet when it is a fixed grid of shortcuts he has to remember to reach for. Most of what follows works today with no build. A few pieces need a small build from me. Two things (a press-and-hold voice key and time-of-day profile switching) I could not confirm from the research and need a ten-minute test at the desk.

## What the research found (and where I could not find anything)

| Topic | What is solid | Source |
|---|---|---|
| Profiles, multi actions, folders | A profile is a set of keys for one context. A multi action runs several steps from one key (open an app, wait, run a shortcut or command). A folder is a second layer of keys. Elgato suggests folders on a 15-key deck. | [Elgato: how to be more productive](https://www.elgato.com/explorer/products/stream-deck/how-to-be-more-productive-with-stream-deck/) |
| Smart Profiles | The deck switches profile by the app in focus. Catch: it only works while the Stream Deck software window is minimized. It switches by app, not by time of day. | [Elgato: smart profiles](https://www.elgato.com/ca/en/explorer/products/stream-deck/smart-profiles-stream-deck/) |
| Live calendar keys | Two marketplace plugins do this. Calendar Scout shows the next Google or Outlook event on a key, joins Zoom, Meet or Teams in one press, and shifts the key color as the meeting nears (needs Stream Deck software 7.0 or later). AgendaDeck ($4.99) has a Join action and asks only for read-only calendar access. | [Calendar Scout](https://marketplace.elgato.com/product/calendar-scout-548abaef-5c0e-409e-9efd-b777795d8254), [AgendaDeck](https://agenda-deck.pages.dev/) |
| Keys that show live data | Several marketplace plugins call a web address and put the answer on the key (title, icon, state), with polling. Stateful Executor (open source, Mac) switches a key's title and icon from a JSON field in the response. API Monkey and API Request do similar. I found no ready-made plugin that listens for a push from outside. | [Stateful Executor](https://github.com/pandomic/stream-deck-stateful-executor), [API Monkey](https://marketplace.elgato.com/product/api-monkey-754d958d-1c8e-4734-bbc3-b01ab914e3bb) |
| Timers and focus | The built-in timer can sit on a key and show the time left. Third-party plugins add Pomodoro. Keys can run Apple Shortcuts and keyboard shortcuts, so a Mac Focus mode can ride along with a key. | [Elgato: best productivity plugins](https://www.elgato.com/explorer/products/stream-deck/best-stream-deck-plugins-for-productivity/) |
| Voice | Wispr Flow starts when Fn is held on a Mac. Elgato publishes a guide for hands-free AI prompting with a foot pedal, which implies a Stream Deck key can send the same trigger. | [Elgato: foot pedals for AI prompting](https://www.elgato.com/explorer/products/stream-deck/foot-pedals-for-ai-prompting/) |
| Key images | Key icons are 144 x 144 pixels, square. Larger images are scaled. PNG, JPEG, GIF, WEBP and animated WEBP are accepted. Elgato advises one palette, one art style, one set of proportions across a set. | [Elgato: icons](https://www.elgato.com/explorer/products/stream-deck/customize-stream-deck-with-icons/), [developer guidelines](https://docs.elgato.com/guidelines/streamdeck/plugins/images-and-layouts) |
| Models | Neo 8 keys; MK.2 15 keys; Stream Deck + 8 keys and 4 dials; XL 32 keys; a Plus XL with 36 keys and 6 dials appeared in one review. Prices disagree between sources, so check elgato.com. I do not know which one Kev has. | [PCGamesN](https://www.pcgamesn.com/best-stream-deck), [AppleInsider](https://appleinsider.com/articles/25/05/20/elgatos-new-stream-deck-lineup-goes-way-beyond-the-desktop) |

Not found: anything on why people stop using a Stream Deck, a Stream Deck key that holds down (for push-to-talk), or click-to-call from a recruiting CRM. The habit advice below is my judgment, not research.

## Why it sits idle (my read, from what Kev told us)

1. It shows the same keys all day. Nothing on it changes, so nothing pulls his eye.
2. Nothing on it is the thing he is about to do. His day is a rhythm (5:30 brief, 6 to 4 calls, 5:30 check-out, Sabbath), and the deck knows none of it.
3. The first key anyone reaches for has to be worth reaching for. Today the only key we planned is the Radar voice key (hit list, 11 Oct), and it was never built.

## The plan: three layers

### Layer 1: this week, no build (about an hour at the desk)

| Key | What it does | How |
|---|---|---|
| Talk to Radar | Opens the Claude app on the Radar project and starts voice | Multi action: open the app, short wait, send the voice shortcut. Needs a desk test. |
| Next meeting + Join | Shows the next event, color shifts as it nears, one press joins | Calendar Scout or AgendaDeck. Kev's call on the third-party plugin (read-only calendar access). |
| Day Board | Opens the Day Board page full screen | Website action. |
| Focus 50 | Starts a 50 minute block, Mac Focus on, mic and notifications handled | Built-in timer plus a Shortcuts action. |
| Dictate | Starts Wispr Flow | Hotkey action. Whether one press can hold the key for push-to-talk is unconfirmed; Wispr's toggle mode may do the job. Test. |
| Log a note | Opens a blank note or Crelate in a new tab | Open and Website actions. |
| Rest | The whole deck goes quiet from Friday sunset | A Sabbath profile with one calm key. Switching by time needs a tiny helper (Layer 2). |

### Layer 2: the habit part (a small build, Q, a few hours)

1. A profile that follows the clock: Recruiting (6 to 4, Monday to Friday), Ops, Family (KDTW Group), Rest (Friday sunset to Saturday sunset). Smart Profiles only follow apps, so a small helper (a Shortcut or script) switches the profile by time.
2. A "do this next" key: the top-left key always shows the one thing the Eden Daily says is next. Updated from a small file on the Mac that the Radar stand-up writes.
3. Quiet nudges: one key's color changes when something needs him (the 5 minute meeting warning, the 11:30 Friday scorecard pull, the check-out at 5:30). Calm until then.

### Layer 3: later, needs a decision on cost

1. Call outcome keys: after a CloudTalk call, one press tags it (Connected, Left voicemail, No answer, Do not call). CloudTalk's connector can add tags, but a key needs a small web address to call, which means a hosted piece. Spend, so it goes through QC.
2. A Stream Deck + with dials: volume, scroll, a 15-RP-a-day dial. Only if Kev's deck is that model or he wants one.
3. A custom plugin for live Eden numbers on keys (RPs today, dials today). The data exists on the Command Center and Round Table; the plugin would be the work.

## Risks and rules

- Anything that writes (tags a call, sends a message, changes a record) goes through QC. Layer 1 and 2 only open, show and start.
- Third-party plugins read Kev's calendar. Read-only scope is stated by AgendaDeck; I have not audited either plugin. Kev decides.
- The deck sits on Kev's desk, where visitors see it. No client names, no pay and no phone numbers on a key.
- Sabbath: nothing on the deck should offer work from Friday sunset to Saturday sunset.

## Kev's answers, 12 Nov 2026 (photo of the Boise desk)

- Deck: **Stream Deck +** (8 LCD keys in 2 rows of 4, a touch strip under them, 4 dials). Mac only.
- One key a day: **Radar's chat or the Command Center page.** Radar is a chat, not voice dictation. No "new Claude chat" key, only Radar.
- Do not pay for AgendaDeck. Build free first.
- Words under the icons: yes. Simpler icons, more on brand.
- Loves the Zoom mute, camera and share keys. Wants a breakout rooms key.
- Wants desktop jumping by hot key, especially the split-screen desktop with the Eden Daily and Google Calendar.
- Wants the strip and dials used.

## Revised function plan (free)

| Need | Free way | What I could and could not confirm |
|---|---|---|
| Radar | Open Website action to Radar's chat link | Needs the link from Kev (I could not find it in the repo). |
| Command Center | Open Website action to https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW | Straightforward. |
| Zoom mute, camera, share | Elgato's Zoom plugin, which Kev already uses; make it a Smart Profile that swaps in when Zoom is in front | Smart Profiles only run while the Stream Deck window is minimized ([Elgato](https://www.elgato.com/ca/en/explorer/products/stream-deck/smart-profiles-stream-deck/)). |
| Zoom breakout rooms | Check Zoom Settings, Keyboard Shortcuts at the desk. If there is no shortcut, a Shortcuts action that clicks the toolbar button, which needs Accessibility permission and is fragile | I searched and found no breakout shortcut. Unconfirmed. |
| Jump to a desktop | macOS Mission Control shortcuts (Control plus a number), sent by a Hotkey key | Full-screen spaces get no number, so Control plus a number will not reach a full-screen or split-screen space ([note](https://benji011.github.io/til/2024-06-30-on-osx-you-can-create-keyboard-shortcuts-to-switch-between-a-specific-desktop)). Kev's Calendar desktop looks like one. Workarounds to test: install Google Calendar as its own Chrome app and use an Open App key, or step with Control plus the arrow keys. |
| Next meeting on a key and the strip, with Join | A free build: Google Calendar can give each calendar a private read-only address; a small Stream Deck plugin (Elgato's SDK is free) reads it and draws the key and strip | From my own knowledge of Google Calendar, not from this research. The private address is a secret, so it lives only in the plugin settings on Kev's Mac, never in the repo. Needs a short desk test. |
| Dials | See Marlowe's v2 for the final choice. Candidates: switch desktop, volume, focus length, step the Day Board a day (the Day Board already answers the arrow keys) | Volume is built in. I could not confirm the strip's exact pixel size or Elgato's full built-in dial list from search, so treat 800 x 100 as approximate. |

## Still open

1. The link to Radar's chat (paste it, or tell me which project it lives in).
2. Which calendar the next-meeting key should read (Kev - Eden, or also the personal one).
3. OK for me to build the free plugin? I can write and test the logic here; the install and the first run happen on your Mac.

## Marlowe's design input

Direction: a matte warm black panel where nearly every key looks the same nearly all day. Brightness carries meaning: a key that is on turns cream (as the Day Board does 15 minutes before a meeting), a key that is off fades, and the only color on the deck is a small brass dot and line on a key that needs you. Home page: top row to glance at (Next meeting, Today, Sabbath), middle row folders (Recruiting, Family, Tools), bottom row to press (Join, Talk to Radar, Note, Focus, Call). Rest starts only on press-and-hold. Files: `design/design-direction.md`, `design/layout-grid.md` (also covers the 32-key XL and the Stream Deck +), `design/contact-sheet.html` and `.png`, eight key faces as SVG, and `design/gen.py` to regenerate them. Marlowe assumed the deck sits just in front of the keyboard and used the KDTW Group name.
