---
org: kdtw
title: Stream Deck, design direction
---

# Stream Deck, design direction

**The deck should feel like a small, dark instrument panel: calm almost all day, and it wakes up only when something needs Kev.** It borrows the Day Board's palette and its one big habit: when a meeting is close, the key turns cream.

## The feel

- A matte black panel on a desk, warm rather than blue-black. Think a vintage dashboard at night, not a gaming rig.
- Most keys look the same most of the time. Change is the signal, so it has to be rare.
- Five keys stay blank on purpose. Empty space is part of the design and a guard against mis-presses.

## Icons and type

| Element | Rule |
|---|---|
| Glyph | One per key, simple line drawing, 5 px stroke on the 144 px key, round ends and corners (7 px radius on shapes). Sits in the top two-thirds. |
| Label | One word in capitals under the glyph, Montserrat semi-bold, 15 px, wide letter spacing, in a warm grey. |
| Numbers | Montserrat, large, even-width figures so a countdown does not jitter. |
| Background | Full-bleed square. The device rounds the corners itself. |

## Key states

| State | Background | Glyph | Extra |
|---|---|---|---|
| Idle | Warm charcoal #14130E | Cream #F2EEE4 | Grey label |
| On / active | Cream #F2EEE4 | Ink #14130E | The whole key inverts, as the Day Board does |
| Needs attention | Charcoal | Cream | One brass dot with a count, one brass line along the bottom (#D9B45E) |
| Off / disabled | Panel black #0C0B08 | Faint #3A362B | Fades into the panel |
| Sabbath rest | Panel black | Dim warm grey #8C8576 | Sunset glyph, "until Sat sundown" |

**Colour carries meaning through brightness, not hue.** Brighter means "act now", dimmer means "not now". Brass is the only colour, and it means one thing: something is waiting for you.

## Three kinds of key

- **Action keys** lead with a glyph. Press, it happens.
- **Folder keys** lead with a word, with a small tab bar top left and a chevron bottom right. No glyph, so they never look like an action.
- **Live keys** lead with a number: small time at top, big countdown, short title, and a thin progress line that fills as the moment nears. A small dot top right marks the key as live.

## Five rules

| Do | Don't |
|---|---|
| One glyph and one word per key | Stack two ideas or a sentence on a key |
| Use inversion (cream) for "now" | Use red, green or blue for state |
| Keep brass for "waiting for you" only | Use brass for decoration or branding |
| Leave keys blank as breathing room | Fill every key because it is there |
| Make dangerous keys two-step (Call opens a pad) | Put a one-press send next to Join |
