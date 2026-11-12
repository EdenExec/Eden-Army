import { test } from "node:test";
import assert from "node:assert/strict";
import { buildView } from "../src/lib/view.js";
import { stripSvg, sliceSvg } from "../src/lib/strip.js";
import { joinKeyFace } from "../src/lib/keyface.js";
import { FocusTimer } from "../src/lib/timer.js";
import { parseIcs, expandEvents } from "../src/lib/ical.js";
import { safeWebUrl, safeAppName, controlNumber, pressKeyCode, parseVolume, KEY_CODES } from "../src/lib/keys.js";
import { COLORS } from "../src/theme.js";
import { GOOGLE_FEED, BOISE } from "./fixtures.js";

const place = { lat: 43.615, lon: -116.202, tz: "America/Boise" };
const events = expandEvents(parseIcs(GOOGLE_FEED, { defaultTz: place.tz }), BOISE(12, 0), BOISE(14, 0));
const view = (now, timer = new FocusTimer(), volume = { level: 60, muted: false }) => buildView({ now, events, place, timer, volume });

test("view: workday 9:00 shows the next meeting, not cream", () => {
	const v = view(BOISE(12, 9));
	assert.equal(v.left.title, "Pipeline review");
	assert.equal(v.left.label, "NEXT  10:30 AM");
	assert.equal(v.left.countdown, "1 h 30");
	assert.equal(v.left.cream, false);
	assert.equal(v.dayCaption, "THU 12");
	assert.equal(v.join.enabled, false); // 90 minutes away
});

test("view: 12 minutes before turns the strip and Join key cream", () => {
	const v = view(BOISE(12, 10, 18));
	assert.equal(v.left.countdown, "12 min");
	assert.equal(v.left.cream, true);
	assert.equal(v.join.cream, true);
	assert.equal(v.join.enabled, true);
	assert.equal(v.join.timeLabel, "10:30 AM");
	assert.match(v.join.link, /zoom\.us/);
});

test("view: in a call shows the end time and a progress line", () => {
	const v = view(BOISE(12, 10, 52));
	assert.equal(v.left.label, "IN CALL ENDS 11:15 AM");
	assert.equal(v.left.cream, false);
	assert.ok(v.left.progress > 0.4 && v.left.progress < 0.6);
});

test("view: Sabbath shows REST, locks the Join key", () => {
	const v = view(Date.UTC(2026, 10, 14, 19)); // noon Saturday Boise
	assert.equal(v.rest, true);
	assert.equal(v.left.label, "REST");
	assert.match(v.left.countdown, /^\d+ h/);
	assert.equal(v.join.enabled, false);
	assert.equal(v.join.link, null);
	assert.equal(v.dayCaption, "");
});

test("view: Friday after the last meeting counts down to the Sabbath", () => {
	const v = buildView({ now: BOISE(13, 12), events: [], place, timer: new FocusTimer() });
	assert.equal(v.left.label, "SABBATH");
	assert.match(v.left.title, /Rest begins at 5:2\d PM/);
});

test("strip: one 800 x 100 drawing and four 200 x 100 slices of the same drawing", () => {
	const v = view(BOISE(12, 10, 18));
	const full = stripSvg(v);
	assert.match(full, /width="800" height="100" viewBox="0 0 800 100"/);
	for (let i = 0; i < 4; i++) {
		const s = sliceSvg(v, i);
		assert.match(s, new RegExp(`width="200" height="100" viewBox="${i * 200} 0 200 100"`));
		assert.ok(s.includes(full.slice(full.indexOf("<rect"), -6)), "slice carries the whole drawing");
	}
	assert.ok(full.includes(COLORS.cream));
	for (const word of ["DAY", "DESKTOP", "FOCUS", "VOLUME"]) assert.ok(full.includes(`>${word}<`));
	assert.ok(!/\u2014/.test(full));
});

test("strip: brass never appears in normal states", () => {
	for (const t of [BOISE(12, 9), BOISE(12, 10, 18), BOISE(12, 10, 52), Date.UTC(2026, 10, 14, 19)]) {
		assert.ok(!stripSvg(view(t)).includes(COLORS.brass));
	}
});

test("strip: titles are escaped", () => {
	const v = view(BOISE(12, 9));
	v.left.title = 'A & B <script>"x"';
	assert.ok(!stripSvg(v).includes("<script>"));
	assert.ok(stripSvg(v).includes("A &amp; B &lt;script&gt;"));
});

test("join key face: dim, then cream with the start time", () => {
	assert.ok(joinKeyFace({ label: "JOIN", enabled: false, cream: false, timeLabel: "" }).includes(COLORS.off));
	const cream = joinKeyFace({ label: "JOIN", enabled: true, cream: true, timeLabel: "10:30 AM" });
	assert.ok(cream.includes(COLORS.cream) && cream.includes("10:30AM"));
});

test("focus timer shows on the strip, then flashes when done", () => {
	const t = new FocusTimer();
	t.start(BOISE(12, 9));
	assert.equal(view(BOISE(12, 9, 10), t).focus.state, "running");
	assert.equal(view(BOISE(12, 9, 10), t).focus.clock, "15:00");
	t.tick(BOISE(12, 9, 25));
	assert.equal(view(BOISE(12, 9, 25), t).focus.state, "done");
});

// ---- small safety and key helpers ----
test("keys: web links must be http or https; webcal is turned into https", () => {
	assert.equal(safeWebUrl("https://claude.ai/x"), "https://claude.ai/x");
	assert.equal(safeWebUrl("claude.ai/x"), "https://claude.ai/x");
	assert.equal(safeWebUrl("webcal://example.com/a.ics"), "https://example.com/a.ics");
	assert.equal(safeWebUrl("javascript:alert(1)"), null);
	assert.equal(safeWebUrl("file:///etc/passwd"), null);
	assert.equal(safeWebUrl(""), null);
});

test("keys: app names are plain words only", () => {
	assert.equal(safeAppName("Wispr Flow"), "Wispr Flow");
	assert.equal(safeAppName(" Google Calendar "), "Google Calendar");
	assert.equal(safeAppName("x; rm -rf /"), null);
	assert.equal(safeAppName("$(whoami)"), null);
	assert.equal(safeAppName(""), null);
	assert.equal(safeAppName("Eden Day Board \u2013 Claude artifact"), "Eden Day Board \u2013 Claude artifact");
	assert.equal(safeAppName("Wispr-Flow"), "Wispr-Flow");
	assert.equal(safeAppName('a"b'), null);
});

test("keys: AppleScript for arrows, Control+number and volume", () => {
	assert.equal(pressKeyCode(KEY_CODES.right), 'tell application "System Events" to key code 124');
	assert.equal(pressKeyCode(KEY_CODES.left, ["control"]), 'tell application "System Events" to key code 123 using {control down}');
	assert.equal(controlNumber(3), 'tell application "System Events" to keystroke "3" using {control down}');
	assert.throws(() => controlNumber(0));
	assert.throws(() => controlNumber("3; do shell script"));
	assert.deepEqual(parseVolume("52,false\n"), { level: 52, muted: false });
	assert.deepEqual(parseVolume("0,true"), { level: 0, muted: true });
});

import { readFileSync } from "node:fs";
test("manifest: every action is registered in code, nothing else, and there is no Dictate action", () => {
	const manifest = JSON.parse(readFileSync(new URL("../com.kdtw.edendeck.sdPlugin/manifest.json", import.meta.url), "utf8"));
	const code = ["dials.js", "keys.js"].map((f) => readFileSync(new URL(`../src/actions/${f}`, import.meta.url), "utf8")).join("\n");
	const registered = [...code.matchAll(/manifestId = `\$\{UUID\}\.([\w-]+)`/g)].map((m) => `com.kdtw.edendeck.${m[1]}`).sort();
	assert.deepEqual(manifest.Actions.map((a) => a.UUID).sort(), registered);
	assert.ok(!/dictate/i.test(JSON.stringify(manifest) + code));
	assert.ok(manifest.Actions.some((a) => a.UUID.endsWith(".openapp")));
});

