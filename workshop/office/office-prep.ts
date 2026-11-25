// Glue between ArtifactData dumps and `npm run office -- sync`, for the ticket runner and any session without a hand-built existing.json.
// npm run office-prep -- run <dump> <versions> <dest>   all three steps below in one go (what the ticket runner uses every hour).
// npm run office-prep -- in  <dump> <versions>   dump = an ArtifactData `out_dir` holding <collection>/<id>.json files
//     (list tickets, actions, agents, alerts and meta from the Command Center into it, and team_asks from the Team Hub).
//     versions = {"agents/q": 3, ...}, or simply the ArtifactData list results pasted into a text file as they came back
//     ("- "q"  655 bytes  version 9  ..." lines and the "[N more saved documents ...]" tail); the saved files carry no version, and
//     meta/records needs one too. Writes <dump>/tickets.json, <dump>/actions.json (Kev's taps, which score in the Office game),
//     <dump>/asks.json (Team Hub asks, which count as hearing from the agent that posted them) and <dump>/existing.json for `office sync`.
// npm run office-prep -- out <outbox> <dump> <dest>   keeps only the sync writes for collections present in <dump> (writes to
//     anything else would hit documents whose version we never read), saves each document's data as its own file under
//     <dest>/docs/, and writes <dest>/writes.json: the `writes` array to pass to one ArtifactData batch.
// Benches (Kev, 27 Oct 2026): also dump `benches` (Command Center) and `jobs` (Team Hub) and the run writes benches/client, recruiting,
//     depth, university, projects (and family when <dump>/ledger.json, the Home lane rows, exists). Finance and revenue are Tally's and are never written here.
//     `run` also tries one read-only Crelate pull (the Round Table board) into <dump>/board.json; with no key or no network it falls back to the board file in the repo.
//     Tools (Q, 25 Nov 2026): paste the Artifact tool's `list` results into <dump>/artifacts.txt and each artifact tool carries pagePublished, the date its page was last published (not use).
//     That one pull also feeds meta/crelate (the Command Center's "Recruiters · Crelate · this week" table; counts only, see workshop/core/recruiter-board.ts).
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

type Write = { op: "set" | "delete"; collection: string; doc_id: string; data?: unknown; if_version?: number };

const [cmd, ...args] = process.argv.slice(2);
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;
/** Read-only inputs: the sync reads them but never writes them, so they get no versions and no writes. */
const READ_ONLY: Record<string, string> = { tickets: "tickets.json", actions: "actions.json", team_asks: "asks.json", jobs: "jobs.json" };
const collections = (dump: string) => readdirSync(dump, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

/** versions.json, or the ArtifactData list results pasted as text: `documents from collection "agents"` headers, then
 *  `"atlas"  528 bytes  version 8` lines and the `[N more saved documents ...: "id" 2, "id2" 1]` tail. */
function parseVersions(text: string): Record<string, number> {
  try { const j = JSON.parse(text) as unknown; if (j && typeof j === "object" && !Array.isArray(j)) return j as Record<string, number>; } catch { /* not JSON: the pasted list results */ }
  const out: Record<string, number> = {};
  let col: string | null = null;
  for (const line of text.split(/\r?\n/)) {
    const h = /from collection "([^"]+)"/.exec(line);
    if (h) { col = h[1]!; continue; }
    if (!col) continue;
    const one = /"([^"]+)"\s+\d+\s+bytes\s+version\s+(\d+)/.exec(line);
    if (one) { out[`${col}/${one[1]}`] = Number(one[2]); continue; }
    if (/more saved documents/.test(line)) for (const m of line.matchAll(/"([^"]+)"\s+(\d+)(?=\s*[,\]])/g)) out[`${col}/${m[1]}`] = Number(m[2]);
  }
  return out;
}

/** Tool page dates (Q, sync patrol 25 Nov 2026: every tool on the Command Center carried no date at all, so the patrol could not tell a live
 *  link from an abandoned one). artifacts.txt = the Artifact tool's `list` results pasted as they came back
 *  ("- (mine, ...) Title — https://claude.ai/artifact/<id> — updated YYYY-MM-DD"). Each tool whose url is a listed artifact gets the date its
 *  page was last published. That is not use: a page whose database changes hourly (the Team Hub) can be published weeks ago, so this never
 *  feeds lastActivity or the unused report. Tools that are not artifacts (apps, queues) stay undated. */
export function toolPublished(listText: string, tools: { id: string; url?: string }[]): Record<string, string> {
  const updated: Record<string, string> = {};
  for (const m of listText.matchAll(/claude\.ai\/artifact\/([A-Za-z0-9]+)\S*\s+\S\s+updated\s+(\d{4}-\d{2}-\d{2})/g)) {
    if (!updated[m[1]!] || updated[m[1]!]! < m[2]!) updated[m[1]!] = m[2]!;
  }
  const out: Record<string, string> = {};
  for (const t of tools) {
    const id = /claude\.ai\/artifact\/([A-Za-z0-9]+)/.exec(t.url ?? "")?.[1];
    if (id && updated[id]) out[t.id] = `${updated[id]}T00:00:00.000Z`;
  }
  return out;
}

function prepIn(dump: string, versionsFile: string): void {
  const versions = parseVersions(readFileSync(versionsFile, "utf8"));
  const existing: Record<string, { version: number; data: unknown }> = {};
  const rows: Record<string, unknown[]> = Object.fromEntries(Object.keys(READ_ONLY).map((c) => [c, []]));
  for (const col of collections(dump)) {
    for (const f of readdirSync(join(dump, col)).filter((n) => n.endsWith(".json"))) {
      const id = f.slice(0, -5), key = `${col}/${id}`, data = readJson<Record<string, unknown>>(join(dump, col, f));
      if (rows[col]) rows[col]!.push({ id, ...data });                       // read-only input; the sync never writes it
      else if (versions[key] !== undefined) existing[key] = { version: versions[key]!, data };
      else console.warn(`no version for ${key}; its write will be dropped`);
    }
  }
  for (const [col, file] of Object.entries(READ_ONLY)) writeFileSync(join(dump, file), JSON.stringify(rows[col], null, 2) + "\n");
  writeFileSync(join(dump, "existing.json"), JSON.stringify(existing, null, 2) + "\n");
  if (existsSync(join(dump, "artifacts.txt"))) {
    const tools = readJson<{ id: string; url?: string }[]>("projects/virtual-office/tools.json");
    const pub = toolPublished(readFileSync(join(dump, "artifacts.txt"), "utf8"), tools);
    writeFileSync(join(dump, "published.json"), JSON.stringify(pub, null, 2) + "\n");
    console.log(`Tool pages: ${Object.keys(pub).length} of ${tools.length} tool(s) dated from the artifact list.`);
  }
  console.log(`${rows.tickets!.length} ticket(s), ${rows.team_asks!.length} Team Hub ask(s), ${rows.jobs!.length} Team Hub job(s), ${Object.keys(existing).length} versioned doc(s). Next: npm run office -- sync ${syncFlags(dump).join(" ")}`);
}
function syncFlags(dump: string): string[] {
  const flags = ["--tickets", join(dump, "tickets.json"), "--actions", join(dump, "actions.json"), "--existing", join(dump, "existing.json")];
  if (existsSync(join(dump, "team_asks"))) flags.push("--asks", join(dump, "asks.json"));
  if (existsSync(join(dump, "jobs"))) {
    const read = readdirSync(join(dump, "jobs")).filter((n) => n.endsWith(".json")).map((n) => statSync(join(dump, "jobs", n)).mtimeMs);
    flags.push("--jobs", join(dump, "jobs.json"), "--jobs-read-at", new Date(read.length ? Math.max(...read) : Date.now()).toISOString());
  }
  if (existsSync(join(dump, "ledger.json"))) flags.push("--ledger", join(dump, "ledger.json"));
  if (existsSync(join(dump, "board.json"))) flags.push("--board", join(dump, "board.json"));
  if (existsSync(join(dump, "published.json"))) flags.push("--published", join(dump, "published.json"));
  return flags;
}

function prepOut(outbox: string, dump: string, dest: string): void {
  const keep = new Set(collections(dump).filter((c) => !READ_ONLY[c]));
  const existing = existsSync(join(dump, "existing.json")) ? readJson<Record<string, unknown>>(join(dump, "existing.json")) : {};
  const all: Write[] = readdirSync(outbox).filter((n) => /^batch-\d+\.json$/.test(n)).sort()
    .flatMap((n) => readJson<{ writes: Write[] }>(join(outbox, n)).writes);
  // A source this run did not read (no --inbox, --ledger, --calls or --runs) must not wipe what an earlier run posted from it:
  // keep its alerts, and keep Jenny's light (lit by the inbox).
  const skipped: string[] = ((all.find((w) => w.collection === "meta" && w.doc_id === "sync")?.data ?? {}) as { skipped?: string[] }).skipped ?? [];
  const held = [["inbox", "sync-inbox-"], ["ledger", "sync-ledger-"], ["missed calls", "sync-call"], ["routine runs", "sync-run-"]]
    .filter(([src]) => skipped.some((s) => s.startsWith(src!))).map(([, prefix]) => prefix!);
  const untouched = (w: Write) => w.collection === "alerts" && held.some((p) => w.doc_id.startsWith(p));
  // Jenny's desk still refreshes (lastHeard, task, tickets) every run, but keeps the light and counts the last inbox sweep gave it.
  const keepLight = (w: Write): Write => {
    const prior = (existing as Record<string, { data?: { light?: unknown; counts?: unknown } }>)["agents/host"]?.data;
    return held.includes("sync-inbox-") && w.op === "set" && w.collection === "agents" && w.doc_id === "host" && prior && w.data
      ? { ...w, data: { ...(w.data as object), light: prior.light, counts: prior.counts } } : w;
  };
  // A set on a document we hold no version for is safe only if the document is new; skip existing-but-unversioned ones.
  const writes = all.filter((w) => keep.has(w.collection) && !untouched(w) && (w.if_version !== undefined || !existsSync(join(dump, w.collection, `${w.doc_id}.json`)))).map(keepLight);
  mkdirSync(join(dest, "docs"), { recursive: true });
  const out = writes.map((w) => {
    if (w.op === "delete") return { op: w.op, collection: w.collection, doc_id: w.doc_id, if_version: w.if_version };
    const file = join(dest, "docs", `${w.collection}--${w.doc_id}.json`);
    writeFileSync(file, JSON.stringify(w.data) + "\n");
    return { op: w.op, collection: w.collection, doc_id: w.doc_id, file_path: file, ...(w.if_version !== undefined ? { if_version: w.if_version } : {}) };
  });
  writeFileSync(join(dest, "writes.json"), JSON.stringify(out, null, 2) + "\n");
  // ArtifactData batch takes at most 50 writes: writes-1.json, writes-2.json ... are ready-made calls.
  for (const n of readdirSync(dest).filter((f) => /^writes-\d+\.json$/.test(f))) rmSync(join(dest, n));
  const parts: (typeof out)[] = [];
  for (let i = 0; i < out.length; i += 50) parts.push(out.slice(i, i + 50));
  parts.forEach((p, i) => writeFileSync(join(dest, `writes-${i + 1}.json`), JSON.stringify(p, null, 2) + "\n"));
  console.log(`${out.length} of ${all.length} write(s) kept (collections: ${[...keep].join(", ")}; ${Object.keys(existing).length} versioned). Push ${parts.map((_, i) => join(dest, `writes-${i + 1}.json`)).join(", ") || "nothing"} as the batch writes, one ArtifactData batch per file.`);
}

/** One read-only Crelate pull of the Round Table board for the Recruiting and Hiring ramp benches. Never throws: no key, no network or a
 *  slow pull just leaves <dump>/board.json absent and the benches read the repo's board file (and show its age). Prints counts only. */
export function pullBoard(dump: string, env: NodeJS.ProcessEnv = process.env, script = "workshop/workforce/cli.ts"): boolean {
  const out = join(dump, "board.json");
  rmSync(out, { force: true });
  if (!env.CRELATE_API_KEY || env.OFFICE_BOARD_LIVE === "0") { console.log("Board pull skipped (no CRELATE_API_KEY, or OFFICE_BOARD_LIVE=0): benches use the repo's board file."); return false; }
  try {
    execFileSync(process.execPath, [script, "--out", out], { stdio: ["ignore", "ignore", "pipe"], timeout: 120_000, env });
    return existsSync(out);
  } catch (e) {
    rmSync(out, { force: true });
    console.warn(`Board pull failed (${e instanceof Error ? e.message.split("\n")[0] : "error"}); benches use the repo's board file.`);
    return false;
  }
}

if (process.argv[1]?.endsWith("office-prep.ts")) try {
  if (cmd === "in") {
    const [dump, versionsFile] = args;
    if (!dump || !versionsFile) throw new Error("Usage: office-prep in <dump> <versions>");
    prepIn(dump, versionsFile);
  } else if (cmd === "run") {
    const [dump, versionsFile, dest] = args;
    if (!dump || !versionsFile || !dest) throw new Error("Usage: office-prep run <dump> <versions> <dest>");
    prepIn(dump, versionsFile);
    pullBoard(dump);
    const outbox = join(dest, "outbox");
    rmSync(outbox, { recursive: true, force: true });                         // no batch file left over from an earlier run
    execFileSync(process.execPath, ["workshop/office/office.ts", "sync", ...syncFlags(dump), "--out", outbox], { stdio: "inherit" });
    prepOut(outbox, dump, dest);
  } else if (cmd === "out") {
    const [outbox, dump, dest] = args;
    if (!outbox || !dump || !dest) throw new Error("Usage: office-prep out <outbox> <dump> <dest>");
    prepOut(outbox, dump, dest);
  } else {
    throw new Error("Usage: office-prep run <dump> <versions> <dest> | in <dump> <versions> | out <outbox> <dump> <dest>");
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
