import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildFeed, buildAlerts, buildAgents, lastHeardOf, findUnused, planWrites, chunk, scrub, qcApprovalsByDay, DESKS, SENSITIVE_AGENTS, type SyncInput, SUPERHUMAN_URL } from "./office.ts";
import type { QcItem } from "./qc.ts";
import type { GateRecord } from "./numbers-gate.ts";
import { approvalHash } from "./qc.ts";
import { readOfficePage } from "../office/page-game.ts";

const now = new Date("2026-10-21T18:00:00Z");
const agents = [
  { id: "radar", name: "Radar" }, { id: "q", name: "Q" }, { id: "dean", name: "Dean" },
  { id: "tally", name: "Tally" }, { id: "housing-architect", name: "Marlowe" }, { id: "scout", name: "Scout" },
];
const qcItem = (o: Partial<QcItem>): QcItem => ({ id: "x", employee: "q", kind: "spend", summary: "s", detail: "d", status: "pending", createdAt: "2026-10-21T10:00:00Z", ...o });
const base = (o: Partial<SyncInput> = {}): SyncInput => ({ now, agents, qc: [], gates: [], routines: [], ...o });
const gate = (o: Partial<GateRecord>): GateRecord => ({ id: "g1", subject: "September packet", preparer: "tally", checker: "docket", status: "passed", items: [], createdAt: "2026-10-20T10:00:00Z", closedAt: "2026-10-21T10:00:00Z", ...o });

describe("office lights", () => {
  test("a pending message draft is green-blink review; a spend is amber; 5 days old goes red", () => {
    const a = buildAlerts(base({ qc: [qcItem({ id: "a", employee: "dean", kind: "send_message" }), qcItem({ id: "b", kind: "spend" }), qcItem({ id: "c", kind: "spend", createdAt: "2026-10-10T00:00:00Z" })] }));
    assert.deepEqual(Object.fromEntries(a.map((x) => [x.id, x.light])), { "sync-qc-a": "review", "sync-qc-b": "blocked", "sync-qc-c": "urgent" });
    assert.ok(a.every((x) => x.needsKev));
  });
  test("a QC item an agent would carry out carries the exact action and fingerprint for Kev's two-tap Approve; a draft does not", () => {
    const spend = { id: "q1", employee: "keys", kind: "spend" as const, summary: "Deposit", detail: "d", amountUsd: 300, status: "pending" as const, createdAt: "2026-10-21T10:00:00Z" };
    const draft = { ...spend, id: "q2", kind: "send_message" as const, recipients: ["a@b.co"], draft: { app: "superhuman" as const, id: "d1" } };
    const [a, b] = buildAlerts(base({ qc: [spend, draft] }));
    assert.deepEqual(a!.proposed, { kind: "spend", exact: "spend $300: Deposit", hash: approvalHash(spend), qc: "q1" });
    assert.equal(b!.proposed, undefined);
  });
  test("a cleared gate opens its write-up and says what Kev decides (Kev, 23 Oct: no dead ends)", () => {
    const withDoc = buildAlerts(base({ gates: [gate({ id: "d", doc: "projects/x/options.md", ask: "Take option A?" })] }))[0]!;
    assert.equal(withDoc.link, "https://github.com/EdenExec/Agent-Builder/blob/claude/pensive-brown-18gll8/projects/x/options.md");
    assert.equal(withDoc.why, "Your call: Take option A?");
    const tickets = [{ id: "t1", agent: "tally", status: "done", doneAt: "2026-10-21T11:00:00Z", result: { summary: "Options memo, gate t-gate passed", link: "https://example.com/memo" } }];
    const fromTicket = buildAlerts(base({ gates: [gate({ id: "t-gate" })], tickets }))[0]!;
    assert.equal(fromTicket.link, "https://example.com/memo");
    const bare = buildAlerts(base({ gates: [gate({ id: "none" })] }))[0]!;
    assert.equal(bare.link, undefined);
    assert.match(bare.why ?? "", /Ask for the write-up/);
  });
  test("a recently cleared gate lights its preparer; an old one does not; a failed one is red and not for Kev", () => {
    const a = buildAlerts(base({ gates: [gate({ id: "new" }), gate({ id: "old", closedAt: "2026-10-10T00:00:00Z" }), gate({ id: "bad", status: "failed", preparer: "dean" })] }));
    assert.deepEqual(a.map((x) => [x.id, x.agent, x.light, x.needsKev]), [["sync-gate-new", "tally", "review", true], ["sync-gate-bad", "dean", "urgent", false]]);
  });
  test("a routine with no trigger blocks on Kev", () => {
    const a = buildAlerts(base({ routines: [{ id: "n", name: "Nightly", agent: "q", trigger_id: null }, { id: "ok", name: "Brief", agent: "radar", trigger_id: "trig_1" }] }));
    assert.equal(a.length, 1);
    assert.equal(a[0]!.light, "blocked");
  });
  test("inbox replies land on Jenny's desk by default, ranked, with her draft linked to Superhuman", () => {
    const a = buildAlerts(base({ inbox: [{ title: "Re: shortlist", from: "A Client", rank: 1, why: "Waiting on dates", raisedAt: "2026-10-21T17:00:00Z", draft: { id: "d1" }, preview: "Hi, call me at (555) 123-4567" }] }));
    const r = a.find((x) => x.kind === "inbox")!;
    assert.equal(r.agent, "host");
    assert.equal(r.rank, 1);
    assert.equal(r.link, SUPERHUMAN_URL);
    assert.ok(r.title.startsWith("A Client: "));
    assert.ok(!r.preview!.text.includes("555"));
  });

  test("priority: urgent beats reply beats review beats blocked beats working", () => {
    const input = base({
      qc: [qcItem({ id: "r", employee: "radar", kind: "send_message" })],
      inbox: [{ agent: "radar", title: "Evan: submittal question", kind: "team", raisedAt: "2026-10-21T17:00:00Z" }],
      nowFiles: { radar: { state: "working", task: "Sweep", updated: "2026-10-21T17:30:00Z" } },
    });
    const radar = () => buildAgents(input, buildAlerts(input)).find((x) => x.id === "radar")!;
    assert.equal(radar().light, "reply");
    input.calls = [{ who: "A Client", at: "2026-10-21T16:00:00Z" }];
    assert.equal(radar().light, "urgent");
    assert.equal(radar().counts.review, 1);
    assert.equal(radar().counts.working, 1);
  });
  test("a returned call raises nothing", () => {
    assert.equal(buildAlerts(base({ calls: [{ who: "A", at: "2026-10-21T16:00:00Z", returned: true }] })).length, 0);
  });
  test("overdue ledger rows map owners to agents; Kev's go to Radar and need him; Marlowe maps to housing-architect", () => {
    const a = buildAlerts(base({ ledger: [
      { item: "Send deck", owner: "Kev", due: "2026-10-20", status: "Not started" },
      { item: "Courtyard study", owner: "Marlowe", due: "2026-10-19" },
      { item: "Done thing", owner: "Kev", due: "2026-10-01", status: "Done" },
      { item: "Not due yet", owner: "Kev", due: "2026-10-21" },
    ] }));
    assert.deepEqual(a.map((x) => [x.agent, x.needsKev]), [["radar", true], ["housing-architect", false]]);
  });
});

describe("staleness: a green glow on a dead agent is the worst lie", () => {
  const nf = { q: { state: "working" as const, task: "Mirror sync" } };
  test("working and heard within 4 hours: working", () => {
    const i = base({ nowFiles: { q: { ...nf.q, updated: "2026-10-21T15:00:00Z" } } });
    const q = buildAgents(i, []).find((x) => x.id === "q")!;
    assert.equal(q.light, "working");
    assert.equal(q.stale, false);
  });
  test("working but silent for a day: idle and stale, never green", () => {
    const i = base({ nowFiles: { q: { ...nf.q, updated: "2026-10-20T12:00:00Z" } } });
    const q = buildAgents(i, []).find((x) => x.id === "q")!;
    assert.equal(q.light, "idle");
    assert.equal(q.stale, true);
  });
  test("a ticket Radar picked up an hour ago counts as heard", () => {
    const i = base({ tickets: [{ id: "t1", agent: "scout", status: "picked", pickedAt: "2026-10-21T17:00:00Z" }] });
    const s = buildAgents(i, []).find((x) => x.id === "scout")!;
    assert.equal(s.light, "working");
    assert.equal(s.openTickets, 1);
  });
  test("lastHeard is the latest of memory, QC, the agent's own tickets and its Team Hub asks (Kev, 26 Oct: a stale floor with fresh feeds)", () => {
    const i = base({
      heard: { dean: "2026-10-10T00:00:00Z", scout: "2026-10-10T00:00:00Z", radar: "2026-10-21T16:00:00Z" },
      nowFiles: { radar: { updated: "2026-10-21T17:00:00Z" } },
      tickets: [
        { id: "t1", agent: "dean", status: "done", createdAt: "2026-10-20T10:00:00Z", pickedAt: "2026-10-20T11:00:00Z", doneAt: "2026-10-21T15:30:00Z" },
        { id: "t2", agent: "scout", status: "open", createdAt: "2026-10-19T09:00:00Z", updatedAt: "2026-10-21T12:00:00Z" },
        { id: "t3", agent: "q", status: "done", doneAt: "2026-10-22T09:00:00Z" },   // in the future: ignored
        { id: "t4", agent: "radar", createdBy: "lookahead", status: "done", createdAt: "2026-10-21T08:00:00Z", doneAt: "2026-10-21T16:30:00Z" },   // filed by Hawk: heard from Hawk at createdAt only
      ],
      asks: [{ from: "tally", createdAt: "2026-10-21T14:00:00Z" }, { from: "scout", createdAt: "2026-10-21T13:00:00Z" }],
    });
    assert.equal(lastHeardOf("dean", i), "2026-10-21T15:30:00.000Z");
    assert.equal(lastHeardOf("scout", i), "2026-10-21T13:00:00.000Z");
    assert.equal(lastHeardOf("tally", i), "2026-10-21T14:00:00.000Z");
    assert.equal(lastHeardOf("radar", i), "2026-10-21T17:00:00.000Z");
    assert.equal(lastHeardOf("q", i), null);
    assert.equal(lastHeardOf("lookahead", i), "2026-10-21T08:00:00.000Z");
    const by = Object.fromEntries(buildAgents(i, []).map((x) => [x.id, x]));
    assert.equal(by.dean!.silent, false);
    assert.equal(by.dean!.lastHeard, "2026-10-21T15:30:00.000Z");
  });
  test("no news for longer than the expected rhythm is silent", () => {
    const i = base({ heard: { dean: "2026-10-10T00:00:00Z", radar: "2026-10-21T16:00:00Z" } });
    const by = Object.fromEntries(buildAgents(i, []).map((x) => [x.id, x]));
    assert.equal(by.dean!.silent, true);
    assert.equal(by.radar!.silent, false);
  });
});

describe("privacy", () => {
  test("the three KDTW wing desks (Hale, Jethro, Barnabas) sit in the family wing and are always sensitive", () => {
    const f = buildFeed(base({ agents: [...agents, { id: "hale", name: "Hale" }, { id: "jethro", name: "Jethro" }, { id: "barnabas", name: "Barnabas" }] }));
    for (const id of ["hale", "jethro", "barnabas"]) {
      const a = f.agents.find((x) => x.id === id)!;
      assert.equal(a.desk, "family");
      assert.equal(a.sensitive, true);
    }
  });
  test("the Projects PM sits on the projects desk (Special projects bay) and is not hidden under screen share", () => {
    const f = buildFeed(base({ agents: [...agents, { id: "pm", name: "Projects PM" }] }));
    const a = f.agents.find((x) => x.id === "pm")!;
    assert.equal(a.desk, "projects");
    assert.equal(a.sensitive, false);
  });
  test("scrub removes emails, phone numbers and amounts, and truncates", () => {
    assert.equal(scrub("Mail kyle@example.com or call (509) 555-0134 about $85,000 base"), "Mail [email] or call [number] about [amount] base");
    assert.equal(scrub("Plan $22/month", 90, true), "Plan $22/month");
    assert.ok(scrub("x".repeat(200), 50).length <= 50);
  });
  test("QC summaries are scrubbed in alerts, and family, finance and coaching alerts are marked sensitive", () => {
    const a = buildAlerts(base({ qc: [qcItem({ id: "s", employee: "tally", kind: "send_message", summary: "Send to joel@edenexec.com salary $120,000" })] }));
    assert.ok(!/joel@|120,000/.test(a[0]!.title));
    assert.equal(a[0]!.sensitive, true);
    assert.equal(buildAlerts(base({ qc: [qcItem({ employee: "scout" })] }))[0]!.sensitive, false);
  });
});

describe("unused tools", () => {
  const tools = [
    { id: "hub", name: "Hub", kind: "artifact" as const, owner: "radar", expectedEveryDays: 3 },
    { id: "nightly", name: "Nightly", kind: "routine" as const, owner: "q", routineId: "n" },
    { id: "gate", name: "Gate", kind: "queue" as const, owner: "tally", expectedEveryDays: 14 },
    { id: "spendy", name: "Spendy", kind: "script" as const, owner: "q", qcId: "pend" },
  ];
  test("flags routines without triggers, pending approvals, quiet tools and unrecorded ones; leaves used ones alone", () => {
    const f = findUnused(tools, [{ id: "n", name: "N", agent: "q", trigger_id: null }], [qcItem({ id: "pend" })], { "open-gate": "2026-10-20T00:00:00Z", "open-hub": "2026-10-01T00:00:00Z" }, {}, now);
    const by = Object.fromEntries(f.map((x) => [x.id, x]));
    assert.match(by.nightly!.why, /never switched on/);
    assert.match(by.spendy!.why, /Waiting on your yes/);
    assert.match(by.hub!.why, /Quiet for 20 days/);
    assert.equal(by.gate, undefined);
    assert.equal(by.hub!.evidence, "office-clicks");
  });
  test("a tool with no evidence is flagged as unrecorded, not as proven unused", () => {
    const f = findUnused([tools[0]!], [], [], {}, {}, now);
    assert.equal(f[0]!.evidence, "none");
  });
});

describe("write plan", () => {
  test("new docs are plain sets, existing docs carry if_version, unchanged docs are skipped, resolved sync alerts are deleted, radar alerts survive", () => {
    const docs = { "agents/q": { id: "q", updated: "t2" }, "agents/radar": { id: "radar", light: "idle" }, "alerts/sync-new": { a: 1 } };
    const existing = {
      "agents/q": { version: 4, data: { id: "q", updated: "t1" } },
      "agents/radar": { version: 2, data: { id: "radar", light: "urgent" } },
      "alerts/sync-gone": { version: 7 },
      "alerts/radar-manual": { version: 1 },
    };
    const ops = planWrites(docs, existing);
    assert.deepEqual(ops.map((o) => `${o.op} ${o.collection}/${o.doc_id} v${o.if_version ?? "-"}`), ["set agents/radar v2", "set alerts/sync-new v-", "delete alerts/sync-gone v7"]);
  });
  test("a snooze Radar set on an alert survives the hourly rewrite while it is in the future, and Hawk sits in the sensitive family wing", () => {
    const later = new Date(now.getTime() + 3600_000).toISOString(), past = new Date(now.getTime() - 3600_000).toISOString();
    const ex = (snoozeUntil: string) => ({ "alerts/sync-a": { version: 3, data: { id: "sync-a", title: "old", snoozeUntil } } });
    const docs = { "alerts/sync-a": { id: "sync-a", title: "new" } };
    const kept = planWrites(docs, ex(later), now);
    assert.equal((kept[0]!.data as { snoozeUntil?: string }).snoozeUntil, later);
    assert.equal((planWrites(docs, ex(past), now)[0]!.data as { snoozeUntil?: string }).snoozeUntil, undefined);
    assert.equal(planWrites({ "alerts/sync-a": { id: "sync-a", title: "old", snoozeUntil: later } }, ex(later), now).length, 0);   // nothing else changed: no write
    assert.equal(DESKS.lookahead, "family"); assert.ok(SENSITIVE_AGENTS.has("lookahead"));
    assert.equal(DESKS.gordo, "family"); assert.ok(SENSITIVE_AGENTS.has("gordo"));   // Gordo, hobbies guide (Kev, 15 Nov 2026): KDTW wing
    assert.equal(DESKS["carmel-partner"], "recruiting"); assert.ok(!SENSITIVE_AGENTS.has("carmel-partner"));   // Carmel's Partner (Kev, 19 Nov 2026): client work, next to Casey
  });
  test("batches hold at most 50", () => {
    assert.deepEqual(chunk(Array.from({ length: 120 }, (_, i) => i)).map((c) => c.length), [50, 50, 20]);
  });
  test("a full feed has one agents doc per agent, a sync doc that names what was skipped, and no secrets", () => {
    const f = buildFeed(base({ qc: [qcItem({})] }));
    assert.equal(Object.keys(f.docs).filter((k) => k.startsWith("agents/")).length, agents.length);
    assert.ok((f.docs["meta/sync"] as { skipped: string[] }).skipped.some((s) => /ledger/.test(s)));
    const t = buildFeed(base({ qc: [qcItem({ id: "pend" })], routines: [{ id: "n", name: "N", agent: "q", trigger_id: null }] }), [{ id: "x", name: "X", kind: "routine", owner: "q", routineId: "n", qcId: "pend" }]);
    assert.deepEqual([(t.docs["tools/x"] as any).noTrigger, (t.docs["tools/x"] as any).waitingOnKev], [true, true]);
    assert.ok(!/api[_-]?key|secret|password/i.test(JSON.stringify(f.docs)));
  });
});

describe("the ticket SLA on the desks (Kev, 22 Oct 2026)", () => {
  // now is Wed 21 Oct 2026, 11:00am Pacific (18:00Z): a working day, inside runner hours.
  const ago = (min: number) => new Date(now.getTime() - min * 60000).toISOString();
  const tix = (o: object) => ({ id: "t1", agent: "scout", status: "open", priority: "today", ask: "Build the PB South lead list", createdAt: ago(130), ...o });
  test("an open ticket past 60 minutes raises an urgent alert on its agent's desk with the wait and the ask", () => {
    const a = buildAlerts(base({ tickets: [tix({})] })).filter((x) => x.kind === "sla");
    assert.equal(a.length, 1);
    assert.deepEqual([a[0]!.agent, a[0]!.light, a[0]!.needsKev, a[0]!.id], ["scout", "urgent", false, "sync-fail-t1"]);
    assert.equal(a[0]!.title, "Ticket waiting 2h 10m: Build the PB South lead list");
    const long = buildAlerts(base({ tickets: [tix({ ask: "Call a@b.com about $90,000 " + "x".repeat(100) })] })).find((x) => x.kind === "sla")!;
    assert.ok(!/@|90,000/.test(long.title) && long.title.length <= "Ticket waiting 2h 10m: ".length + 60);
  });
  test("59 minutes, picked-up, done and gated tickets raise nothing", () => {
    const a = buildAlerts(base({ tickets: [tix({ id: "a", createdAt: ago(59) }), tix({ id: "b", status: "done", pickedAt: ago(100), doneAt: ago(10) }), tix({ id: "c", status: "gated", pickedAt: ago(100) }), tix({ id: "d", status: "picked", pickedAt: ago(30) })] }));
    assert.equal(a.filter((x) => x.kind === "sla").length, 0);
  });
  test("picked or working more than 4 hours with no result is a STALL: amber, on the agent's desk", () => {
    const a = buildAlerts(base({ tickets: [tix({ id: "s", status: "working", createdAt: ago(400), pickedAt: ago(300), agent: "q" })] })).find((x) => x.kind === "sla")!;
    assert.deepEqual([a.id, a.light, a.agent], ["sync-stall-s", "blocked", "q"]);
    assert.match(a.title, /^Ticket stalled 5h 0m: /);
    const done = buildAlerts(base({ tickets: [tix({ id: "s", status: "working", createdAt: ago(400), pickedAt: ago(300), result: { summary: "ok" } })] }));
    assert.equal(done.length, 0);
  });
  test("nothing on the Sabbath: Saturday, or Friday after sunset", () => {
    const sat = new Date("2026-10-24T19:00:00Z");
    const a = buildAlerts(base({ now: sat, tickets: [tix({ createdAt: new Date(sat.getTime() - 5 * 3600000).toISOString() })] }));
    assert.equal(a.length, 0);
    const fri = new Date("2026-10-24T03:00:00Z");                                          // Fri 8pm PDT, sunset was 6:11pm
    assert.equal(buildAlerts(base({ now: fri, tickets: [tix({ createdAt: "2026-10-23T20:00:00Z" })] })).filter((x) => x.kind === "sla").length, 0);
  });
  test("the FAIL turns the desk red, and the count and the game reach meta/sync and meta/records", () => {
    const input = base({ tickets: [tix({}), tix({ id: "t2", agent: "q", status: "done", createdAt: ago(100), pickedAt: ago(90), doneAt: ago(20) })], actions: [{ action: "done", at: ago(10) }] });
    const f = buildFeed(input);
    assert.equal(f.agents.find((x) => x.id === "scout")!.light, "urgent");
    const sync = f.docs["meta/sync"] as any;
    assert.equal(sync.counts.fails, 1);
    assert.equal(sync.counts.stalls, 0);
    assert.deepEqual([sync.game.day.points, sync.game.day.closed, sync.game.day.fails, sync.game.day.kev], [6 - 3 + 2, 1, 1, 1]);
    assert.equal(sync.game.openNow, 1);
    assert.ok(!/Build the PB South/.test(JSON.stringify(sync)), "no ticket text in the game block");
    const rec = f.docs["meta/records"] as any;
    assert.equal(rec.mostClosedDay.n, 1);
    assert.ok(!f.skipped.some((x) => /tickets/.test(x)));
  });
  test("records already on file only advance", () => {
    const f = buildFeed(base({ tickets: [tix({ status: "done", pickedAt: ago(100), doneAt: ago(20) })] }), [], {}, {}, { mostClosedDay: { n: 9, date: "2026-09-01", on: "2026-09-01" }, bestWeek: { points: 1, weekOf: "2026-10-18", on: "2026-10-19" }, longestStreak: { days: 0, on: null } });
    const rec = f.docs["meta/records"] as any;
    assert.equal(rec.mostClosedDay.n, 9);
    assert.ok(rec.bestWeek.points >= 5);
  });
  test("without tickets the sync says so and writes no game and no records", () => {
    const f = buildFeed(base());
    assert.equal((f.docs["meta/sync"] as any).game, null);
    assert.equal((f.docs["meta/sync"] as any).counts.fails, null);
    assert.equal("meta/records" in f.docs, false);
  });
  test("a FAIL alert that stops being true is deleted on the next sync", () => {
    const first = buildFeed(base({ tickets: [tix({})] }));
    const ex = Object.fromEntries(Object.entries(first.docs).map(([k, v]) => [k, { version: 1, data: v }]));
    const next = buildFeed(base({ tickets: [tix({ status: "picked", pickedAt: ago(5) })] }));
    const ops = planWrites(next.docs, ex);
    assert.ok(ops.some((o) => o.op === "delete" && o.doc_id === "sync-fail-t1"));
  });
  test("meta/sync is always rewritten, so 'Synced Nm ago' on the page keeps moving even when nothing else changed", () => {
    const f = buildFeed(base());
    const later = buildFeed(base({ now: new Date(now.getTime() + 3600000) }));
    const ex = Object.fromEntries(Object.entries(f.docs).map(([k, v]) => [k, { version: 2, data: v }]));
    const ops = planWrites(later.docs, ex);
    assert.ok(ops.some((o) => o.collection === "meta" && o.doc_id === "sync" && o.if_version === 2));
    assert.ok(!ops.some((o) => o.collection === "agents"), "unchanged agents are still skipped");
  });
  test("Kev's QC approvals count by Pacific day", () => {
    const q = [qcItem({ id: "a", status: "approved", decidedAt: "2026-10-21T17:00:00Z" }), qcItem({ id: "b", status: "approved", decidedAt: "2026-10-21T14:00:00Z" }), qcItem({ id: "c", status: "pending" }), qcItem({ id: "d", status: "rejected", decidedAt: "2026-10-21T17:00:00Z" })];
    assert.deepEqual(qcApprovalsByDay(q, now), { "2026-10-21": 2 });
  });
  test("the Projects PM sits on its own desk", () => { assert.equal(DESKS.pm, "projects"); });
  test("the Client Care Manager sits on the Recruiting desk and is not hidden under Screen share", () => {
    assert.equal(DESKS.casey, "recruiting");
    assert.ok(!SENSITIVE_AGENTS.has("casey"));
  });
  test("Ember, the MPC and warm-inventory keeper, sits on the Recruiting desk, seated in Client work next to Casey, and is not hidden", async () => {
    assert.equal(DESKS.ember, "recruiting");
    assert.ok(!SENSITIVE_AGENTS.has("ember"));
    const { readFileSync } = await import("node:fs");
    const html = await readOfficePage();
    assert.ok(html.includes("casey: 'cli', ember: 'cli'"), "Ember's seat is in the Client work zone");
  });
});

describe("the page", () => {
  test("every tool url in tools.json is in the page, so the floor links to what exists", async () => {
    const { readFileSync } = await import("node:fs");
    const html = await readOfficePage();
    const tools = JSON.parse(readFileSync("projects/virtual-office/tools.json", "utf8")) as { id: string; url?: string }[];
    for (const t of tools.filter((x) => x.url)) assert.ok(html.includes(t.url!), `${t.id} ${t.url} missing from eden-office.html`);
  });
  test("the page names the three wing desks as sensitive", async () => {
    const { readFileSync } = await import("node:fs");
    const html = await readOfficePage();
    for (const id of ["hale", "jethro", "barnabas"]) assert.ok(html.includes(`'${id}'`), id);
  });
  test("the game core in the page is a verbatim copy of workshop/core/office-game.js (run `npm run office -- build-page` if this fails)", async () => {
    const { readFileSync } = await import("node:fs");
    const { buildGameBlock, currentGameBlock } = await import("../office/page-game.ts");
    const html = await readOfficePage();
    assert.equal(currentGameBlock(html), buildGameBlock(readFileSync("workshop/core/office-game.js", "utf8")));
  });
  test("the page's copy of the core gives the same answers as the sync's", async () => {
    const { readFileSync } = await import("node:fs");
    const { currentGameBlock } = await import("../office/page-game.ts");
    const core = await import("./office-game.js");
    const Game = new Function(currentGameBlock(await readOfficePage())! + "; return Game;")();
    const t = { id: "t", agent: "scout", status: "open", createdAt: "2026-10-21T15:00:00Z", priority: "today" };
    assert.deepEqual(Game.slaState(t, now.getTime()), core.slaState(t, now.getTime()));
    assert.deepEqual(Game.buildGame({ now: now.getTime(), tickets: [t] }), core.buildGame({ now: now.getTime(), tickets: [t] }));
  });
  test("the page has the board, the line, the sound switch, the Special projects bay and the pm desk", async () => {
    const { readFileSync } = await import("node:fs");
    const html = await readOfficePage();
    for (const id of ['id="board"', 'id="line"', 'id="sw-sound"', 'id="d-spx"', "pm: 'spx'", "pm: ['staffing-doc', 'hub']", "eo-sound", "visibilitychange"]) assert.ok(html.includes(id), id);
  });
});
