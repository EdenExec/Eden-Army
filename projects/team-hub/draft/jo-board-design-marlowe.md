---
org: eden
title: JO Board, Clean Redesign
---

# JO Board: clean redesign spec

**Decision:** replace the cork board with one ranked list. The sync is about rank, so rank is the spine: 50 JOs read top to bottom, not zig-zagged across client columns. A toggle regroups the same rows by client.

## 1. Layout

- **Toolbar:** toggle `By rank | By client` (existing `.btn[aria-pressed]`, last choice kept in `localStorage` inside try/catch), filter chips `Hot` and `1099`, `+ Add a JO` right.
- **By rank (default):** one `<ol>` of active and on-hold JOs, rank ascending, unranked last. A collapsed `<details>` "Closed out (n)" holds filled, closed and killed.
- **By client:** one `.folder` per client, header meta "4 open · 1 on hold", rows in rank order.

## 2. One row

| Col | Content | Width |
|---|---|---|
| Rank | `01` mono, or editor | 56px |
| Role | bold role; below, client · location in mono meta | 1fr |
| Lead | lead recruiter (first named, non-standby) | 120px |
| Age | `9d` on it | 56px |
| Leads | `12 leads` | 72px |
| Flags | Hot, 1099, status, No owner | auto |

Examples: `01 · Bench Project Manager · PB South · West Palm Beach FL · Evan`; `02 · Senior PM, science/tech · XL Construction · Nick`.

**390px:** rank column 48px; the body stacks role, then one meta line (client · location · lead · age · leads), then flags. No horizontal scroll. The row opens the existing dialog; toggles and rank controls stop propagation.

## 3. Status and staleness

| State | Treatment |
|---|---|
| Active | default ink |
| On hold | text `--mute`; `.chip.warn` "On hold"; condition clamped to one line |
| Filled | Closed out; `.chip.pos` "Filled" + date |
| Killed | Closed out; role `line-through` 1px, `--mute`; `.chip.neg` "Killed" + date |
| Going stale, 10 to 13 days (assumed) | age in `--warn` |
| Rotting, 14+ days (`ROT_DAYS`) | age `--neg` weight 700, "Rotate?" chip, `box-shadow: inset 2px 0 0 var(--neg)` |

## 4. Flags and rank editing

- **Fields:** new booleans `hot` ("Hot next week") and `partner` ("1099 partners"), saved through the existing write path. Hot replaces the derived Go chip; confirm with Kev.
- **Markers:** Hot = solid chip, `--ink` fill, `--paper` text, "HOT". 1099 = 1px `--gold` outline, `--gold` text. Editors get them as `aria-pressed` toggles (off: 1px dashed `--line`, `--mute`), 44px hit area; viewers see chips only.
- **Rank:** numeric input (`inputmode=numeric`, 44px) plus up and down buttons; typing 3 moves the JO to 3 and renumbers the rest on blur. No drag: unreliable on phones in a fast sync.

## 5. CSS values

- **Keep:** `--bg --paper --ink --mute --line --gold --gold-soft`, pos/warn/neg and `-bg`, `--sans --mono`, `--shade` (dialog backdrop only).
- **Drop:** every `--cork*`, `--frame*`, `--note*`, `--card`, `--card-rule`, `--pin*`. `.killq .yes` text becomes `--paper`; `.bnote` becomes `--gold-soft`, no shadow.
- **Add:** `--row-hover:#F4F0E8` for row hover and focus.

| Element | Value |
|---|---|
| List | `--paper`, 1px `--line`, radius 10px, no shadow |
| Row | padding 12px 16px, gap 12px, border-bottom 1px `--line`, min-height 52px |
| Rank | mono 13px, weight 600, `--gold`; Hot rows `--ink` |
| Role | Montserrat 14px, weight 700, line-height 1.3, clamp 2 |
| Meta | mono 10.5px, letter-spacing .6px, uppercase, `--mute` |
| Chips | existing `.chip` (mono 10px, radius 4px, padding 3px 7px) |
| Group header | 12px, weight 700, letter-spacing 2px, uppercase, `--mute` |
| Focus | 2px `--gold` outline, offset -2px |

No tilt, transforms or gradients; 120ms transition on background only. The partner board will read `partner: true`; nothing here publishes to it.
