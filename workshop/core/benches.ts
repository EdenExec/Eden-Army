// Command Center benches (Kev, 27 Oct 2026): Q computes the bench documents for client, recruiting, depth, university,
// projects and family from the sources named in projects/virtual-office/bench-sources.json. Pure functions: no network, no writes.
// The CLI side (workshop/office/benches.ts) reads the files; workshop/core/office.ts puts the result in the feed so `office-prep run`
// keeps every bench fresh each hour.
//
// Never here: finance and revenue (Tally's; a money figure needs the numbers gate), pay, phones, emails, health, candidate or family detail.
// Tiles are counts and dates only, and every tile names its source. A discreet client is never named (tiles carry no client names at all).
import { addDays, dayOfWeek, pacificDate, weekStart } from "./office-game.js";
import { scrub, type LedgerRow } from "./office.ts";
import { buildCrelateDoc, type BoardForLeaderboard, type CrelateDoc } from "./recruiter-board.ts";

export type Tile = { label: string; value: string; source: string; asOf: string };
export type Bench = { id: string; owner: string; source: string; asOf: string; syncedAt: string; sourceAsOf: string; tiles: Tile[]; note?: string };

/** The benches Q may write. Finance and revenue are deliberately absent. */
export const Q_BENCHES = ["client", "recruiting", "depth", "university", "projects", "family"] as const;
export type QBench = (typeof Q_BENCHES)[number];

const HOUR = 3_600_000, DAY = 24 * HOUR;
/** How old a bench's own source may be before the bench shows the source's age instead of the sync time (bench-sources.json mirrors these). */
export const SOURCE_WINDOW_MS: Record<QBench, number> = { client: 7 * DAY, recruiting: DAY, depth: 7 * DAY, university: 7 * DAY, projects: DAY, family: DAY };

/** A date-only value ("2026-10-23") counts as that day, midnight UTC; an ISO time as itself. */
const at = (v: string): number => Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00Z` : v);
const iso = (ms: number) => new Date(ms).toISOString();
const dateOf = (v: string) => v.slice(0, 10);
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10-30" -> "Fri 30 Oct". */
const longDay = (d: string) => `${DOW[dayOfWeek(d)]} ${Number(d.slice(8, 10))} ${MON[Number(d.slice(5, 7)) - 1]}`;

/** Stamp a bench: asOf is the sync time while its source is within its window, and the source's own age when it is not, so the page never says "fresh" over old data. */
export function finishBench(id: QBench, owner: string, source: string, tiles: Tile[], now: Date, note?: string): Bench {
  const sourceAsOf = tiles.reduce((m, t) => Math.min(m, at(t.asOf)), now.getTime());
  const lag = now.getTime() - sourceAsOf;
  const asOf = lag > SOURCE_WINDOW_MS[id] ? iso(sourceAsOf) : now.toISOString();
  return { id, owner, source, asOf, syncedAt: now.toISOString(), sourceAsOf: iso(sourceAsOf), tiles, ...(note ? { note } : {}) };
}

// ---- client: Team Hub jobs and the leads index ----
export type JobLite = { id?: string; status?: string; opened?: string; team?: unknown[]; leads?: unknown[]; depth?: unknown[]; updated?: string };
export type LeadSheet = { landedAt?: string | null; phonesAt?: string | null; crelateAt?: string | null; movedAt?: string | null };

export function clientBench(jobs: JobLite[], sheets: LeadSheet[], jobsReadAt: Date, now: Date): Bench {
  const today = pacificDate(now.getTime()), weekAgo = addDays(today, -7);
  const by = (s: string) => jobs.filter((j) => (j.status ?? "active") === s);
  const active = by("active");
  const src = "Team Hub jobs (read now)", leadSrc = "Lead index (projects/leads/index.json, same rows as the Lead Log)";
  const readAt = jobsReadAt.toISOString();
  const stageDates = sheets.flatMap((s) => [s.landedAt, s.phonesAt, s.crelateAt, s.movedAt]).filter((d): d is string => !!d).sort();
  const lastStage = stageDates.length ? stageDates[stageDates.length - 1]! : dateOf(readAt);
  const t = (label: string, value: number | string, source = src, asOf = readAt): Tile => ({ label, value: String(value), source, asOf });
  const tiles: Tile[] = [
    t("Active job orders", active.length),
    t("New in the last 7 days", jobs.filter((j) => j.opened && j.opened >= weekAgo).length),
    t("On hold", by("on-hold").length),
    t("Filled", by("filled").length),
    t("Killed", by("killed").length),
    t("Active with no owner", active.filter((j) => !(j.team ?? []).length).length),
    t("Active with a depth chart seat", active.filter((j) => (j.depth ?? []).length).length),
    t("Lead sheets landed", sheets.filter((s) => s.landedAt).length, leadSrc, lastStage),
    t("Lead sheets with phones added", sheets.filter((s) => s.phonesAt).length, leadSrc, lastStage),
  ];
  return finishBench("client", "Casey", "Team Hub jobs and the Lead Log index. Counts only; no client names.", tiles, now);
}

// ---- recruiting and depth: the Round Table board (Crelate, read only) ----
export type BoardLite = {
  generated_at?: string; as_of?: string; week?: { start?: string; through?: string; label?: string };
  goals?: { rps_per_day?: number; rps_team_week?: number; recruiters_in_goal?: number };
  team?: { this?: { rps?: number; ptcs?: number; subs?: number; ftis?: number } };
  recruiters?: { status?: string; start?: string | null; group?: string }[];
  leadership?: { status?: string; start?: string | null }[];
};

export function recruitingBench(board: BoardLite, boardLive: boolean, now: Date): Bench {
  const gen = board.generated_at ?? now.toISOString(), th = board.team?.this ?? {}, g = board.goals ?? {};
  const src = boardLive ? "Crelate activities, read only (npm run recruiting-board), team totals" : "Round Table board file (projects/workforce/board/current.json), team totals";
  const through = board.week?.through ?? dateOf(gen), start = board.week?.start ?? through;
  // Weekdays of the week so far (Mon to Fri, through the pull day): the 15-a-day standard times the recruiters counted.
  let days = 0;
  for (let d = start; d <= through; d = addDays(d, 1)) if (dayOfWeek(d) >= 1 && dayOfWeek(d) <= 5) days++;
  const perDay = g.rps_per_day ?? 15, people = g.recruiters_in_goal ?? 0;
  const t = (label: string, value: string): Tile => ({ label, value, source: src, asOf: gen });
  const tiles: Tile[] = [
    t("RPs this week", `${th.rps ?? 0} of ${g.rps_team_week ?? perDay * people * 5} goal`),
    t("RPs standard to date", `${perDay * people * days} (${perDay} a day × ${people} recruiters × ${days} weekday${days === 1 ? "" : "s"}, through ${longDay(through)})`),
    t("PTCs this week", String(th.ptcs ?? 0)),
    t("Submittals this week", String(th.subs ?? 0)),
    t("FTIs this week", String(th.ftis ?? 0)),
  ];
  return finishBench("recruiting", "Dean", "Crelate team totals for the week (no names, no pay).", tiles, now);
}

export function depthBench(board: BoardLite, planFiles: { count: number; asOf: string }, boardLive: boolean, now: Date): Bench {
  const gen = board.generated_at ?? now.toISOString();
  const people = [...(board.recruiters ?? []), ...(board.leadership ?? [])];
  const starting = people.filter((p) => p.status === "starts");
  // The roster carries a start as "tbd" until Dean sets it: only a real date is a date, anything else reads "date not set".
  const next = starting.map((p) => p.start).filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d) && !Number.isNaN(Date.parse(d.slice(0, 10)))).sort()[0];
  const src = boardLive ? "Crelate team roster, read only" : "Round Table board file (projects/workforce/board/current.json)";
  const tiles: Tile[] = [
    { label: "New hires starting (not yet started)", value: String(starting.length), source: src, asOf: gen },
    { label: "Next start date", value: next ? longDay(next) : starting.length ? "date not set" : "none set", source: src, asOf: gen },
    { label: "30-day plans open", value: String(planFiles.count), source: "New-hire plan files under projects/workforce/", asOf: planFiles.asOf },
  ];
  return finishBench("depth", "Dean", "New-hire setup files and the Crelate roster. Counts only.", tiles, now);
}

// ---- university ----
export type UniFile = { name: string; asOf: string };

export function universityBench(files: UniFile[], now: Date): Bench {
  const today = pacificDate(now.getTime());
  const dated = files.map((f) => ({ ...f, date: /^(\d{4}-\d{2}-\d{2})/.exec(f.name)?.[1] })).filter((f): f is UniFile & { date: string } => !!f.date);
  const sessions = new Set(dated.map((f) => f.date));
  const modules = files.filter((f) => /\.md$/i.test(f.name) && !/email/i.test(f.name));
  // Next Wednesday: today counts until the day is over.
  const wed = addDays(today, (3 - dayOfWeek(today) + 7) % 7);
  const newest = files.map((f) => at(f.asOf)).reduce((m, v) => Math.max(m, v), 0);
  const src = "Eden University files (projects/workforce/eden-university/)", asOf = newest ? iso(newest) : now.toISOString();
  const tiles: Tile[] = [
    { label: "Training sessions on file", value: String(sessions.size), source: src, asOf },
    { label: "Modules written", value: String(modules.length), source: src, asOf },
    { label: "Tracks live", value: "0 (the 90-day recruiter track is not written yet)", source: "projects/workforce/brief.md, first jobs list", asOf },
    { label: "Next Wednesday training", value: longDay(wed), source: "Standing Wednesday Headhunter Training (employees/dean/skills/eden-university.md)", asOf: now.toISOString() },
  ];
  return finishBench("university", "Dean", "Eden University files and the Wednesday rhythm.", tiles, now);
}

// ---- projects: Eden Staffing schedule ----
export type ScheduleItem = { id: string; milestone?: string; due?: string; done: boolean };

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/** "Fri 30 Oct (A)" -> "2026-10-30". The schedule writes no year; the nearest one to today is used. */
export function parseDue(text: string, today: string): string | undefined {
  const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(text);
  const mo = m ? MONTHS.indexOf(m[2]!.toLowerCase()) : -1;
  if (!m || mo < 0) return undefined;
  const y = Number(today.slice(0, 4));
  const cands = [y - 1, y, y + 1].map((yy) => `${yy}-${String(mo + 1).padStart(2, "0")}-${m[1]!.padStart(2, "0")}`);
  const diff = (d: string) => Math.abs(at(d) - at(today));
  return cands.sort((a, b) => diff(a) - diff(b))[0];
}

/** Reads the milestone table and every deliverable row (ES-, AB-) of projects/eden-staffing/schedule.md. */
export function parseSchedule(md: string, today: string): { milestones: { id: string; due?: string }[]; items: ScheduleItem[] } {
  const milestones: { id: string; due?: string }[] = [], items: ScheduleItem[] = [];
  let header: string[] = [];
  for (const line of md.split(/\r?\n/)) {
    if (!line.startsWith("|")) { header = []; continue; }
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells[0] === "ID") { header = cells.map((c) => c.toLowerCase()); continue; }
    if (/^-+$/.test((cells[0] ?? "").replace(/[:\s]/g, ""))) continue;
    const col = (name: string) => cells[header.indexOf(name)] ?? "";
    if (/^M\d+$/.test(cells[0] ?? "") && header.includes("date")) milestones.push({ id: cells[0]!, due: parseDue(col("date"), today) });
    else if (/^[A-Z]{2}-\d+$/.test(cells[0] ?? "") && header.includes("status") && header.includes("milestone")) {
      items.push({ id: cells[0]!, milestone: col("milestone"), due: parseDue(col("due"), today), done: /^(done|complete)/i.test(col("status")) });
    }
  }
  return { milestones, items };
}

export function projectsBench(scheduleMd: string, scheduleAsOf: string, now: Date): Bench {
  const today = pacificDate(now.getTime()), wkEnd = addDays(weekStart(today), 6);
  const { milestones, items } = parseSchedule(scheduleMd, today);
  const doneMs = (id: string) => { const rows = items.filter((i) => i.milestone === id); return rows.length > 0 && rows.every((r) => r.done); };
  const open = milestones.filter((m) => !doneMs(m.id));
  const src = "Eden Staffing launch schedule (projects/eden-staffing/schedule.md, kept by Pam)";
  const t = (label: string, value: number): Tile => ({ label, value: String(value), source: src, asOf: scheduleAsOf });
  const tiles: Tile[] = [
    t("Milestones due this week", open.filter((m) => m.due && m.due >= today && m.due <= wkEnd).length),
    t("Milestones slipped", open.filter((m) => m.due && m.due < today).length),
    t("Milestones done", milestones.length - open.length),
    t("Deliverables open", items.filter((i) => !i.done).length),
    t("Deliverables slipped", items.filter((i) => !i.done && i.due && i.due < today).length),
    t("Deliverables done", items.filter((i) => i.done).length),
  ];
  return finishBench("projects", "Pam", "Eden Staffing launch schedule; status as the PM last recorded it.", tiles, now);
}

// ---- family: ledger rows in the Home lane; counts only ----
export function familyBench(ledger: LedgerRow[], ledgerAsOf: Date, now: Date): Bench {
  const today = pacificDate(now.getTime()), wkEnd = addDays(weekStart(today), 6);
  const home = ledger.filter((r) => /home|family/i.test(r.lane ?? ""));
  const open = home.filter((r) => !/^done$/i.test(r.status ?? ""));
  const src = "Notion ledger, Home lane (counts only)", asOf = ledgerAsOf.toISOString();
  const tiles: Tile[] = [
    { label: "Open", value: String(open.length), source: src, asOf },
    { label: "Due this week", value: String(open.filter((r) => r.due && r.due.slice(0, 10) >= today && r.due.slice(0, 10) <= wkEnd).length), source: src, asOf },
    { label: "Overdue", value: String(open.filter((r) => r.due && r.due.slice(0, 10) < today).length), source: src, asOf },
  ];
  return finishBench("family", "Radar", "Home lane of the Notion ledger. Counts only; nothing private.", tiles, now);
}

// ---- assemble ----
export type BenchInputs = {
  now: Date;
  jobs?: JobLite[]; jobsReadAt?: Date; leadSheets?: LeadSheet[];
  board?: BoardLite; boardLive?: boolean;
  planFiles?: { count: number; asOf: string };
  universityFiles?: UniFile[];
  schedule?: { md: string; asOf: string };
  ledger?: LedgerRow[]; ledgerAsOf?: Date;
};

/** Every bench whose source arrived; `skipped` names each one that could not be computed and what it needs. */
export function buildBenches(i: BenchInputs): { docs: Record<string, Bench>; skipped: string[]; crelate?: CrelateDoc } {
  const docs: Record<string, Bench> = {}, skipped: string[] = [];
  let crelate: CrelateDoc | undefined;
  const put = (b: Bench) => { assertSafe(b); docs[`benches/${b.id}`] = b; };
  if (i.jobs) put(clientBench(i.jobs, i.leadSheets ?? [], i.jobsReadAt ?? i.now, i.now)); else skipped.push("client bench (pass --jobs: the Team Hub jobs collection)");
  if (i.board) {
    put(recruitingBench(i.board, !!i.boardLive, i.now));
    put(depthBench(i.board, i.planFiles ?? { count: 0, asOf: i.now.toISOString() }, !!i.boardLive, i.now));
    // Kev, 28 Oct: the recruiter leaderboard reads one document, meta/crelate, from the same board (counts only; see core/recruiter-board.ts).
    crelate = buildCrelateDoc(i.board as BoardForLeaderboard, !!i.boardLive, i.now);
  } else skipped.push("recruiting and depth benches (no board file)");
  if (i.universityFiles) put(universityBench(i.universityFiles, i.now)); else skipped.push("university bench (no Eden University files)");
  if (i.schedule) put(projectsBench(i.schedule.md, i.schedule.asOf, i.now)); else skipped.push("projects bench (no schedule file)");
  if (i.ledger) put(familyBench(i.ledger, i.ledgerAsOf ?? i.now, i.now)); else skipped.push("family bench (pass --ledger: the Home lane of the Notion ledger)");
  return { docs, skipped, ...(crelate ? { crelate } : {}) };
}

/** A bench never carries money, emails, phones or names of discreet clients. Throws so a bad tile can never be written. */
export function assertSafe(b: Bench): void {
  if (!(Q_BENCHES as readonly string[]).includes(b.id)) throw new Error(`Q does not write the ${b.id} bench`);
  for (const t of b.tiles) {
    const text = `${t.label} ${t.value} ${t.source}`;
    if (scrub(text, 10_000) !== text.replace(/\s+/g, " ").trim()) throw new Error(`${b.id} bench tile "${t.label}" carries money, an email or a phone number`);
    if (/discreet|baker|inl\b/i.test(text)) throw new Error(`${b.id} bench tile "${t.label}" names a discreet client`);
  }
}
