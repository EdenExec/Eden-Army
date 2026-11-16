import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildMirror, sundayOf } from "./lookahead-mirror.ts";

const items = {
  "boise-move": { title: "Move to Boise", kind: "milestone", lane: "family", start: "2026-11-06", status: "open", note: "movers, school" },
  "wpb": { title: "WPB trip", kind: "decision", lane: "work", start: "2026-11-01", status: "open" },
  "old": { title: "Past", start: "2026-10-01" },
  "far": { title: "Christmas", start: "2026-12-25" },
  "gone": { title: "Removed", start: "2026-11-02", hidden: true },
  "span": { title: "Boise", start: "2026-10-28", end: "2026-11-02" },
  "doc": { title: "Dentist for G", start: "2026-11-03" },
};
describe("look-ahead mirror (meta/lookahead)", () => {
  const m = buildMirror(items, { "2026-10-25": { one: "Pack" } }, "2026-10-30", { url: "u", now: new Date("2026-10-30T03:00:00Z") });
  test("weeks start on Sunday", () => { assert.equal(sundayOf("2026-10-30"), "2026-10-25"); assert.equal(sundayOf("2026-11-01"), "2026-11-01"); });
  test("next three weeks only, running spans kept, hidden and past dropped, sorted by date", () => {
    assert.deepEqual(m.next.map((x) => x.id), ["span", "wpb", "boise-move"]);
  });
  test("open decisions and this week's focus line", () => {
    assert.deepEqual(m.decisions.map((x) => x.id), ["wpb"]);
    assert.equal(m.week.one, "Pack");
  });
  test("an item's note never leaves the Look Ahead page", () => { assert.ok(!/movers|school/.test(JSON.stringify(m))); });
  test("health details never reach the Command Center", () => { assert.ok(!/Dentist/.test(JSON.stringify(m))); });
});
