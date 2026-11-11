import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const ctx: Record<string, any> = {};
vm.runInNewContext(readFileSync("projects/virtual-office/draft/office/clipboard.js", "utf8") + "\nthis.Clip = Clip;", ctx);
const Clip = ctx.Clip;
const b = (id: string, o: Record<string, unknown> = {}) => ({ id, agent: "marlowe", project: "ranch", line: "Ranch massing study v2", state: "now", rank: 3, touchedAt: "2026-11-03T10:00:00Z", ...o });

test("waiting on Kev pins first, then impact rank, ties to most recent", () => {
  const out = Clip.ordered([b("a", { rank: 2 }), b("b", { rank: 1, touchedAt: "2026-11-01T00:00:00Z" }), b("c", { rank: 1 }), b("k", { state: "kev", rank: 9 }), b("n", { state: "next", rank: 1 }), b("p", { state: "parked" })], "marlowe").map((x: any) => x.id);
  assert.deepEqual(out, ["k", "c", "b", "a", "n"]);
});
test("cap of 5 never hides a Kev bullet", () => {
  const xs = [1, 2, 3, 4, 5, 6, 7].map((n) => b("x" + n, { rank: n })).concat([b("k", { state: "kev", rank: 99 })]);
  const v = Clip.clipboard(xs, "marlowe");
  assert.equal(v.kev, 1); assert.ok(v.shown.some((x: any) => x.id === "k")); assert.equal(v.shown.length + v.more, 8);
});
test("projects above bullets: stalled flagged, loose capped at 3", () => {
  const xs = [b("a"), b("l1", { project: "" }), b("l2", { project: "" }), b("l3", { project: "" }), b("l4", { project: "" })];
  const g = Clip.byProject(xs, "marlowe", [{ id: "ranch", title: "Ranch", next: "" }]);
  assert.equal(g.projects[0].stalled, true); assert.equal(g.loose.length, 3); assert.equal(g.looseMore, 1);
});
test("done log is newest first and out of the live list", () => {
  const xs = [b("d1", { state: "done", doneAt: "2026-11-01T00:00:00Z" }), b("d2", { state: "done", doneAt: "2026-11-03T00:00:00Z" })];
  assert.deepEqual(Clip.doneLog(xs, "marlowe").map((x: any) => x.id), ["d2", "d1"]); assert.equal(Clip.ordered(xs, "marlowe").length, 0);
});
test("park after 7 idle days, never a Kev bullet; long lines flagged", () => {
  const now = Date.parse("2026-11-04T00:00:00Z");
  assert.deepEqual(Clip.toPark([b("old", { touchedAt: "2026-10-20T00:00:00Z" }), b("k", { state: "kev", touchedAt: "2026-10-01T00:00:00Z" })], now).map((x: any) => x.id), ["old"]);
  assert.equal(Clip.capProblems([b("w", { line: "one two three four five six seven eight nine ten eleven" })]).length, 1);
});
test("Kev's notes stack on one action doc until the agent answers", () => {
  const first = Clip.noteDoc(b("a"), "use the south pad", null, "2026-11-04T10:00:00Z");
  assert.equal(first.key, "clip-a-note"); assert.equal(first.action, "clipnote");
  assert.equal(Clip.noteDoc(b("a"), "  ", null, "x"), null);
  assert.equal(Clip.noteDoc(b("a"), "and cheaper", first, "2026-11-04T10:05:00Z").text, "use the south pad\nand cheaper");
  assert.equal(Clip.thread(b("a"), first).at(-1).pending, true);
});
test("the page loads the clipboard file", () => {
  assert.match(readFileSync("projects/virtual-office/draft/eden-office.html", "utf8"), /office\/clipboard\.js/);
});
