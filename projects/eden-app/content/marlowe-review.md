# Eden Hub v1: design pass (Marlowe, 19 Nov 2026)

**Result:** CSS-only pass on `hub/eden-hub.html`. No ids, data attributes or script touched. Q's browser test: PASS, 43 of 43 checks, at 390, 768 and 1280, light and dark. Not published; Q republishes.

## What changed

| Area | Change |
|---|---|
| Header | Clearer order of importance: EDEN PARTNER GROUP smaller and wider-spaced, the "Eden Hub" title larger in bold italic. More space under the rule. |
| Tabs on a phone | Up to 600px the tabs form a 3-column grid, so all nine show at once with no hidden sideways scroll. The selected tab is a solid ink cell. Recruiters get 2 rows, partners 1. |
| Tabs on desktop | The tab bar stays at the top while you scroll, clear of the phone's safe area. |
| Tiles | More padding (20px on desktop, 16px on a phone). The header stamp now sits on the right next to the +/− toggle; before, it floated in the middle. |
| Scoreboard | Double rule across the top. Positions are numbered with pure CSS. Numbers are 17px tabular mono. On a phone the player column stays put while the wide board scrolls. |
| Stats | Numbers are larger (28px mono) and the cells have more air. |
| "Coming" states | A quiet tinted panel with a left rule, in Montserrat instead of a dashed typewriter box. Still plainly a placeholder. |
| Message of the day | Larger, set off by an ink rule on the left. |
| Links | Underlines run under the text only (before they ran the full row width), with a small ↗ to show the link opens elsewhere. |
| Comms on a phone | The channel row uses an underline for the selected channel instead of a side rule. |
| Colour | State colours (done, warning, problem) are muted and pass contrast in both themes. The dark-mode amber and green are no longer bright. |
| Cross footer | Taller Latin cross, set into the closing rule so the line breaks around it. The verse is balanced and weighted. |

## Five ideas for v2 and for Cody

1. **Home as a two-column dashboard on desktop.** Welcome and message of the day sit on the left, the scoreboard on the right, so it is above the fold at 1280. This needs a layout wrapper in `viewHome`, which is Q's change.
2. **Scoreboard motion, Augusta style.** When a number changes, its cell flips once, with no animation loop. Add a "Leader" plate and an RP-standard marker line in the RPs column.
3. **Collapse long boards by default.** The JO board runs to 40 rows. Show the top 10 with an "All 40" toggle, and save the setting per person.
4. **One design system for every Eden artifact.** The Hub, Command Center, Round Table and Day Board share tokens today by copy. Cody could own a single token and component sheet so every surface stays in step.
5. **Install it as a phone app.** Kev opens this on his phone. A home-screen icon, a bottom tab bar for the five tabs used most, and a native Sabbath rest screen would make it feel like Eden's own app. Rhaven-grade polish is where Cody adds the most.

## For Q

- The Notes tile may still open from a value saved earlier in localStorage. That is expected, not a bug.
- The fonts are blocked in the test harness, so its screenshots show the fallback font. Check one screen in claude.ai after you publish.
