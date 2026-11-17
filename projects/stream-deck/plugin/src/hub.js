// The hub holds the live state (calendar, timer, volume, settings) and redraws the strip and Join keys.
import streamDeck from "@elgato/streamdeck";
import { RULES } from "./theme.js";
import { parseIcs, expandEvents } from "./lib/ical.js";
import { FocusTimer } from "./lib/timer.js";
import { buildView } from "./lib/view.js";
import { sliceDataUri } from "./lib/strip.js";
import { joinKeyFace, svgDataUri } from "./lib/keyface.js";
import { DEFAULT_PLACE, DEFAULT_SUNDAY_CUTOFF } from "./lib/sabbath.js";
import { desiredMode, planSwitch, parseScreenState, shouldReassertRest } from "./lib/mode.js";
import { readFileSync, watchFile } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isValidZone } from "./lib/tz.js";
import { safeWebUrl } from "./lib/keys.js";
import { sys } from "./lib/system.js";

const log = streamDeck.logger.createScope("hub");

// The Mac helper (helper/EdenWake) writes this file; the plugin only reads it. See projects/stream-deck/setup.md.
const STATE_FILE = process.env.EDENDECK_STATE || join(homedir(), ".edendeck", "screen.json");
const STREAM_DECK_PLUS = 7;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Hub {
	settings = {};
	feed = null; // parsed calendar, in memory only
	events = [];
	timer = new FocusTimer();
	volume = { level: 0, muted: false };
	dials = new Map(); // action id -> { action, column }
	joinKeys = new Map(); // action id -> action
	lastSlice = new Map();
	flashUntil = new Map(); // dial id -> ms
	lastJoin = "";
	status = { ok: false, message: "No calendar address yet", at: 0, count: 0 };
	started = false;
	mode = "eden"; // the layout the plugin last asked for
	frontApp = "";
	switching = false;

	start() {
		if (this.started) return;
		this.started = true;
		streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
			this.settings = ev.settings ?? {};
			this.refreshCalendar();
			this.updateMode();
		});
		streamDeck.settings.getGlobalSettings().then((s) => {
			this.settings = s ?? {};
			this.refreshCalendar();
			this.updateMode();
		});
		setInterval(() => this.tick(), 1000);
		setInterval(() => this.refreshCalendar(), RULES.pollMinutes * 60000);
		setInterval(() => this.readVolume(), 5000);
		this.readVolume();
		// Layout switching (v7): Sabbath by the clock, Cross by the helper's state file.
		watchFile(STATE_FILE, { interval: 500 }, () => this.updateMode());
		setInterval(() => this.updateMode(), 5000);
		setInterval(() => this.watchFrontApp(), RULES.reassertRestSeconds * 1000);
		this.updateMode();
	}

	get cutoff() {
		return String(this.settings.sundayCutoff ?? "").trim() || DEFAULT_SUNDAY_CUTOFF;
	}

	readScreen() {
		try {
			return parseScreenState(readFileSync(STATE_FILE, "utf8"));
		} catch {
			return "awake"; // no file yet: not locked
		}
	}

	// ---- layout switching ----
	updateMode(now = Date.now()) {
		const next = desiredMode({ now, place: this.place, cutoff: this.cutoff, screen: this.readScreen() });
		if (next !== this.mode) return this.switchTo(next);
	}

	async switchTo(next) {
		if (this.switching) return;
		this.switching = true;
		const steps = planSwitch(this.mode, next);
		log.info(`layout ${this.mode} -> ${next}`);
		this.mode = next;
		try {
			const decks = [];
			streamDeck.devices.forEach((d) => d.type === STREAM_DECK_PLUS && decks.push(d.id));
			for (const step of steps) {
				for (const id of decks) await streamDeck.profiles.switchToProfile(id, step.back ? undefined : step.profile).catch((e) => log.warn(`switch failed: ${e?.message ?? e}`));
				if (steps.length > 1) await sleep(400);
			}
		} finally {
			this.switching = false;
		}
	}

	// On the Sabbath, leaving Music for Gemini would drop the deck to Eden. If the front app changed to one without
	// a smart profile of its own, put Rest back. lsappinfo needs no permission.
	async watchFrontApp() {
		if (this.mode !== "rest" || this.switching) return;
		let app = "";
		try {
			app = await sys.frontApp();
		} catch {
			return;
		}
		const previousApp = this.frontApp;
		this.frontApp = app;
		if (!shouldReassertRest({ mode: this.mode, previousApp, frontApp: app })) return;
		await sleep(800); // let Stream Deck's own smart-profile switch happen first
		const steps = planSwitch("eden", "rest");
		streamDeck.devices.forEach((d) => d.type === STREAM_DECK_PLUS && streamDeck.profiles.switchToProfile(d.id, steps[0].profile).catch(() => {}));
	}

	get place() {
		const s = this.settings;
		const lat = Number(s.lat), lon = Number(s.lon);
		return {
			lat: Number.isFinite(lat) && s.lat !== "" && s.lat != null ? lat : DEFAULT_PLACE.lat,
			lon: Number.isFinite(lon) && s.lon !== "" && s.lon != null ? lon : DEFAULT_PLACE.lon,
			tz: s.tz && isValidZone(s.tz) ? s.tz : DEFAULT_PLACE.tz,
		};
	}

	view(now = Date.now()) {
		return buildView({ now, events: this.events, place: this.place, timer: this.timer, volume: this.volume, cutoff: this.cutoff });
	}

	// ---- calendar ----
	async refreshCalendar() {
		const url = safeWebUrl(this.settings.calendarUrl ?? "");
		if (!url) {
			this.feed = null;
			this.events = [];
			this.status = { ok: false, message: "No calendar address yet", at: Date.now(), count: 0 };
			return this.pushStatus();
		}
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const text = await res.text();
			if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Not a calendar feed");
			this.feed = parseIcs(text, { defaultTz: this.place.tz });
			this.reexpand();
			this.status = { ok: true, message: "OK", at: Date.now(), count: this.events.length };
		} catch (err) {
			// Never log the address or the response; only a short reason.
			const reason = err?.name === "TimeoutError" ? "timed out" : String(err?.message ?? "failed").replace(/https?:\/\/\S+/g, "[address]");
			this.status = { ...this.status, ok: false, message: `Could not read the calendar (${reason})`, at: Date.now() };
			log.warn(`calendar refresh failed: ${reason}`);
		}
		this.pushStatus();
		this.render();
	}

	reexpand(now = Date.now()) {
		if (!this.feed) return;
		this.events = expandEvents(this.feed, now - 6 * 3600000, now + 8 * 86400000, { myEmail: this.settings.myEmail });
	}

	pushStatus() {
		try {
			streamDeck.ui.sendToPropertyInspector({ event: "status", ...this.status });
		} catch {
			// no property inspector open
		}
	}

	// ---- volume ----
	async readVolume() {
		try {
			this.volume = await sys.readVolume();
		} catch {
			// not on a Mac, or osascript refused
		}
	}

	// ---- loop ----
	tick() {
		const now = Date.now();
		if (Math.floor(now / 1000) % 60 === 0) this.reexpand(now);
		if (this.timer.tick(now)) {
			sys.playGlass().catch(() => {});
		}
		this.render(now);
	}

	// Brief light wash on one dial's slice, for "pressed, nothing to do".
	flash(id, ms = 300) {
		this.flashUntil.set(id, Date.now() + ms);
		this.render();
		setTimeout(() => this.render(), ms + 50);
	}

	registerDial(action) {
		this.dials.set(action.id, { action, column: action.coordinates?.column ?? 0 });
		this.lastSlice.delete(action.id);
		this.render();
	}
	unregisterDial(id) {
		this.dials.delete(id);
		this.lastSlice.delete(id);
	}
	registerJoinKey(action) {
		this.joinKeys.set(action.id, action);
		this.lastJoin = "";
		this.render();
	}
	unregisterJoinKey(id) {
		this.joinKeys.delete(id);
	}

	render(now = Date.now()) {
		if (!this.dials.size && !this.joinKeys.size) return;
		const v = this.view(now);
		for (const [id, { action, column }] of this.dials) {
			const flash = (this.flashUntil.get(id) ?? 0) > now || (v.focus.state === "done" && v.focus.flashOn && column === 2);
			const img = sliceDataUri(v, column, { flash });
			if (this.lastSlice.get(id) === img) continue;
			this.lastSlice.set(id, img);
			action.setFeedback({ slice: img }).catch(() => {});
		}
		if (this.joinKeys.size) {
			const face = svgDataUri(joinKeyFace(v.join));
			if (face !== this.lastJoin) {
				this.lastJoin = face;
				for (const a of this.joinKeys.values()) a.setImage(face).catch(() => {});
			}
		}
	}
}

export const hub = new Hub();
