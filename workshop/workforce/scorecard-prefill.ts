// node workshop/workforce/scorecard-prefill.ts [--week-ending 2026-11-05] [--now 2026-11-06T00:00:00Z] [--out file.json] [--all yes]
//
// Read-only. Counts each recruiter's Crelate activity for the Friday Scorecard's scored week, Friday 00:00 to
// Thursday 23:59 Pacific (or to now, if the week isn't over), with the same rules as the Round Table board
// (owner credit, unique contacts per metric). Prints and writes counts only: never a candidate name, a phone
// number or the API key. Dials come from CloudTalk and placements from the Rev Report, not from here.
import "../lib/env.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { addDays, countActivities, daysAtGoal, makeClient, ptDate, ptMidnightUtc, weekdayOf, ROSTER, type Windows } from "./recruiting-board.ts";

const flag: Record<string, string> = {};
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) flag[args[i]!.replace(/^--/, "")] = args[i + 1]!;
const key = process.env.CRELATE_API_KEY;
if (!key) { console.error("CRELATE_API_KEY is not set in this environment."); process.exit(1); }

const nowArg = flag.now ? Date.parse(flag.now) : Date.now();
const today = ptDate(nowArg);
// The Thursday that ends the scored week: today if Thursday, yesterday if Friday, else the coming Thursday.
const weekEnd = flag["week-ending"] ?? addDays(today, (4 - weekdayOf(today) + 7) % 7 === 6 ? -1 : (4 - weekdayOf(today) + 7) % 7);
const weekStart = addDays(weekEnd, -6);
const fromMs = ptMidnightUtc(weekStart);
const toMs = Math.min(nowArg, ptMidnightUtc(addDays(weekEnd, 1)));

// Only the "this" window matters here; the other windows are pushed out of range so nothing else is counted.
const far = fromMs - 365 * 864e5;
const w: Windows = {
  weekStart, lastStart: weekStart, lastEnd: weekStart, today: weekEnd,
  thisFromMs: fromMs, nowMs: toMs, lastFromMs: far, lastToMs: far, lastSameToMs: far,
  monStart: weekStart, monFromMs: fromMs, todayFromMs: toMs,
  priorMonStart: weekStart, priorMonFromMs: toMs + 1, fourStart: weekStart, fourFromMs: toMs + 1,
};

const client = makeClient(key);
const after = new Date(fromMs).toISOString().replace(".000Z", "Z");
const [activities, jobs] = await Promise.all([client.activities(after), client.jobs()]);
const counts = countActivities(activities, jobs, [], w);
const recruiters = ROSTER.filter((p) => p.group === "recruiter" && !p.hidden && p.ids.length);
// --all yes adds leadership rows (Nick, Kev) after the team total; they never count in the team row.
const leaders = flag.all ? ROSTER.filter((p) => p.group === "leadership" && p.ids.length) : [];
const rows = recruiters.map((p) => {
  const c = counts.persons[p.slug]!;
  return { name: p.name, rps: c.this.rps, days_at_15: Math.min(5, daysAtGoal(c.rpsByDay)), ftis: c.this.ftis, mps: c.this.mps, ptcs: c.this.ptcs, resumes: c.this.resumes, submittals: c.this.subs };
});
const leadRows = leaders.map((p) => { const c = counts.persons[p.slug]!; return { name: p.name, rps: c.this.rps, days_at_15: Math.min(5, daysAtGoal(c.rpsByDay)), ftis: c.this.ftis, mps: c.this.mps, ptcs: c.this.ptcs, resumes: c.this.resumes, submittals: c.this.subs }; });
const team = rows.reduce((t, r) => ({ rps: t.rps + r.rps, ftis: t.ftis + r.ftis, mps: t.mps + r.mps, ptcs: t.ptcs + r.ptcs, resumes: t.resumes + r.resumes, submittals: t.submittals + r.submittals }),
  { rps: 0, ftis: 0, mps: 0, ptcs: 0, resumes: 0, submittals: 0 });
const result = {
  source: "Crelate API v3, read-only, board counting rules",
  window: `${weekStart} 00:00 to ${ptDate(toMs - 1)} ${toMs < ptMidnightUtc(addDays(weekEnd, 1)) ? "(so far)" : "23:59"} Pacific`,
  pulled_at: new Date().toISOString(), recruiters: rows, team, leadership: leadRows,
};
if (flag.out) { mkdirSync(dirname(flag.out), { recursive: true }); writeFileSync(flag.out, JSON.stringify(result, null, 2) + "\n"); }
console.log(`Scored week ${result.window}`);
console.log("Name     RPs  Days15  FTIs  MPs  PTCs  Resumes  Subs");
for (const r of rows) console.log(`${r.name.padEnd(8)} ${String(r.rps).padStart(4)} ${String(r.days_at_15).padStart(7)} ${String(r.ftis).padStart(5)} ${String(r.mps).padStart(4)} ${String(r.ptcs).padStart(5)} ${String(r.resumes).padStart(8)} ${String(r.submittals).padStart(5)}`);
console.log(`Team     ${String(team.rps).padStart(4)}         ${String(team.ftis).padStart(5)} ${String(team.mps).padStart(4)} ${String(team.ptcs).padStart(5)} ${String(team.resumes).padStart(8)} ${String(team.submittals).padStart(5)}`);
