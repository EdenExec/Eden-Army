// npm run card-pdf -- --dump <dir> --week 2026-10-19 [--board projects/workforce/board/current.json] [--out deliverables/scorecards]
// Kev, 23 Oct 2026: the Round Table cards come to him as a PDF at the end of the day, and anyone who needs a PIP is flagged with it.
// <dir> is an ArtifactData out_dir holding people/<slug>.json and people/<slug>/cards/<week>.json from the Round Table database.
// Writes <out>/round-table-<week>.html and .pdf (one team page, then one page per person) and prints who is flagged for a PIP.
// Work only: never a phone, comp or anything private beyond Kev's own coaching notes, which this PDF is for.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

export type Card = { d?: boolean[]; w?: boolean[]; cv?: boolean[]; kev_score?: number; burnout?: number; pip?: boolean; pip_reason?: string; lived_out?: string; autopsy?: string; wins?: string; next_week?: string; coach_notes?: string; needs?: string; advice?: string; updated?: string; week_of?: string };
type Person = { id: string; name?: string; role?: string; group?: string; sort?: number };
type Counts = Partial<Record<"rps" | "mps" | "resumes" | "ptcs" | "subs" | "ftis", number>>;
type BoardRow = { slug: string; this?: Counts; last_same?: Counts; last_full?: Counts; rp_by_day?: Record<string, number> };

export const DAILY = ["Executing on the weekly plan", "Don’t chase the day", "Activity / Inventory / Skill", "Power Hours hit", "Reviewed my work", "Calendar set for tomorrow", "Showed up sharp"];
// "Push your job orders forward" added 23 Oct (Kev). Stored last (w[7]) so saved ticks keep their boxes; shown second, as on the live card.
export const WEEKLY = ["Audit your inventory", "Build your own book", "Autopsy your week", "Grew toward my next role", "Replied in a timely manner", "Took training seriously", "Sharp all week", "Push your job orders forward"];
export const WEEKLY_ORDER = [0, 7, 1, 2, 3, 4, 5, 6];
export const WEEKLY_ASK: Record<number, string[]> = { 2: ["Are you building your depth charts?", "Are you pulling out MPCs to market?", "Are you telling the truth and feel good about the work?"] };
export const CARD_BOXES = 35 + WEEKLY.length;
export const PILLARS = ["Righteousness", "Winning", "Accountability", "Discipline", "Transparency", "Growth", "Execution"];

export const boxes = (c: Card) => [...(c.d ?? []), ...(c.w ?? [])].filter(Boolean).length;
// Cards before the week of 19 Oct were 42 boxes (no "Push your job orders forward"), so they score out of 42, as on the live card.
export const cardTotal = (c: Card) => (String(c.week_of ?? "9") < "2026-10-19" ? 42 : CARD_BOXES);
export const score = (c: Card) => (typeof c.kev_score === "number" ? c.kev_score : Math.round((boxes(c) / cardTotal(c)) * 100));

// Health stays off paper (standing rule): a sentence naming a health matter is withheld.
const HEALTH = /\b(migraines?|sick|ill(ness)?|flu|covid|fever|doctor|hospital|surgery|injur(y|ed)|pregnan\w*|therap(y|ist)|medication|diagnos\w*)\b/i;
export const scrubHealth = (s?: string) => (s ?? "").split(/(?<=[.!?])\s+/).map((x) => (HEALTH.test(x) ? "[health note withheld]" : x)).join(" ");
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
const tick = (b?: boolean) => `<span class="bx${b ? " on" : ""}">${b ? "✓" : ""}</span>`;
const n = (v?: number) => (typeof v === "number" ? String(v) : "–");

/** What to watch, the same rules as the live card: down 15%+ on last week to the same point, under the 90% win line, two weeks under. */
export function watch(row: BoardRow | undefined, card: Card | undefined, prev: Card | undefined): string[] {
  const out: string[] = [];
  const t = row?.this ?? {}, l = row?.last_same ?? {};
  for (const [k, label] of [["rps", "RPs"], ["ptcs", "PTCs"], ["subs", "Submittals"], ["ftis", "FTIs"]] as const) {
    const a = t[k], b = l[k];
    if (typeof a === "number" && typeof b === "number" && b > 0 && a < b * 0.85) out.push(`${label} down ${Math.round((1 - a / b) * 100)}% on last week to the same point (${a} vs ${b}).`);
  }
  const filled = (c?: Card) => !!c && (boxes(c) > 0 || typeof c.kev_score === "number");
  if (card && filled(card) && score(card) < 90) out.push(`Card at ${score(card)}%, under the 90% win line.`);
  if (card && prev && filled(card) && filled(prev) && score(card) < 90 && score(prev) < 90) out.push("Two weeks in a row under 90%: PIP conversation?");
  return out;
}

function personPage(p: Person, c: Card, row: BoardRow | undefined, prev: Card | undefined, week: string): string {
  const t = row?.this ?? {}, l = row?.last_same ?? {};
  const days = Object.entries(row?.rp_by_day ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const dayOf = (i: number) => days.find(([d]) => new Date(`${d}T12:00:00Z`).getUTCDay() === i + 1)?.[1];
  const w = watch(row, c, prev);
  const fld = (label: string, v?: string) => `<div class="fld"><b>${label}</b><p>${esc(scrubHealth(v)) || "<span class=mute>—</span>"}</p></div>`;
  return `<section class="page">
<header><span>EDEN PARTNER GROUP</span><span>Weekly Scorecard · Round Table · week of ${esc(week)}</span></header>
<div class="ph"><h1>${esc(p.name ?? p.id)}</h1><span class="role">${esc(p.role ?? "")}</span><span class="sc">${score(c)}%<small>${typeof c.kev_score === "number" ? " Kev's score" : ` ${boxes(c)} / ${cardTotal(c)} boxes`}</small></span>${c.pip ? '<span class="pipflag">PIP</span>' : ""}</div>
<table><tr><th class=l>Crelate</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>RPs</th><th>MPs</th><th>Resumes</th><th>PTCs</th><th>Subs</th><th>FTIs</th></tr>
<tr><td class=l>This week</td>${[0, 1, 2, 3, 4].map((i) => `<td${(dayOf(i) ?? 0) >= 15 ? " class=b" : ""}>${n(dayOf(i))}</td>`).join("")}<td class=b>${n(t.rps)} / 75</td><td>${n(t.mps)}</td><td>${n(t.resumes)}</td><td>${n(t.ptcs)}</td><td>${n(t.subs)}</td><td>${n(t.ftis)}</td></tr>
<tr><td class=l>Last wk, same point</td><td colspan=5></td><td>${n(l.rps)}</td><td>${n(l.mps)}</td><td>${n(l.resumes)}</td><td>${n(l.ptcs)}</td><td>${n(l.subs)}</td><td>${n(l.ftis)}</td></tr></table>
${w.length ? `<div class="watch"><b>Watch</b><ul>${w.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
<table class=grid><tr><th class=l>Daily</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>✓</th></tr>
${DAILY.map((m, i) => `<tr><td class=l>${m}</td>${[0, 1, 2, 3, 4].map((j) => `<td>${tick(c.d?.[i * 5 + j])}</td>`).join("")}<td>${[0, 1, 2, 3, 4].filter((j) => c.d?.[i * 5 + j]).length}/5</td></tr>`).join("")}</table>
<div class="two"><table class=grid><tr><th class=l>Weekly</th><th>✓</th></tr>${WEEKLY_ORDER.map((i) => `<tr><td class=l>${WEEKLY[i]}${WEEKLY_ASK[i] ? `<small>${WEEKLY_ASK[i].join(" ")}</small>` : ""}</td><td>${tick(c.w?.[i])}</td></tr>`).join("")}</table>
<table class=grid><tr><th class=l>Core values</th><th>Lived it</th><th>Fell short</th><th>Next wk</th></tr>${PILLARS.map((m, i) => `<tr><td class=l>${m}</td>${[0, 1, 2].map((j) => `<td>${tick(c.cv?.[i * 3 + j])}</td>`).join("")}</tr>`).join("")}</table></div>
<div class="three">${fld("Where I lived it out", c.lived_out)}${fld("Autopsy", c.autopsy)}${fld("Wins and blockers", c.wins)}${fld("Next week I will", c.next_week)}${fld("Burn-out (1–10)", typeof c.burnout === "number" ? String(c.burnout) : "")}</div>
<div class="coach"><b class="eb">Coach · Kev only</b><div class="three">${fld("Coaching notes", c.coach_notes)}${fld("Needs", c.needs)}${fld("Advice", c.advice)}</div>${c.pip ? fld("PIP: why", c.pip_reason) : ""}</div>
<footer><span>edenpartnergroup.com</span><span>${esc(p.name ?? p.id)}</span><span>EDEN PARTNER GROUP</span></footer></section>`;
}

const CSS = `@page{size:Letter;margin:0.45in}
*{box-sizing:border-box}body{margin:0;font:400 10.5px/1.4 'Montserrat','Helvetica Neue',Arial,sans-serif;color:#141412}
.page{page-break-after:always;display:flex;flex-direction:column;gap:9px;min-height:9.9in}
header,footer{display:flex;justify-content:space-between;font:600 8.5px/1 'Montserrat',sans-serif;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid #141412;padding-bottom:6px}
footer{border-bottom:0;border-top:1px solid #D9D4C8;padding-top:6px;margin-top:auto;color:#5E5B54}
.ph{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}h1{margin:0;font-size:24px;font-weight:800}.role{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#5E5B54}
.sc{margin-left:auto;font-size:22px;font-weight:800}.sc small{font-size:9px;font-weight:500;color:#5E5B54;margin-left:4px}
td.l small{display:block;font-size:7.5px;color:#5E5B54;font-weight:500}
.pipflag{border:1.5px solid #B03A2E;color:#B03A2E;font-weight:800;letter-spacing:.2em;padding:2px 6px}
table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #D9D4C8;padding:3px 4px;text-align:center;font-size:9.5px}
th{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:#5E5B54}.l{text-align:left}td.b{font-weight:700}
.bx{display:inline-block;width:13px;height:13px;border:1px solid #141412;line-height:12px;font-size:9px}.bx.on{background:#141412;color:#fff}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.three{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 12px}
.fld b{display:block;font-size:7.5px;letter-spacing:.12em;text-transform:uppercase;color:#5E5B54}.fld p{margin:2px 0 0;white-space:pre-wrap;font-size:9.5px}.mute{color:#9A958A}
.coach{border:1.5px solid #141412;padding:8px;display:flex;flex-direction:column;gap:6px}.eb{font-size:8px;letter-spacing:.14em;text-transform:uppercase}
.watch{border:1.5px solid #A8730F;padding:6px 8px}.watch b{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:#A8730F}.watch ul{margin:3px 0 0;padding-left:16px}
.team td,.team th{font-size:10px;padding:5px}`;

function teamPage(rows: { p: Person; c: Card; w: string[] }[], week: string, asOf: string): string {
  return `<section class="page"><header><span>EDEN PARTNER GROUP</span><span>Weekly Scorecard · Round Table</span></header>
<h1>Round Table · week of ${esc(week)}</h1><p class="role">Crelate ${esc(asOf)} · cards as saved by Kev</p>
<table class="team"><tr><th class=l>Name</th><th>Card</th><th>Boxes</th><th>Burn-out</th><th>PIP</th><th class=l>Watch</th></tr>
${rows.map(({ p, c, w }) => `<tr><td class=l><b>${esc(p.name ?? p.id)}</b></td><td>${boxes(c) || typeof c.kev_score === "number" ? `${score(c)}%` : "–"}</td><td>${boxes(c) ? `${boxes(c)} / ${cardTotal(c)}` : "–"}</td><td>${n(c.burnout)}</td><td>${c.pip ? "<b style=color:#B03A2E>PIP</b>" : ""}</td><td class=l>${esc(w.join(" "))}</td></tr>`).join("")}</table>
<footer><span>edenpartnergroup.com</span><span>Team</span><span>EDEN PARTNER GROUP</span></footer></section>`;
}

function findChrome(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(root)) return undefined;
  const direct = join(root, "chromium");
  if (existsSync(direct) && !statSync(direct).isDirectory()) return direct;
  for (const d of readdirSync(root).filter((x) => /^chromium-\d+$/.test(x))) {
    for (const sub of ["chrome-linux64", "chrome-linux"]) { const p = join(root, d, sub, "chrome"); if (existsSync(p)) return p; }
  }
  return undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = process.argv.slice(2), arg = (k: string) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : undefined; };
  const dump = arg("dump"), week = arg("week"), out = arg("out") ?? "deliverables/scorecards", boardPath = arg("board") ?? "projects/workforce/board/current.json";
  if (!dump || !week) { console.error("Usage: npm run card-pdf -- --dump <dir> --week <Monday YYYY-MM-DD> [--board file] [--out dir]"); process.exit(1); }
  const board = existsSync(boardPath) ? JSON.parse(readFileSync(boardPath, "utf8")) : {};
  const brow = (slug: string): BoardRow | undefined => [...(board.recruiters ?? []), ...(board.leadership ?? [])].find((r: BoardRow) => r.slug === slug);
  const pdir = join(dump, "people");
  const people: Person[] = readdirSync(pdir).filter((f) => f.endsWith(".json")).map((f) => ({ id: f.slice(0, -5), ...JSON.parse(readFileSync(join(pdir, f), "utf8")) }))
    .filter((p) => p.group !== "incoming").sort((x, y) => (x.group === "lead" ? 1 : 0) - (y.group === "lead" ? 1 : 0) || (x.sort ?? 99) - (y.sort ?? 99));
  const cardOf = (slug: string, wk: string): Card | undefined => { const f = join(pdir, slug, "cards", `${wk}.json`); return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : undefined; };
  const prevWeek = (() => { const d = new Date(`${week}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 7); return d.toISOString().slice(0, 10); })();
  const rows = people.map((p) => { const c = cardOf(p.id, week) ?? {}; return { p, c, w: watch(brow(p.id), c, cardOf(p.id, prevWeek)), prev: cardOf(p.id, prevWeek) }; });
  const html = `<!doctype html><html><head><meta charset=utf-8><title>Round Table ${week}</title><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${CSS}</style></head><body>${teamPage(rows, week, board.as_of ?? "not pulled")}${rows.map((r) => personPage(r.p, r.c, brow(r.p.id), r.prev, week)).join("")}</body></html>`;
  mkdirSync(out, { recursive: true });
  const htmlPath = join(out, `round-table-${week}.html`), pdfPath = join(out, `round-table-${week}.pdf`);
  writeFileSync(htmlPath, html);
  const chrome = findChrome();
  if (chrome) execFileSync(chrome, ["--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${resolve(pdfPath)}`, pathToFileURL(resolve(htmlPath)).href], { stdio: "ignore", timeout: 90_000 });
  console.log(`Wrote ${htmlPath}${chrome ? ` and ${pdfPath}` : " (no Chromium, so no PDF)"}`);
  const pips = rows.filter((r) => r.c.pip).map((r) => r.p.id);
  console.log(pips.length ? `PIP flagged: ${pips.join(", ")}` : "No PIP flagged.");
}
