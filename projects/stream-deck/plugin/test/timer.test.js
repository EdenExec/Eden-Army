import { test } from "node:test";
import assert from "node:assert/strict";
import { FocusTimer } from "../src/lib/timer.js";

test("timer: starts at 25, turns in steps of 5 between 5 and 120", () => {
	const t = new FocusTimer();
	assert.equal(t.minutes, 25);
	assert.equal(t.turn(1), 30);
	assert.equal(t.turn(-3), 15);
	assert.equal(t.turn(-10), 5);
	assert.equal(t.turn(100), 120);
});

test("timer: press starts, press again stops; turning is ignored while running", () => {
	const t = new FocusTimer();
	assert.equal(t.toggle(1000), true);
	assert.equal(t.remainingMs(1000), 25 * 60000);
	t.turn(3);
	assert.equal(t.minutes, 25);
	assert.equal(t.toggle(2000), false);
	assert.equal(t.running, false);
});

test("timer: counts down and reports the end exactly once", () => {
	const t = new FocusTimer();
	t.turn(-4); // 5 minutes
	t.start(0);
	assert.equal(t.remainingMs(60000), 4 * 60000);
	assert.equal(t.tick(299999), false);
	assert.equal(t.tick(300000), true);
	assert.equal(t.tick(300001), false);
	assert.equal(t.running, false);
	assert.equal(t.flashing(301000), true);
	assert.equal(t.flashing(310000), false);
});

test("timer: turning after it ended clears the done flash", () => {
	const t = new FocusTimer();
	t.start(0);
	t.tick(25 * 60000);
	t.turn(1);
	assert.equal(t.flashing(25 * 60000 + 1), false);
});
