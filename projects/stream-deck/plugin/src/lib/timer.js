import { RULES } from "../theme.js";

// Focus countdown timer. Time is passed in (ms), never read from the clock here,
// so it is easy to test.
export class FocusTimer {
	constructor(rules = RULES) {
		this.rules = rules;
		this.minutes = rules.focusDefaultMin;
		this.endsAt = null; // ms since epoch while running
		this.finishedAt = null; // set when it ends, cleared by acknowledge()
	}

	get running() {
		return this.endsAt !== null;
	}

	// Turn the dial: ticks > 0 adds steps of 5 minutes, ticks < 0 removes them. Ignored while running.
	turn(ticks) {
		if (this.running) return this.minutes;
		const { focusStepMin: step, focusMinMin: min, focusMaxMin: max } = this.rules;
		this.minutes = Math.min(max, Math.max(min, this.minutes + ticks * step));
		this.finishedAt = null;
		return this.minutes;
	}

	start(now) {
		this.endsAt = now + this.minutes * 60000;
		this.finishedAt = null;
	}

	stop() {
		this.endsAt = null;
	}

	// Press: start when idle, stop when running.
	toggle(now) {
		if (this.running) this.stop();
		else this.start(now);
		return this.running;
	}

	remainingMs(now) {
		return this.running ? Math.max(0, this.endsAt - now) : this.minutes * 60000;
	}

	// Call about once a second. Returns true exactly once, at the moment the timer ends.
	tick(now) {
		if (this.running && now >= this.endsAt) {
			this.endsAt = null;
			this.finishedAt = now;
			return true;
		}
		return false;
	}

	// True for `ms` after the timer ends (used to flash the slice).
	flashing(now, ms = 4000) {
		return this.finishedAt !== null && now - this.finishedAt < ms;
	}
}
