import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sabbathLayoutWindow, parseCutoff } from "../src/lib/sabbath.js";
import { desiredMode, planSwitch, parseScreenState, shouldReassertRest, PROFILE_NAMES } from "../src/lib/mode.js";
import { buildView } from "../src/lib/view.js";
import { stripSvg, sliceSvg } from "../src/lib/strip.js";
import { crossKeyFace, glyphFace } from "../src/lib/keyface.js";
import { appPathCandidates } from "../src/lib/keys.js";
import { FocusTimer } from "../src/lib/timer.js";
import { zonedToUtc } from "../src/lib/tz.js";
import { COLORS } from "../src/theme.js";

const BOISE = { lat: 43.615, lon: -116.202, tz: "America/Boise" };
const at = (y, m, d, h, min = 0) => zonedToUtc(y, m, d, h, min, 0, BOISE.tz); // Boise wall clock -> UTC ms
const mode = (t, extra = {}) => desiredMode({ now: t, place: BOISE, ...extra });

test("cutoff: parses 24 hour, am/pm, sundown; junk falls back to 8 PM", () => {
	assert.deepEqual(parseCutoff("20:00"), { sundown: false, h: 20, min: 0 });
	assert.deepEqual(parseCutoff("8:30 pm"), { sundown: false, h: 20, min: 30 });
	assert.deepEqual(parseCutoff("12am"), { sundown: false, h: 0, min: 0 });
	assert.equal(parseCutoff("Sundown").sundown, true);
	for (const bad of ["", "banana", "25:00", "13pm", undefined]) assert.deepEqual(parseCutoff(bad), { sundown: false, h: 20, min: 0 });
});

test("layout window: Friday sunset to Sunday 8 PM Boise (13 to 15 Nov 2026)", () => {
	assert.equal(sabbathLayoutWindow(at(2026, 11, 13, 12), BOISE).active, false); // Friday noon
	assert.equal(sabbathLayoutWindow(at(2026, 11, 13, 17, 10), BOISE).active, false); // just before sunset (about 5:21)
	assert.equal(sabbathLayoutWindow(at(2026, 11, 13, 17, 35), BOISE).active, true);
	assert.equal(sabbathLayoutWindow(at(2026, 11, 14, 12), BOISE).proper, true); // Saturday noon
	const sat = sabbathLayoutWindow(at(2026, 11, 14, 19), BOISE); // Saturday 7 PM, after sunset
	assert.equal(sat.active, true);
	assert.equal(sat.proper, false);
	assert.equal(sabbathLayoutWindow(at(2026, 11, 15, 19, 59), BOISE).active, true); // Sunday 7:59 PM
	assert.equal(sabbathLayoutWindow(at(2026, 11, 15, 20, 1), BOISE).active, false); // Sunday 8:01 PM
	assert.equal(sabbathLayoutWindow(at(2026, 11, 16, 9), BOISE).active, false); // Monday
	assert.equal(sabbathLayoutWindow(at(2026, 11, 12, 20), BOISE).active, false); // Thursday
});

test("layout window: the cutoff is a setting, and 'sundown' ends it at Saturday sunset", () => {
	assert.equal(sabbathLayoutWindow(at(2026, 11, 15, 12), BOISE, "10pm").active, true);
	assert.equal(sabbathLayoutWindow(at(2026, 11, 15, 12), BOISE, "08:00").active, false);
	assert.equal(sabbathLayoutWindow(at(2026, 11, 14, 19), BOISE, "sundown").active, false);
	assert.equal(sabbathLayoutWindow(at(2026, 11, 14, 12), BOISE, "sundown").active, true);
});

test("layout window: the next window is reported when not active, and daylight saving does not shift the Friday", () => {
	const w = sabbathLayoutWindow(at(2026, 11, 16, 9), BOISE);
	assert.equal(w.active, false);
	assert.ok(w.start > at(2026, 11, 20, 16) && w.start < at(2026, 11, 20, 18));
	assert.equal(sabbathLayoutWindow(at(2026, 3, 8, 12), BOISE).active, true); // Sunday 8 Mar 2026, clocks changed that day
	assert.equal(sabbathLayoutWindow(at(2026, 3, 8, 21), BOISE).active, false);
});

test("mode: Cross wins, then Sabbath, then Eden", () => {
	assert.equal(mode(at(2026, 11, 11, 10)), "eden");
	assert.equal(mode(at(2026, 11, 11, 10), { screen: "cross" }), "cross");
	assert.equal(mode(at(2026, 11, 14, 12)), "rest");
	assert.equal(mode(at(2026, 11, 14, 12), { screen: "cross" }), "cross");
	assert.equal(mode(at(2026, 11, 15, 21)), "eden");
	assert.equal(mode(at(2026, 11, 15, 21), { cutoff: "11pm" }), "rest");
});

test("mode: state file parsing never traps the deck on the Cross", () => {
	assert.equal(parseScreenState('{"state":"cross","at":"2026-11-15T01:00:00Z"}'), "cross");
	assert.equal(parseScreenState('{"state":"awake"}'), "awake");
	for (const bad of ["", "not json", "null", "[]", '{"state":"CROSS"}', undefined]) assert.equal(parseScreenState(bad), "awake");
});

test("mode: switching plans pass through Eden so 'previous profile' is always home", () => {
	assert.deepEqual(planSwitch("eden", "eden"), []);
	assert.deepEqual(planSwitch("eden", "cross"), [{ profile: PROFILE_NAMES.cross }]);
	assert.deepEqual(planSwitch("eden", "rest"), [{ profile: PROFILE_NAMES.rest }]);
	assert.deepEqual(planSwitch("cross", "eden"), [{ back: true }]);
	assert.deepEqual(planSwitch("rest", "eden"), [{ back: true }]);
	assert.deepEqual(planSwitch("rest", "cross"), [{ back: true }, { profile: "Eden Cross" }]);
	assert.deepEqual(planSwitch("cross", "rest"), [{ back: true }, { profile: "Eden Rest" }]);
});

test("mode: Sabbath re-assert only when the front app changes to one without a smart profile", () => {
	assert.equal(shouldReassertRest({ mode: "eden", previousApp: "Music", frontApp: "Gemini" }), false);
	assert.equal(shouldReassertRest({ mode: "rest", previousApp: "Music", frontApp: "Gemini" }), true);
	assert.equal(shouldReassertRest({ mode: "rest", previousApp: "Gemini", frontApp: "Gemini" }), false);
	assert.equal(shouldReassertRest({ mode: "rest", previousApp: "Gemini", frontApp: "Music" }), false);
	assert.equal(shouldReassertRest({ mode: "rest", previousApp: "Gemini", frontApp: "zoom.us" }), false);
	assert.equal(shouldReassertRest({ mode: "rest", previousApp: "Gemini", frontApp: "" }), false);
});

const view = (t, cutoff) => buildView({ now: t, events: [], place: BOISE, timer: new FocusTimer(), volume: { level: 40, muted: false }, cutoff });

test("Sabbath strip: REST and the sundown line before Saturday sunset, REST alone after", () => {
	const sat = view(at(2026, 11, 14, 12));
	assert.equal(sat.restSub, "until sundown Sat");
	assert.ok(stripSvg(sat).includes(">until sundown Sat<"));
	const after = view(at(2026, 11, 14, 19));
	assert.equal(after.rest, true);
	assert.equal(after.restSub, "");
	const svg = stripSvg(after);
	assert.ok(svg.includes(">REST<"));
	assert.ok(!svg.includes("sundown"));
});

test("Sabbath strip: a clock, no countdown, no meeting, no dial captions except VOLUME", () => {
	const v = view(at(2026, 11, 14, 21, 41));
	assert.deepEqual(v.clock, { time: "9:41", ampm: "PM" });
	const svg = stripSvg(v);
	assert.ok(svg.includes(">9:41<") && svg.includes(">PM<"));
	assert.ok(svg.includes(">VOLUME<"));
	for (const w of ["DAY", "DESKTOP", "FOCUS", "NEXT", "min"]) assert.ok(!svg.includes(`>${w}<`), w);
	assert.ok(svg.includes(">40<")); // volume stays on its dial
	assert.ok(!svg.includes(COLORS.brass));
	for (let i = 0; i < 4; i++) assert.match(sliceSvg(v, i), new RegExp(`viewBox="${i * 200} 0 200 100"`));
});

test("Sabbath strip: the clock sits across dials 2 and 3 (centred on x = 400)", () => {
	const svg = stripSvg(view(at(2026, 11, 14, 9, 5)));
	const x = Number(/<text x="([\d.]+)" y="62"[^>]*>9:05</.exec(svg)[1]);
	assert.ok(x > 300 && x < 400, `clock starts at ${x}`);
});

test("Cross key face: thin cross, no words, palette only", () => {
	const f = crossKeyFace();
	assert.match(f, /width="144" height="144"/);
	assert.ok(!/<text/.test(f));
	assert.ok(f.includes(COLORS.cream) && !f.includes(COLORS.brass));
	assert.ok(crossKeyFace({ tone: "rest" }).includes(COLORS.restText));
});

test("glyph keys: workshop, music, gemini carry their word; unknown glyph falls back to a plain key", () => {
	for (const g of ["workshop", "music", "gemini"]) assert.ok(glyphFace({ glyph: g, label: "Word" }).includes(">WORD<"));
	assert.ok(glyphFace({ glyph: "nope", label: "Gemini" }).includes(">GEMINI<"));
});

test("app paths: the Gemini web app is looked for in /Applications and ~/Applications", () => {
	assert.deepEqual(appPathCandidates("Gemini", "/Users/kev"), [
		"/Applications/Gemini.app",
		"/Users/kev/Applications/Gemini.app",
		"/Users/kev/Applications/Chrome Apps.localized/Gemini.app",
	]);
	assert.deepEqual(appPathCandidates("x; rm -rf /", "/Users/kev"), []);
});

test("bundled profiles: manifest declares both, the files exist, and they hold the right keys", () => {
	const dir = new URL("../com.kdtw.edendeck.sdPlugin/", import.meta.url);
	const manifest = JSON.parse(readFileSync(new URL("manifest.json", dir), "utf8"));
	assert.deepEqual(manifest.Profiles.map((p) => p.Name).sort(), Object.values(PROFILE_NAMES).sort());
	for (const p of manifest.Profiles) {
		assert.equal(p.DeviceType, 7);
		assert.ok(existsSync(new URL(`${p.Name}.streamDeckProfile`, dir)));
	}
	assert.ok(manifest.Actions.some((a) => a.UUID === "com.kdtw.edendeck.cross"));
});

test("bundled profiles: Rest has Barny's, Music, Gemini and the Cross top right; Cross has only the Cross", async () => {
	const { execFileSync } = await import("node:child_process");
	const read = (file) => {
		const path = fileURLToPath(new URL(`../com.kdtw.edendeck.sdPlugin/${file}`, import.meta.url));
		const names = execFileSync("unzip", ["-Z1", path], { encoding: "utf8" }).split("\n");
		const inner = names.find((n) => n.endsWith(".sdProfile/manifest.json"));
		return JSON.parse(execFileSync("unzip", ["-p", path, inner], { encoding: "utf8" }));
	};
	const rest = read("Eden Rest.streamDeckProfile");
	const keys = rest.Controllers.find((c) => c.Type === "Keypad").Actions;
	assert.equal(Object.keys(keys).length, 4);
	assert.equal(keys["3,0"].UUID, "com.kdtw.edendeck.cross");
	assert.equal(keys["0,0"].Settings.url, "https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6");
	assert.equal(keys["1,0"].Settings.app, "Music");
	assert.equal(keys["2,0"].Settings.app, "Gemini");
	assert.equal(Object.keys(rest.Controllers.find((c) => c.Type === "Encoder").Actions).length, 4);
	const cross = read("Eden Cross.streamDeckProfile");
	assert.deepEqual(Object.keys(cross.Controllers.find((c) => c.Type === "Keypad").Actions), ["3,0"]);
	assert.deepEqual(Object.keys(cross.Controllers.find((c) => c.Type === "Encoder").Actions), []);
});
