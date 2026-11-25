import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { pullBoard, toolPublished } from "./office-prep.ts";

const prep = (...args: string[]) => execFileSync(process.execPath, ["workshop/office/office-prep.ts", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
function dump(): string {
  const d = mkdtempSync(join(tmpdir(), "office-prep-"));
  const put = (col: string, id: string, data: object) => { mkdirSync(join(d, col), { recursive: true }); writeFileSync(join(d, col, `${id}.json`), JSON.stringify(data)); };
  put("agents", "dean", { id: "dean", lastHeard: "2026-10-21T00:00:00Z" });
  put("meta", "sync", { syncedAt: "2026-10-22T00:00:00Z" });
  put("tickets", "t-1", { agent: "dean", status: "done", doneAt: "2026-10-26T18:00:00Z" });
  put("actions", "a-1", { action: "done", at: "2026-10-26T18:00:00Z" });
  put("team_asks", "a-202610261005-max-mx7q", { from: "casey", to: "max", createdAt: "2026-10-26T17:05:00Z" });
  return d;
}

describe("office-prep (the ticket runner's floor refresh)", () => {
  test("in: reads versions pasted straight from the ArtifactData list results, and keeps Team Hub asks as read-only input", () => {
    const d = dump(), v = join(d, "versions.txt");
    writeFileSync(v, [
      '15 documents from collection "agents" saved as JSON files under "/x/agents":',
      '- "dean"  607 bytes  version 8  "/x/agents/dean.json"',
      '2 documents from collection "meta" saved as JSON files under "/x/meta":',
      '[1 more saved documents, at <that directory>/<doc_id>.json each (id, version): "sync" 74]',
    ].join("\n"));
    prep("in", d, v);
    const existing = JSON.parse(readFileSync(join(d, "existing.json"), "utf8")) as Record<string, { version: number }>;
    assert.deepEqual(Object.fromEntries(Object.entries(existing).map(([k, x]) => [k, x.version])), { "agents/dean": 8, "meta/sync": 74 });
    assert.equal((JSON.parse(readFileSync(join(d, "asks.json"), "utf8")) as { from: string }[])[0]!.from, "casey");
    assert.equal((JSON.parse(readFileSync(join(d, "tickets.json"), "utf8")) as unknown[]).length, 1);
  });
  test("out: never writes the read-only collections, and splits the batch at 50", () => {
    const d = dump(), outbox = join(d, "outbox"), dest = join(d, "dest");
    mkdirSync(outbox);
    const writes = [
      { op: "set", collection: "agents", doc_id: "dean", data: { id: "dean" }, if_version: 8 },
      { op: "set", collection: "team_asks", doc_id: "x", data: {} },
      { op: "set", collection: "tickets", doc_id: "t-1", data: {}, if_version: 1 },
      ...Array.from({ length: 55 }, (_, i) => ({ op: "set", collection: "alerts", doc_id: `sync-n${i}`, data: {} })),
    ];
    writeFileSync(join(outbox, "batch-1.json"), JSON.stringify({ writes }));
    mkdirSync(join(d, "alerts"));
    prep("out", outbox, d, dest);
    const all = JSON.parse(readFileSync(join(dest, "writes.json"), "utf8")) as { collection: string }[];
    assert.equal(all.length, 56);
    assert.ok(all.every((w) => w.collection === "agents" || w.collection === "alerts"));
    assert.equal((JSON.parse(readFileSync(join(dest, "writes-1.json"), "utf8")) as unknown[]).length, 50);
    assert.equal((JSON.parse(readFileSync(join(dest, "writes-2.json"), "utf8")) as unknown[]).length, 6);
  });
  test("out: with no inbox read, Jenny's desk still refreshes but keeps the light the last inbox sweep gave it", () => {
    const d = dump(), outbox = join(d, "outbox"), dest = join(d, "dest");
    mkdirSync(outbox);
    writeFileSync(join(d, "existing.json"), JSON.stringify({ "agents/host": { version: 3, data: { id: "host", light: "reply", counts: { reply: 2 }, lastHeard: "2026-10-22T00:00:00Z" } } }));
    writeFileSync(join(outbox, "batch-1.json"), JSON.stringify({ writes: [
      { op: "set", collection: "agents", doc_id: "host", data: { id: "host", light: "idle", counts: { reply: 0 }, lastHeard: "2026-10-26T20:00:00Z" }, if_version: 3 },
      { op: "set", collection: "meta", doc_id: "sync", data: { skipped: ["inbox replies (pass --inbox)"] }, if_version: 1 },
    ] }));
    prep("out", outbox, d, dest);
    const host = (JSON.parse(readFileSync(join(dest, "writes.json"), "utf8")) as { doc_id: string; file_path: string }[]).find((w) => w.doc_id === "host")!;
    assert.deepEqual(JSON.parse(readFileSync(host.file_path, "utf8")), { id: "host", light: "reply", counts: { reply: 2 }, lastHeard: "2026-10-26T20:00:00Z" });
  });

  test("in: the Team Hub jobs are read-only input for the Client work bench, never versioned or written back", () => {
    const d = dump(), v = join(d, "versions.json");
    mkdirSync(join(d, "jobs"));
    writeFileSync(join(d, "jobs", "hoffman-boise.json"), JSON.stringify({ client: "Hoffman Construction", status: "active", team: [] }));
    writeFileSync(v, JSON.stringify({ "agents/dean": 8, "meta/sync": 74 }));
    const out = prep("in", d, v);
    assert.match(out, /1 Team Hub job\(s\)/);
    assert.equal((JSON.parse(readFileSync(join(d, "jobs.json"), "utf8")) as { id: string }[])[0]!.id, "hoffman-boise");
    assert.ok(!("jobs/hoffman-boise" in (JSON.parse(readFileSync(join(d, "existing.json"), "utf8")) as object)));
  });
  test("out: a bench with no document yet is written unversioned; one the dump holds without a version is dropped", () => {
    const d = dump(), outbox = join(d, "outbox"), dest = join(d, "dest");
    mkdirSync(outbox);
    mkdirSync(join(d, "benches"));
    writeFileSync(join(d, "benches", "finance.json"), JSON.stringify({ id: "finance" }));
    writeFileSync(join(outbox, "batch-1.json"), JSON.stringify({ writes: [
      { op: "set", collection: "benches", doc_id: "client", data: { id: "client" } },
      { op: "set", collection: "benches", doc_id: "recruiting", data: { id: "recruiting" }, if_version: 2 },
      { op: "set", collection: "benches", doc_id: "finance", data: { id: "finance" } },
    ] }));
    prep("out", outbox, d, dest);
    const ids = (JSON.parse(readFileSync(join(dest, "writes.json"), "utf8")) as { doc_id: string }[]).map((w) => w.doc_id).sort();
    assert.deepEqual(ids, ["client", "recruiting"]);
  });
  test("sync: benches are built from the jobs and the repo's files, and finance and revenue are never in the feed", () => {
    const d = dump(), jobs = join(d, "jobs.json");
    writeFileSync(jobs, JSON.stringify([{ id: "a", status: "active", opened: "2026-10-26", team: [] }, { id: "b", status: "on-hold", team: [{}] }]));
    const raw = execFileSync(process.execPath, ["workshop/office/office.ts", "sync", "--dry", "--no-git", "--jobs", jobs], { encoding: "utf8" });
    const docs = (JSON.parse(raw) as { docs: Record<string, { tiles?: { label: string; value: string }[] }> }).docs;
    const keys = Object.keys(docs).filter((k) => k.startsWith("benches/")).sort();
    assert.deepEqual(keys, ["benches/client", "benches/depth", "benches/projects", "benches/recruiting", "benches/university"]);  // family waits for the ledger
    assert.equal(docs["benches/client"]!.tiles!.find((t) => t.label === "Active job orders")!.value, "1");
    assert.ok(!keys.includes("benches/finance") && !keys.includes("benches/revenue"));
  });
});

describe("the live board pull", () => {
  const script = (body: string) => { const f = join(mkdtempSync(join(tmpdir(), "pull-")), "cli.js"); writeFileSync(f, body); return f; };
  test("no Crelate key: no pull, and nothing stale is left behind", () => {
    const d = dump(); writeFileSync(join(d, "board.json"), "{}");
    assert.equal(pullBoard(d, {}), false);
    assert.ok(!existsSync(join(d, "board.json")));
  });
  test("a failing pull falls back quietly; a working one leaves board.json", () => {
    const d = dump();
    assert.equal(pullBoard(d, { CRELATE_API_KEY: "k" }, script("process.exit(1)")), false);
    assert.ok(!existsSync(join(d, "board.json")));
    const ok = script("require('fs').writeFileSync(process.argv[process.argv.indexOf('--out') + 1], '{\"generated_at\":\"x\"}')");
    assert.equal(pullBoard(d, { CRELATE_API_KEY: "k" }, ok), true);
    assert.equal(pullBoard(d, { CRELATE_API_KEY: "k", OFFICE_BOARD_LIVE: "0" }, ok), false);
  });
});

describe("tool page dates from the artifact list", () => {
  test("an artifact tool takes its artifact's last update date; apps and unlisted links stay unrecorded", () => {
    const list = [
      "- (mine, web page, not a Doc, pinned) Eden Day Board — https://claude.ai/artifact/4QFTb8NFvWhbc2jg5zD4hc — updated 2026-11-09",
      "- (mine, web page, not a Doc) Runway — https://claude.ai/artifact/LL1hw8T3s9Bqk8tJchv8Xv — updated 2026-11-15",
    ].join("\n");
    const act = toolPublished(list, [
      { id: "day-board", url: "https://claude.ai/artifact/4QFTb8NFvWhbc2jg5zD4hc" },
      { id: "runway", url: "https://claude.ai/artifact/LL1hw8T3s9Bqk8tJchv8Xv" },
      { id: "crelate", url: "https://app.crelate.com" },
      { id: "gone", url: "https://claude.ai/artifact/ZZZZZZZZZZZZZZZZZZZZZZ" },
      { id: "queue" },
    ]);
    assert.deepEqual(act, { "day-board": "2026-11-09T00:00:00.000Z", runway: "2026-11-15T00:00:00.000Z" });
  });
  test("in: artifacts.txt in the dump becomes published.json", () => {
    const d = dump(), v = join(d, "versions.txt");
    writeFileSync(v, "{}");
    writeFileSync(join(d, "artifacts.txt"), "- (mine) Runway — https://claude.ai/artifact/LL1hw8T3s9Bqk8tJchv8Xv — updated 2026-11-15\n");
    prep("in", d, v);
    assert.equal((JSON.parse(readFileSync(join(d, "published.json"), "utf8")) as Record<string, string>).runway, "2026-11-15T00:00:00.000Z");
  });
});
