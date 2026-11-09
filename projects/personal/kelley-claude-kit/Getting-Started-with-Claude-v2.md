<!-- Kev's personal note to Kelley (not Eden work). Cover: "Getting started with Claude · From Kev Williams · [date]". No Eden or KDTW mark. Jenny's wording pass, 9 Nov 2026; feature claims checked against Anthropic's docs (sources at the bottom, not for print). -->

# Getting started with Claude

From Kev Williams

Kelley, this is how I set mine up. Skim it once, pick one thing from the first week, and go build something. You'll pick up the rest fast.

## 1. Start with Projects

- A Project is its own workspace in Claude: its own chats, its own files (project knowledge) and its own project instructions. Everything in it is context for every chat inside it.
- Keep them broad. I started with one for work and one for home. Make one per task and you end up with dozens that each know nothing.
- A good first work Project: your role prompt (below), your brand guide, and the handful of docs you live in.

## 2. Load your brand first

- The first file I load into anything is the brand guide: logo use, colors, fonts and tone. After that, decks and one-pagers come out looking like you, not like a template.
- If JH Kelly has a brand guide you're allowed to use, start there.
- If not, write half a page yourself: your colors, your font, and three things your writing never does.

## 3. Train it with a role prompt

Paste this into your Project instructions and tune it through the first week:

> You are my operations-minded executive assistant, project manager and communications lead. Speak at an executive level: lead with the answer, then use short summaries and bullet points. No emojis. Be proactive and flag risks or next steps I didn't ask about. When I need to make a decision, use the 1-3-1 method: one problem, three options, one recommendation. When a job has several parts, suggest how to split it up across separate agents.

When it gets something wrong, correct it like you would a sharp new hire, then put the fix in the instructions so you only say it once.

## 4. Claude Code: your first build

- Easiest way in is the Code tab in the Claude desktop app. Or install it in a terminal, type `claude`, and sign in when it asks.
- Pick one small, real project, like a run-of-show dashboard for an event or a project status widget. Give it its own folder and open Claude Code there.
- Run `/init` once. It writes a starter CLAUDE.md, the file Claude reads at the start of every session in that folder. Put your rules in it and keep it short.

## 5. How to drive it

- For anything big, start in Plan mode (Shift+Tab cycles the modes). Read the plan, push back, then let it build.
- Early on, read what it's about to do before you approve it. That's how you learn what it's actually doing.
- Tell it what done looks like, paste errors word for word, point it at files with `@filename`, and type `/clear` between unrelated jobs.

## 6. Sub-agents, once you're comfortable

- A sub-agent is a specialist with its own instructions. It takes a side job in its own space and reports back, so your main chat stays clean.
- Easiest way to make one is to ask: "Make me a research agent that ...". Claude Code saves it in a `.claude/agents/` folder.
- That's how I ended up with a chief of staff agent and a team of specialists. Don't start there. Get one Project and one build working, then add agents for the jobs you keep repeating.

## 7. A sensible first week

- **Day 1:** Make your work Project with the role prompt and brand guide. Use it on real emails and docs that day.
- **Day 2:** Add three to five docs you use constantly. Notice what it still gets wrong and fix the instructions.
- **Day 3:** Set up Claude Code and build one small widget or dashboard with `/init` and Plan mode.
- **Day 4:** Make that build better and on brand. This is where it gets fun.
- **Day 5:** Write down the three tasks you repeat most. Turn the best one into a saved prompt or your first sub-agent.

## 8. Watch out for

- **Company data.** Check JH Kelly's AI policy before you paste anything confidential: bids, financials, employee or client info. Use the tools IT has approved, and ask if you're not sure.
- **Facts.** Check numbers, names and dates. It sounds just as sure when it's wrong.
- **Doing too much.** One solid Project and one working build beat ten half-built agents. Long chats wander, so start fresh when you switch topics.

## The starter folder

The folder that came with this has my role prompt, a brand guide template and a few files to steal from. Use what helps and toss the rest. Holler when you hit a wall.

Kev

---

<!-- Not for print. Docs checked 9 Nov 2026:
Projects, project knowledge, project instructions: https://support.claude.com/en/articles/9517075-what-are-projects
Desktop Code tab: https://code.claude.com/docs/en/desktop.md
Install, `claude`, sign-in prompt (/login is for switching accounts): https://code.claude.com/docs/en/quickstart.md
/init and CLAUDE.md loading: https://code.claude.com/docs/en/memory.md
Shift+Tab, Plan mode, approvals (newer versions may start in auto mode, so the guide no longer promises it always asks): https://code.claude.com/docs/en/permission-modes.md
@filename: https://code.claude.com/docs/en/common-workflows.md
/clear: https://code.claude.com/docs/en/quickstart.md
Sub-agents, .claude/agents/, create by asking: https://code.claude.com/docs/en/sub-agents.md
-->
