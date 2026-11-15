// Turns a dump of the Look Ahead page's `items` collection into the runway JSON (schema: see sample.json).
// Usage: node from-lookahead.mjs <dir with the items/*.json files> <out.json> [--asof YYYY-MM-DD] [--audience kev|jenny]
// The dump comes from ArtifactData list on https://claude.ai/artifact/W6m2KGscEaeG7i2Q2w3CHU, collection items, with out_dir.
// Family items carry their title and date only (no notes). Medical items are dropped. Audience "jenny" shows family items as "Family".
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const [dir, out] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!dir || !out) { console.error("usage: node from-lookahead.mjs <items dir> <out.json> [--asof YYYY-MM-DD] [--audience kev|jenny]"); process.exit(2); }
const audience = flag("--audience", "kev");

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Boise" }).format(new Date());
const asOf = flag("--asof", today());
const parse = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "")); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null; };
const addDays = (d, n) => new Date(d.getTime() + n * 864e5);

const a = parse(asOf);
const startD = addDays(a, -a.getUTCDay());
const endD = addDays(startD, 8 * 7 - 1);
const MEDICAL = /doctor|dentist|dental|medical|physical|therapy|clinic|surgery|appointment/i;

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const events = [];
const openDecisions = [];
let skipped = 0;
for (const f of files) {
  let raw;
  try { raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { continue; }
  const it = raw.data || raw;
  const id = raw.id || f.replace(/\.json$/, "");
  if (!it || it.hidden || !it.title || !it.start) { skipped++; continue; }
  if (MEDICAL.test(it.title) || MEDICAL.test(it.note || "")) { skipped++; continue; }
  const s = parse(it.start), e = parse(it.end) || s;
  if (!s || e < startD || s > endD) { skipped++; continue; }
  const family = it.lane === "family";
  if (it.kind === "decision") {
    openDecisions.push({ title: audience === "jenny" && family ? "Family decision" : it.title, decideBy: iso(s) });
    continue;
  }
  const kind = it.kind === "travel" ? "travel" : it.kind === "milestone" ? "milestone" : family ? "family" : "work";
  const confirmed = it.status === "set" || it.status === "done" || it.kind === "milestone" && it.status !== "open";
  events.push({
    id,
    title: audience === "jenny" && family && kind !== "travel" ? "Family" : it.title,
    start: iso(s),
    end: iso(e),
    kind,
    status: confirmed ? "confirmed" : "tentative",
    who: audience === "jenny" && family ? "Family" : String(it.owner || ""),
    note: family ? "" : String(it.note || "").slice(0, 140),
    source: it.origin === "calendar" || it.source === "calendar" ? "calendar" : it.source === "call" ? "call" : "page",
  });
}
events.sort((x, y) => x.start.localeCompare(y.start) || x.title.localeCompare(y.title));
openDecisions.sort((x, y) => x.decideBy.localeCompare(y.decideBy));
const h = (n) => iso(addDays(startD, n));
const doc = {
  asOf,
  generatedAt: new Date().toISOString(),
  owner: "Kev",
  weeks: 8,
  startSunday: iso(startD),
  horizons: { w2: h(13), w4: h(27), w6: h(41) },
  events,
  openDecisions,
};
fs.writeFileSync(out, JSON.stringify(doc, null, 1));
console.log(`wrote ${out}: ${events.length} events, ${openDecisions.length} decisions, ${skipped} skipped, audience ${audience}, ${doc.startSunday} to ${h(55)}`);
