import { test } from "node:test";
import assert from "node:assert/strict";
import { findJoinLink, isCream, selectMeeting, joinState } from "../src/lib/meetings.js";
import { formatCountdown, formatClock } from "../src/lib/countdown.js";
import { parseIcs, expandEvents } from "../src/lib/ical.js";
import { GOOGLE_FEED, BOISE } from "./fixtures.js";

const MIN = 60000;
const ev = (startMin, durMin, extra = {}) => ({ title: "T", startMs: startMin * MIN, endMs: (startMin + durMin) * MIN, location: "", description: "", conference: "", ...extra });

// ---- join link finder ----
test("join link: Zoom link in the description (from the Google-style feed)", () => {
	const events = expandEvents(parseIcs(GOOGLE_FEED, { defaultTz: "America/Boise" }), BOISE(12, 0), BOISE(13, 0));
	const zoom = events.find((e) => e.title === "Pipeline review");
	assert.equal(findJoinLink(zoom), "https://us02web.zoom.us/j/81234567890?pwd=AbCdEf123");
});

test("join link: X-GOOGLE-CONFERENCE wins, then LOCATION, then DESCRIPTION", () => {
	const e = { conference: "https://meet.google.com/aaa-bbbb-ccc", location: "https://zoom.us/j/1", description: "https://teams.microsoft.com/l/meetup-join/x" };
	assert.equal(findJoinLink(e), "https://meet.google.com/aaa-bbbb-ccc");
	assert.equal(findJoinLink({ ...e, conference: "" }), "https://zoom.us/j/1");
	assert.equal(findJoinLink({ ...e, conference: "", location: "" }), "https://teams.microsoft.com/l/meetup-join/x");
});

test("join link: Webex, Teams, trailing punctuation and HTML quotes", () => {
	assert.equal(findJoinLink({ description: 'Join: <a href="https://eden.webex.com/meet/kev">link</a>' }), "https://eden.webex.com/meet/kev");
	assert.equal(findJoinLink({ location: "See https://teams.microsoft.com/l/meetup-join/abc." }), "https://teams.microsoft.com/l/meetup-join/abc");
});

test("join link: ignores other sites, http links and look-alike hosts", () => {
	assert.equal(findJoinLink({ description: "Docs https://docs.google.com/d/1 and http://zoom.us/j/1" }), null);
	assert.equal(findJoinLink({ description: "https://zoom.us.evil.example/j/1 https://notzoom.us/j/1" }), null);
	assert.equal(findJoinLink({}), null);
});

// ---- the 15 minute cream rule ----
test("cream: from 15 minutes before to 5 minutes after the start", () => {
	const e = ev(100, 30);
	assert.equal(isCream(e, 84 * MIN), false);
	assert.equal(isCream(e, 85 * MIN), true);
	assert.equal(isCream(e, 100 * MIN), true);
	assert.equal(isCream(e, 105 * MIN), true);
	assert.equal(isCream(e, 105 * MIN + 1), false);
	assert.equal(isCream(null, 0), false);
});

// ---- selection ----
test("selection: next event that has not ended; skips finished ones", () => {
	const events = [ev(0, 30), ev(60, 30), ev(120, 30)];
	assert.deepEqual(selectMeeting(events, 40 * MIN), { kind: "next", event: events[1] });
	assert.deepEqual(selectMeeting(events, 70 * MIN), { kind: "live", event: events[1] });
	assert.deepEqual(selectMeeting(events, 200 * MIN), { kind: "none", event: null });
});

test("selection: a live meeting gives way to the next one once it is inside the 15 minute window", () => {
	const events = [ev(0, 60), ev(70, 30)];
	assert.equal(selectMeeting(events, 40 * MIN).kind, "live");
	assert.equal(selectMeeting(events, 56 * MIN).event, events[1]);
	assert.equal(selectMeeting(events, 56 * MIN).kind, "next");
});

test("selection with the Google-style feed at 9:00 and 10:40 Boise", () => {
	const events = expandEvents(parseIcs(GOOGLE_FEED, { defaultTz: "America/Boise" }), BOISE(12, 0), BOISE(13, 0));
	assert.equal(selectMeeting(events, BOISE(12, 9)).event.title, "Pipeline review");
	assert.equal(selectMeeting(events, BOISE(12, 10, 40)).kind, "live");
	assert.equal(selectMeeting(events, BOISE(12, 11, 30)).event.title, "Client intro");
});

// ---- join key ----
test("join key: dim without a link, dim beyond 30 minutes, cream inside 15, still cream 15 after", () => {
	const withLink = (s, d = 30) => ({ kind: "next", event: ev(s, d, { location: "https://zoom.us/j/9" }) });
	assert.equal(joinState({ kind: "next", event: ev(10, 30) }, 0).link, null);
	assert.equal(joinState(withLink(40), 0).link, null); // 40 minutes away
	let j = joinState(withLink(25), 0); // 25 minutes away: pressable, not cream
	assert.ok(j.link);
	assert.equal(j.cream, false);
	j = joinState(withLink(14), 0);
	assert.equal(j.cream, true);
	assert.equal(joinState(withLink(0, 60), 15 * MIN).cream, true);
	assert.equal(joinState(withLink(0, 60), 16 * MIN).cream, false);
	assert.equal(joinState({ kind: "none", event: null }, 0).cream, false);
});

// ---- countdown formatter ----
test("countdown formatter", () => {
	assert.equal(formatCountdown(90 * MIN), "1 h 30");
	assert.equal(formatCountdown(65 * MIN), "1 h 05");
	assert.equal(formatCountdown(120 * MIN), "2 h");
	assert.equal(formatCountdown(12 * MIN), "12 min");
	assert.equal(formatCountdown(11 * MIN + 1), "12 min"); // rounds up
	assert.equal(formatCountdown(1000), "1 min");
	assert.equal(formatCountdown(0), "now");
	assert.equal(formatCountdown(-5), "now");
	assert.equal(formatCountdown(40 * 3600000), "2 d");
	assert.equal(formatClock(1500), "25:00");
	assert.equal(formatClock(61.2), "1:02");
});
