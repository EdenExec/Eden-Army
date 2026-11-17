import { test } from "node:test";
import assert from "node:assert/strict";
import { sunsetUtc, sabbathWindow } from "../src/lib/sabbath.js";
import { zonedParts } from "../src/lib/tz.js";

const BOISE = { lat: 43.615, lon: -116.202, tz: "America/Boise" };
const minutesOfDay = (ms, tz) => {
	const p = zonedParts(ms, tz);
	return p.h * 60 + p.min;
};
const at = (y, m, d, h, min = 0) => Date.UTC(y, m - 1, d, h, min); // UTC helper

test("sunset: Boise, 13 Nov 2026 is about 5:21 PM MST", () => {
	const s = sunsetUtc(2026, 11, 13, BOISE.lat, BOISE.lon);
	assert.ok(Math.abs(minutesOfDay(s, BOISE.tz) - (17 * 60 + 21)) <= 4);
});

test("sunset: Boise, 21 June 2026 is about 9:30 PM MDT", () => {
	const s = sunsetUtc(2026, 6, 21, BOISE.lat, BOISE.lon);
	assert.ok(Math.abs(minutesOfDay(s, BOISE.tz) - (21 * 60 + 30)) <= 5);
});

test("sunset: Vancouver (49.28, -123.12), 21 June 2026 is about 9:21 PM", () => {
	const s = sunsetUtc(2026, 6, 21, 49.2827, -123.1207);
	assert.ok(Math.abs(minutesOfDay(s, "America/Vancouver") - (21 * 60 + 21)) <= 5);
});

test("sabbath window: Friday 13 Nov 2026 daytime is not Sabbath; the next window starts that evening", () => {
	const w = sabbathWindow(at(2026, 11, 13, 19), BOISE); // 12:00 MST Friday
	assert.equal(w.active, false);
	assert.ok(Math.abs(minutesOfDay(w.start, BOISE.tz) - (17 * 60 + 21)) <= 4);
	assert.equal(zonedParts(w.start, BOISE.tz).weekday, 5);
});

test("sabbath window: active from Friday sunset through Saturday until sunset", () => {
	assert.equal(sabbathWindow(at(2026, 11, 14, 2), BOISE).active, true); // 7 PM MST Friday
	assert.equal(sabbathWindow(at(2026, 11, 14, 19), BOISE).active, true); // noon Saturday
	const w = sabbathWindow(at(2026, 11, 14, 19), BOISE);
	assert.equal(zonedParts(w.end, BOISE.tz).weekday, 6);
	assert.equal(sabbathWindow(at(2026, 11, 15, 2), BOISE).active, false); // 7 PM MST Saturday, after sunset
	assert.equal(sabbathWindow(at(2026, 11, 12, 19), BOISE).active, false); // Thursday
	assert.equal(sabbathWindow(at(2026, 11, 15, 19), BOISE).active, false); // Sunday
});

test("sabbath window: after Saturday sunset the next window is the following Friday", () => {
	const w = sabbathWindow(at(2026, 11, 15, 2), BOISE);
	assert.equal(w.active, false);
	assert.equal(zonedParts(w.start, BOISE.tz).d, 20);
});

test("sabbath window: works across the daylight saving change (Friday 23 Oct 2026 is still MDT)", () => {
	const mdt = sabbathWindow(at(2026, 10, 24, 2), BOISE); // Fri 23 Oct 8 PM MDT
	assert.equal(mdt.active, true);
	assert.equal(zonedParts(mdt.start, BOISE.tz).d, 23);
});
