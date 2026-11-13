import { test } from "node:test";
import assert from "node:assert/strict";
import { parseIcs, expandEvents } from "../src/lib/ical.js";
import { GOOGLE_FEED, BOISE } from "./fixtures.js";

const feed = parseIcs(GOOGLE_FEED, { defaultTz: "America/Boise" });
const titles = (list) => list.map((e) => e.title);

test("a Google feed parses and reads the calendar name and zone", () => {
	assert.equal(feed.calName, "kev@example.com");
	assert.equal(feed.calTz, "America/Boise");
	assert.ok(feed.events.length >= 9);
});

test("one day: keeps timed events in order, drops all-day, cancelled, declined and 6 h+ events", () => {
	const day = expandEvents(feed, BOISE(12, 0), BOISE(13, 0));
	assert.deepEqual(titles(day), ["Pipeline review", "Client intro", "Candidate call"]);
});

test("TZID event: 3 PM New York is 1 PM Boise", () => {
	const intro = expandEvents(feed, BOISE(12, 0), BOISE(13, 0)).find((e) => e.title === "Client intro");
	assert.equal(intro.startMs, BOISE(12, 13));
	assert.equal(intro.endMs, BOISE(12, 14));
});

test("UTC event keeps its instant", () => {
	const c = expandEvents(feed, BOISE(12, 0), BOISE(13, 0)).find((e) => e.title === "Candidate call");
	assert.equal(c.startMs, Date.UTC(2026, 10, 12, 23, 0));
	assert.equal(c.conference, "https://meet.google.com/abc-defg-hij");
});

test("weekly event: EXDATE week is skipped, RECURRENCE-ID week is moved", () => {
	const weeks = expandEvents(feed, BOISE(1, 0), BOISE(30, 23)).filter((e) => e.title.startsWith("Search sync"));
	assert.deepEqual(
		weeks.map((e) => [e.title, e.startMs]),
		[
			["Search sync", BOISE(3, 10, 30)],
			["Search sync", BOISE(10, 10, 30)],
			// 17 Nov removed by EXDATE
			["Search sync (moved)", BOISE(24, 14)],
		],
	);
});

test("weekly event: UNTIL stops the series", () => {
	const dec = expandEvents(feed, Date.UTC(2026, 11, 1), Date.UTC(2027, 1, 1)).filter((e) => e.title === "Search sync");
	// Tuesdays 1, 8, 15, 22, 29 December; UNTIL is 31 Dec 00:00Z so 29 Dec is the last
	assert.equal(dec.length, 5);
	assert.equal(dec[4].startMs, Date.UTC(2026, 11, 29, 17, 30));
});

test("the Zoom event keeps its description with escapes undone and folded lines joined", () => {
	const z = expandEvents(feed, BOISE(12, 0), BOISE(13, 0)).find((e) => e.title === "Pipeline review");
	assert.match(z.description, /https:\/\/us02web\.zoom\.us\/j\/81234567890\?pwd=AbCdEf123\n/);
	assert.match(z.description, /Meeting ID: 812 3456 7890, passcode/);
});

test("declined is only dropped for the calendar owner's address (or the myEmail setting)", () => {
	const other = parseIcs(GOOGLE_FEED.replace("X-WR-CALNAME:kev@example.com", "X-WR-CALNAME:Work"), { defaultTz: "America/Boise" });
	assert.ok(titles(expandEvents(other, BOISE(12, 0), BOISE(13, 0))).includes("Declined thing"));
	assert.ok(!titles(expandEvents(other, BOISE(12, 0), BOISE(13, 0), { myEmail: "KEV@example.com" })).includes("Declined thing"));
});

test("daily with COUNT and INTERVAL", () => {
	const ics = ["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:d", "SUMMARY:Standup", "DTSTART:20261110T150000Z", "DTEND:20261110T151500Z", "RRULE:FREQ=DAILY;INTERVAL=2;COUNT=3", "END:VEVENT", "END:VCALENDAR"].join("\n");
	const out = expandEvents(parseIcs(ics), Date.UTC(2026, 10, 1), Date.UTC(2026, 11, 31));
	assert.deepEqual(out.map((e) => new Date(e.startMs).toISOString().slice(0, 10)), ["2026-11-10", "2026-11-12", "2026-11-14"]);
});

test("weekly with INTERVAL 2 and two weekdays", () => {
	const ics = ["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:w", "SUMMARY:Pods", "DTSTART;TZID=America/Boise:20261102T090000", "DTEND;TZID=America/Boise:20261102T093000", "RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE", "END:VEVENT", "END:VCALENDAR"].join("\n");
	const out = expandEvents(parseIcs(ics), BOISE(1, 0), BOISE(30, 0));
	assert.deepEqual(out.map((e) => e.startMs), [BOISE(2, 9), BOISE(4, 9), BOISE(16, 9), BOISE(18, 9)]);
});

test("monthly on the first Monday, and on a day number", () => {
	const mk = (rule) => ["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:m", "SUMMARY:M", "DTSTART:20261102T160000Z", "DTEND:20261102T163000Z", `RRULE:${rule}`, "END:VEVENT", "END:VCALENDAR"].join("\n");
	const from = Date.UTC(2026, 10, 1), to = Date.UTC(2027, 1, 1);
	const first = expandEvents(parseIcs(mk("FREQ=MONTHLY;BYDAY=1MO")), from, to);
	assert.deepEqual(first.map((e) => new Date(e.startMs).toISOString().slice(0, 10)), ["2026-11-02", "2026-12-07", "2027-01-04"]);
	const day = expandEvents(parseIcs(mk("FREQ=MONTHLY;BYMONTHDAY=2")), from, to);
	assert.deepEqual(day.map((e) => new Date(e.startMs).toISOString().slice(0, 10)), ["2026-11-02", "2026-12-02", "2027-01-02"]);
});

test("a weekly event keeps its wall-clock time across the daylight saving change", () => {
	const ics = ["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:x", "SUMMARY:Early", "DTSTART;TZID=America/Boise:20261026T090000", "DTEND;TZID=America/Boise:20261026T093000", "RRULE:FREQ=WEEKLY", "END:VEVENT", "END:VCALENDAR"].join("\n");
	const out = expandEvents(parseIcs(ics), Date.UTC(2026, 9, 25), Date.UTC(2026, 10, 10));
	// 26 Oct is MDT (UTC-6), 2 Nov and later are MST (UTC-7)
	assert.deepEqual(out.map((e) => e.startMs), [Date.UTC(2026, 9, 26, 15), Date.UTC(2026, 10, 2, 16), Date.UTC(2026, 10, 9, 16)]);
});
