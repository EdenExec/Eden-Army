import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertSafe, buildBenches, clientBench, depthBench, familyBench, finishBench, parseDue, parseSchedule, projectsBench, recruitingBench, universityBench, Q_BENCHES, type Bench, type BoardLite } from "./benches.ts";
import { loadBenchInputs } from "../office/benches.ts";

const tue = new Date("2026-10-27T15:00:00Z");           // Tuesday 8am Pacific
const label = (b: Bench, l: string) => b.tiles.find((t) => t.label === l)!.value;

const jobs = [
  { id: "a", status: "active", opened: "2026-10-23", team: [{ recruiter: "Noah" }], depth: [{ seat: "x" }] },
  { id: "b", status: "active", opened: "2026-10-19", team: [] },
  { id: "c", status: "on-hold", opened: "2026-10-19", team: [] },
  { id: "d", status: "killed", opened: "2026-10-19", team: [{}] },
  { id: "e", opened: "2026-10-26", team: [{}] },       // no status counts as active
];

describe("client bench", () => {
  const b = clientBench(jobs, [{ landedAt: "2026-10-21" }, { landedAt: "2026-10-23", phonesAt: "2026-10-24" }, {}], tue, tue);
  test("counts active, new in 7 days, on hold, killed, no owner, depth seats, and lead sheets by stage", () => {
    assert.equal(label(b, "Active job orders"), "3");
    assert.equal(label(b, "New in the last 7 days"), "2");
    assert.equal(label(b, "On hold"), "1");
    assert.equal(label(b, "Killed"), "1");
    assert.equal(label(b, "Filled"), "0");
    assert.equal(label(b, "Active with no owner"), "1");
    assert.equal(label(b, "Active with a depth chart seat"), "1");
    assert.equal(label(b, "Lead sheets landed"), "2");
    assert.equal(label(b, "Lead sheets with phones added"), "1");
  });
  test("every tile names its source, and the bench is fresh while its lead index is inside the window", () => {
    assert.ok(b.tiles.every((t) => t.source && t.asOf));
    assert.equal(b.asOf, tue.toISOString());
    assert.equal(b.sourceAsOf, "2026-10-24T00:00:00.000Z");
  });
});

describe("a bench never shows fresh over old data", () => {
  test("when its source is older than the window, asOf is the source's own age", () => {
    const old = finishBench("projects", "Pam", "s", [{ label: "x", value: "1", source: "s", asOf: "2026-10-23T06:00:00Z" }], tue);
    assert.equal(old.asOf, "2026-10-23T06:00:00.000Z");
    assert.equal(old.syncedAt, tue.toISOString());
  });
  test("inside the window, asOf is the sync time", () => {
    const ok = finishBench("projects", "Pam", "s", [{ label: "x", value: "1", source: "s", asOf: "2026-10-27T01:00:00Z" }], tue);
    assert.equal(ok.asOf, tue.toISOString());
  });
});

const board = (o: Partial<BoardLite> = {}): BoardLite => ({
  generated_at: "2026-10-27T15:05:03.973Z", week: { start: "2026-10-25", through: "2026-10-27" },
  goals: { rps_per_day: 15, rps_team_week: 375, recruiters_in_goal: 5 }, team: { this: { rps: 76, ptcs: 1, subs: 1, ftis: 0 } },
  recruiters: [{ status: "active" }, { status: "starts", start: "2026-11-02" }], leadership: [{ status: "active" }], ...o,
});

describe("recruiting and depth benches", () => {
  test("team totals against the 15-a-day standard, counting Monday to Friday only", () => {
    const b = recruitingBench(board(), true, tue);
    assert.equal(label(b, "RPs this week"), "76 of 375 goal");
    assert.match(label(b, "RPs standard to date"), /^150 \(15 a day × 5 recruiters × 2 weekdays, through Tue 27 Oct\)$/);
    assert.equal(label(b, "Submittals this week"), "1");
  });
  test("a board file from last Friday keeps its own date, so the bench says how old it is", () => {
    const b = recruitingBench(board({ generated_at: "2026-10-23T16:56:26.747Z", week: { start: "2026-10-18", through: "2026-10-23" } }), false, tue);
    assert.equal(b.asOf, "2026-10-23T16:56:26.747Z");
    assert.match(label(b, "RPs standard to date"), /^375 \(.*5 weekdays, through Fri 23 Oct\)$/);
  });
  test("depth counts people not yet started and gives the next start date, no names", () => {
    const b = depthBench(board(), { count: 1, asOf: "2026-10-25T01:20:00Z" }, true, tue);
    assert.equal(label(b, "New hires starting (not yet started)"), "1");
    assert.equal(label(b, "Next start date"), "Mon 2 Nov");
    assert.equal(label(b, "30-day plans open"), "1");
  });
  test("a start still to be decided reads 'date not set', never a broken date", () => {
    const b = depthBench(board({ recruiters: [{ status: "starts", start: "tbd" }] }), { count: 1, asOf: "2026-10-25T01:20:00Z" }, true, tue);
    assert.equal(label(b, "New hires starting (not yet started)"), "1");
    assert.equal(label(b, "Next start date"), "date not set");
    const none = depthBench(board({ recruiters: [{ status: "active" }] }), { count: 0, asOf: "2026-10-25T01:20:00Z" }, true, tue);
    assert.equal(label(none, "Next start date"), "none set");
  });
});

describe("university bench", () => {
  const files = [{ name: "2026-10-21-crelate-best-practices.md", asOf: "2026-10-21T06:00:00Z" }, { name: "2026-10-21-headhunter-training.html", asOf: "2026-10-21T15:00:00Z" }, { name: "2026-10-21-name-game-email.md", asOf: "2026-10-21T20:00:00Z" }];
  test("counts sessions and modules, and names the next Wednesday", () => {
    const b = universityBench(files, tue);
    assert.equal(label(b, "Training sessions on file"), "1");
    assert.equal(label(b, "Modules written"), "1");
    assert.equal(label(b, "Next Wednesday training"), "Wed 28 Oct");
  });
  test("on a Wednesday today is the training day; on a Thursday it is the week after", () => {
    assert.equal(label(universityBench(files, new Date("2026-10-28T17:00:00Z")), "Next Wednesday training"), "Wed 28 Oct");
    assert.equal(label(universityBench(files, new Date("2026-10-29T17:00:00Z")), "Next Wednesday training"), "Wed 4 Nov");
  });
});

const schedule = `
## Milestones
| ID | Milestone | Done when | Date | Owner |
|---|---|---|---|---|
| M1 | Plan confirmed | x | Fri 30 Oct (A) | Kev |
| M2 | Quotes in hand | x | Fri 13 Nov (A) | Nick (A) |
| M0 | Kickoff | x | Mon 26 Oct | Kev |
| M9 | Done thing | x | Mon 19 Oct | Kev |

## Deliverables
| ID | Deliverable | Milestone | Owner | Due | Status | Next action | Chase | Source |
|---|---|---|---|---|---|---|---|---|
| ES-01 | a | M1 | Kev | Mon 26 Oct | Not started | n | | s |
| ES-02 | b | M1 | Kev | Wed 28 Oct (A) | Done | n | | s |
| ES-03 | c | M2 | Nick | Fri 13 Nov (A) | Waiting on | n | | s |
| ES-04 | d | M9 | Kev | Mon 19 Oct | Done | n | | s |
| ES-05 | e | M0 | Kev | Mon 26 Oct | Not started | n | | s |
`;

describe("projects bench", () => {
  test("parses 'Fri 30 Oct (A)' with the nearest year", () => {
    assert.equal(parseDue("Fri 30 Oct (A)", "2026-10-27"), "2026-10-30");
    assert.equal(parseDue("Fri 8 Jan", "2026-12-28"), "2027-01-08");
    assert.equal(parseDue("not a date", "2026-10-27"), undefined);
  });
  test("reads the milestone table and the deliverable rows", () => {
    const p = parseSchedule(schedule, "2026-10-27");
    assert.equal(p.milestones.length, 4);
    assert.equal(p.items.length, 5);
    assert.equal(p.items.filter((i) => i.done).length, 2);
  });
  test("milestones due this week, slipped and done; a milestone is done only when all its deliverables are", () => {
    const b = projectsBench(schedule, "2026-10-27T01:00:00Z", tue);
    assert.equal(label(b, "Milestones due this week"), "1");   // M1 (Fri 30 Oct); M0 is already past, so it counts as slipped, not due
    assert.equal(label(b, "Milestones slipped"), "1");          // M0 (Mon 26 Oct), ES-05 not done
    assert.equal(label(b, "Milestones done"), "1");             // M9
    assert.equal(label(b, "Deliverables slipped"), "2");        // ES-01 and ES-05
    assert.equal(label(b, "Deliverables done"), "2");
  });
});

describe("family bench", () => {
  const rows = [
    { item: "Call the roofer about the leak", owner: "Kev", lane: "Home", due: "2026-10-28", status: "Open" },
    { item: "Renew registration", owner: "Kev", lane: "Home", due: "2026-10-20", status: "Open" },
    { item: "Sent", owner: "Kev", lane: "Home", due: "2026-10-28", status: "Done" },
    { item: "Client call", owner: "Kev", lane: "Recruiting", due: "2026-10-28", status: "Open" },
  ];
  test("counts the Home lane only, and no ledger text reaches the bench", () => {
    const b = familyBench(rows, tue, tue);
    assert.equal(label(b, "Open"), "2");
    assert.equal(label(b, "Due this week"), "1");
    assert.equal(label(b, "Overdue"), "1");
    assert.ok(!JSON.stringify(b).includes("roofer"));
  });
});

describe("buildBenches and the privacy guard", () => {
  test("a missing source is named in skipped, never faked", () => {
    const { docs, skipped } = buildBenches({ now: tue });
    assert.deepEqual(Object.keys(docs), []);
    assert.equal(skipped.length, 5);
    assert.ok(skipped.some((s) => /family bench/.test(s)));
  });
  test("Q writes six benches and never finance or revenue", () => {
    assert.deepEqual([...Q_BENCHES], ["client", "recruiting", "depth", "university", "projects", "family"]);
    const { docs } = buildBenches({ now: tue, jobs, board: board(), universityFiles: [], schedule: { md: schedule, asOf: "2026-10-27T01:00:00Z" }, ledger: [] });
    assert.deepEqual(Object.keys(docs).sort(), ["benches/client", "benches/depth", "benches/family", "benches/projects", "benches/recruiting", "benches/university"]);
    assert.throws(() => assertSafe({ ...docs["benches/client"]!, id: "finance" }), /does not write the finance bench/);
  });
  test("a tile with money, an email, a phone number or a discreet client cannot be written", () => {
    const b = clientBench([], [], tue, tue);
    for (const value of ["$238,674", "kev@edenexec.com", "(360) 555-0142", "Baker Concrete INL"]) {
      assert.throws(() => assertSafe({ ...b, tiles: [{ label: "x", value, source: "s", asOf: b.asOf }] }), /carries money|names a discreet/, value);
    }
  });
});

describe("loadBenchInputs", () => {
  test("reads the sources from a repo root and leaves out what is not there", () => {
    const root = mkdtempSync(join(tmpdir(), "benches-"));
    mkdirSync(join(root, "projects/eden-staffing"), { recursive: true });
    mkdirSync(join(root, "projects/leads"), { recursive: true });
    mkdirSync(join(root, "projects/workforce/eden-university"), { recursive: true });
    writeFileSync(join(root, "projects/eden-staffing/schedule.md"), schedule);
    writeFileSync(join(root, "projects/leads/index.json"), JSON.stringify({ sheets: [{ landedAt: "2026-10-21" }] }));
    writeFileSync(join(root, "projects/workforce/kyle-prestart.md"), "plan");
    writeFileSync(join(root, "projects/workforce/eden-university/2026-10-21-x.md"), "m");
    const jobsFile = join(root, "jobs.json");
    writeFileSync(jobsFile, JSON.stringify(jobs.map((j) => ({ doc_id: j.id, data: j }))));
    const i = loadBenchInputs({ now: tue, root, jobsFile });
    assert.equal(i.jobs!.length, 5);
    assert.equal(i.jobs![0]!.status, "active");           // ArtifactData's {doc_id, data} shape is accepted
    assert.equal(i.leadSheets!.length, 1);
    assert.equal(i.planFiles!.count, 1);
    assert.equal(i.universityFiles!.length, 1);
    assert.ok(i.schedule!.md.includes("ES-01"));
    assert.equal(i.board, undefined);                      // no board file here: recruiting and depth are skipped, not invented
    assert.equal(i.ledger, undefined);
  });
});
