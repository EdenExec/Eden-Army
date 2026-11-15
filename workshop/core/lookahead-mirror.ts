// The look-ahead on the Command Center (Kev, 30 Oct 2026: "should we add our planning scheduler and a widget down here?").
// Hawk's Look Ahead page holds the 12-week strip; the Command Center cannot read another page's database, so Hawk writes a small
// mirror, `meta/lookahead`, for the Family office wing: this week's focus lines, the next three weeks of items and the open decisions.
// Titles, dates and owners only: an item's note never leaves the Look Ahead page. Pure functions; the CLI is workshop/office/lookahead-mirror.ts.

export type LaItem = { title?: string; kind?: string; lane?: string; start?: string; end?: string; time?: string; owner?: string; status?: string; hidden?: boolean };
export type LaWeek = { work?: string; family?: string; one?: string };
export type MirrorItem = { id: string; title: string; kind: string; lane: string; start: string; end: string; time: string; owner: string; status: string };
export type Mirror = {
  schema: 1; asOf: string; url: string;
  week: { start: string; work: string; family: string; one: string };
  next: MirrorItem[]; decisions: MirrorItem[]; counts: { items: number; open: number };
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
/** Health details never reach a surface: an item that reads like an appointment stays on the Look Ahead page (15 Nov). */
export const MEDICAL = /doctor|dentist|dental|medical|physical|therapy|therap|clinic|surgery|appointment|ortho|pediatric/i;
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
/** The Sunday on or before a date: Hawk's weeks run Sunday to Saturday. */
export const sundayOf = (d: string) => addDays(d, -new Date(`${d}T12:00:00Z`).getUTCDay());
const txt = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export function buildMirror(items: Record<string, LaItem>, weeks: Record<string, LaWeek>, today: string, opts: { now?: Date; url: string; days?: number }): Mirror {
  if (!ISO.test(today)) throw new Error(`today "${today}" must be YYYY-MM-DD`);
  const horizon = addDays(today, opts.days ?? 21);
  const all: MirrorItem[] = Object.entries(items)
    .filter(([, x]) => !x.hidden && ISO.test(x.start ?? "") && !MEDICAL.test(String(x.title ?? "")))
    .map(([id, x]) => ({ id, title: txt(x.title, 80) || "(untitled)", kind: txt(x.kind, 12) || "event", lane: txt(x.lane, 8) || "both", start: x.start!, end: ISO.test(x.end ?? "") ? x.end! : "", time: txt(x.time, 20), owner: txt(x.owner, 24), status: txt(x.status, 8) || "set" }))
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
  const next = all.filter((x) => x.start <= horizon && (x.end || x.start) >= today && x.status !== "done").slice(0, 12);
  const decisions = all.filter((x) => x.kind === "decision" && x.status === "open").slice(0, 6);
  const sun = sundayOf(today), w = weeks[sun] ?? {};
  return {
    schema: 1, asOf: (opts.now ?? new Date()).toISOString(), url: opts.url,
    week: { start: sun, work: txt(w.work, 160), family: txt(w.family, 160), one: txt(w.one, 160) },
    next, decisions, counts: { items: all.length, open: all.filter((x) => x.status === "open").length },
  };
}
