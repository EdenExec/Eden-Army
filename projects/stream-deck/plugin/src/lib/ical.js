// A small iCalendar (.ics) reader for Google Calendar's "secret address in iCal format" feed.
// It handles what a Google feed contains: timed and all-day events, TZID zones, RRULE
// (DAILY, WEEKLY, MONTHLY, YEARLY with INTERVAL, BYDAY, BYMONTHDAY, UNTIL, COUNT), EXDATE,
// RECURRENCE-ID overrides, STATUS and attendee answers. Not supported: BYSETPOS, RDATE, RANGE=THISANDFUTURE.

import { zonedParts, zonedToUtc, isValidZone } from "./tz.js";
import { RULES } from "../theme.js";

const DAY_MS = 86400000;
const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// ---------- text parsing ----------

function unfold(text) {
	return text.replace(/\r?\n[ \t]/g, "");
}

function unescapeText(v) {
	return v.replace(/\\([nN,;\\])/g, (_, c) => (c === "n" || c === "N" ? "\n" : c));
}

// "NAME;P1=a;P2=\"b:c\":value" -> { name, params, value }
function parseLine(line) {
	let inQuote = false;
	let colon = -1;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (c === '"') inQuote = !inQuote;
		else if (c === ":" && !inQuote) {
			colon = i;
			break;
		}
	}
	if (colon < 0) return null;
	const head = line.slice(0, colon);
	const value = line.slice(colon + 1);
	const parts = [];
	let cur = "";
	inQuote = false;
	for (const c of head) {
		if (c === '"') inQuote = !inQuote;
		if (c === ";" && !inQuote) {
			parts.push(cur);
			cur = "";
		} else cur += c;
	}
	parts.push(cur);
	const params = {};
	for (const p of parts.slice(1)) {
		const eq = p.indexOf("=");
		if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, "");
	}
	return { name: parts[0].toUpperCase(), params, value };
}

// ---------- date values ----------

// Parse a DTSTART / DTEND / EXDATE / RECURRENCE-ID value.
// Returns { allDay, ms, tz, local:{y,m,d,h,min,s} } (ms is the UTC instant; for all-day, midnight in defaultTz).
function parseDateValue(value, params, defaultTz) {
	const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(value.trim());
	if (!m) return null;
	const [y, mo, d] = [+m[1], +m[2], +m[3]];
	const allDay = params.VALUE === "DATE" || m[4] === undefined;
	const h = +(m[4] ?? 0);
	const min = +(m[5] ?? 0);
	const s = +(m[6] ?? 0);
	let tz;
	if (m[7] === "Z") tz = "UTC";
	else if (params.TZID && isValidZone(params.TZID)) tz = params.TZID;
	else tz = defaultTz; // floating time, or a zone name we do not know
	return { allDay, ms: zonedToUtc(y, mo, d, h, min, s, tz), tz, local: { y, m: mo, d, h, min, s } };
}

function parseDurationMs(v) {
	const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim());
	if (!m) return null;
	const sign = m[1] === "-" ? -1 : 1;
	return sign * (((+m[2] || 0) * 7 + (+m[3] || 0)) * DAY_MS + (+m[4] || 0) * 3600000 + (+m[5] || 0) * 60000 + (+m[6] || 0) * 1000);
}

function parseRrule(v) {
	const r = {};
	for (const part of v.split(";")) {
		const eq = part.indexOf("=");
		if (eq > 0) r[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
	}
	return {
		freq: r.FREQ,
		interval: Math.max(1, parseInt(r.INTERVAL ?? "1", 10) || 1),
		count: r.COUNT ? parseInt(r.COUNT, 10) : null,
		until: r.UNTIL ?? null,
		byday: r.BYDAY ? r.BYDAY.split(",").map(parseByDay).filter(Boolean) : [],
		bymonthday: r.BYMONTHDAY ? r.BYMONTHDAY.split(",").map(Number).filter(Number.isFinite) : [],
		wkst: DAY_CODES.indexOf(r.WKST ?? "MO"),
	};
}

function parseByDay(s) {
	const m = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/.exec(s.trim());
	return m ? { ord: m[1] ? parseInt(m[1], 10) : 0, weekday: DAY_CODES.indexOf(m[2]) } : null;
}

// ---------- reading a feed ----------

// Text -> { calName, calTz, events: RawEvent[] }
export function parseIcs(text, opts = {}) {
	const defaultTz = opts.defaultTz ?? "UTC";
	const lines = unfold(text).split(/\r?\n/);
	let calName = "";
	let calTz = null;
	const events = [];
	let cur = null;
	for (const line of lines) {
		if (line === "BEGIN:VEVENT") {
			cur = { exdates: [], attendees: [], raw: {} };
			continue;
		}
		if (line === "END:VEVENT") {
			if (cur) events.push(cur);
			cur = null;
			continue;
		}
		const p = parseLine(line);
		if (!p) continue;
		if (!cur) {
			if (p.name === "X-WR-CALNAME") calName = unescapeText(p.value);
			if (p.name === "X-WR-TIMEZONE" && isValidZone(p.value)) calTz = p.value;
			continue;
		}
		switch (p.name) {
			case "UID":
				cur.uid = p.value;
				break;
			case "SUMMARY":
				cur.summary = unescapeText(p.value);
				break;
			case "LOCATION":
				cur.location = unescapeText(p.value);
				break;
			case "DESCRIPTION":
				cur.description = unescapeText(p.value);
				break;
			case "X-GOOGLE-CONFERENCE":
				cur.conference = p.value;
				break;
			case "STATUS":
				cur.status = p.value.toUpperCase();
				break;
			case "DTSTART":
				cur.dtstart = { value: p.value, params: p.params };
				break;
			case "DTEND":
				cur.dtend = { value: p.value, params: p.params };
				break;
			case "DURATION":
				cur.durationMs = parseDurationMs(p.value);
				break;
			case "RRULE":
				cur.rrule = parseRrule(p.value);
				break;
			case "EXDATE":
				for (const v of p.value.split(",")) cur.exdates.push({ value: v, params: p.params });
				break;
			case "RECURRENCE-ID":
				cur.recurrenceId = { value: p.value, params: p.params };
				break;
			case "ATTENDEE":
				cur.attendees.push({
					email: p.value.replace(/^mailto:/i, "").toLowerCase(),
					partstat: (p.params.PARTSTAT ?? "").toUpperCase(),
				});
				break;
		}
	}
	// Resolve dates now that the calendar's own zone is known.
	const zone = calTz ?? defaultTz;
	for (const e of events) {
		e.start = e.dtstart ? parseDateValue(e.dtstart.value, e.dtstart.params, zone) : null;
		e.end = e.dtend ? parseDateValue(e.dtend.value, e.dtend.params, zone) : null;
		e.recId = e.recurrenceId ? parseDateValue(e.recurrenceId.value, e.recurrenceId.params, zone) : null;
		e.exd = e.exdates.map((x) => parseDateValue(x.value, x.params, zone)).filter(Boolean);
		delete e.dtstart;
		delete e.dtend;
		delete e.recurrenceId;
		delete e.exdates;
	}
	return { calName, calTz: zone, events: events.filter((e) => e.start) };
}

// ---------- recurrence ----------

function dateNum(y, m, d) {
	return Date.UTC(y, m - 1, d);
}
function weekdayOf(y, m, d) {
	return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
function daysInMonth(y, m) {
	return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// Candidate dates (as {y,m,d}) of one recurrence period, sorted.
function periodDates(rule, start, k) {
	const { y, m, d } = start;
	const n = k * rule.interval;
	const out = [];
	if (rule.freq === "DAILY") {
		const t = new Date(dateNum(y, m, d) + n * DAY_MS);
		const c = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
		if (!rule.byday.length || rule.byday.some((b) => b.weekday === t.getUTCDay())) out.push(c);
	} else if (rule.freq === "WEEKLY") {
		const startWd = weekdayOf(y, m, d);
		const weekStartOffset = -((startWd - rule.wkst + 7) % 7);
		const wkStart = dateNum(y, m, d) + (weekStartOffset + n * 7) * DAY_MS;
		const wds = rule.byday.length ? rule.byday.map((b) => b.weekday) : [startWd];
		for (const wd of wds) {
			const t = new Date(wkStart + ((wd - rule.wkst + 7) % 7) * DAY_MS);
			out.push({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() });
		}
	} else if (rule.freq === "MONTHLY") {
		const mm = new Date(Date.UTC(y, m - 1 + n, 1));
		const yy = mm.getUTCFullYear();
		const mo = mm.getUTCMonth() + 1;
		const dim = daysInMonth(yy, mo);
		if (rule.byday.length) {
			for (const b of rule.byday) {
				const days = [];
				for (let day = 1; day <= dim; day++) if (weekdayOf(yy, mo, day) === b.weekday) days.push(day);
				if (b.ord === 0) days.forEach((day) => out.push({ y: yy, m: mo, d: day }));
				else {
					const pick = b.ord > 0 ? days[b.ord - 1] : days[days.length + b.ord];
					if (pick) out.push({ y: yy, m: mo, d: pick });
				}
			}
		} else {
			const days = rule.bymonthday.length ? rule.bymonthday : [d];
			for (const day of days) {
				const real = day > 0 ? day : dim + day + 1;
				if (real >= 1 && real <= dim) out.push({ y: yy, m: mo, d: real });
			}
		}
	} else if (rule.freq === "YEARLY") {
		const yy = y + n;
		if (d <= daysInMonth(yy, m)) out.push({ y: yy, m, d });
	}
	return out.sort((a, b) => dateNum(a.y, a.m, a.d) - dateNum(b.y, b.m, b.d));
}

// Start instants (UTC ms) of a recurring event that begin before `toMs`, honouring COUNT and UNTIL.
function recurrenceStarts(ev, toMs) {
	const rule = ev.rrule;
	const { local, tz } = ev.start;
	const startDay = dateNum(local.y, local.m, local.d);
	const out = [];
	let count = 0;
	let untilMs = null;
	let untilDay = null;
	if (rule.until) {
		const u = parseDateValue(rule.until, {}, tz);
		if (u) {
			if (u.allDay) untilDay = dateNum(u.local.y, u.local.m, u.local.d);
			else untilMs = u.ms;
		}
	}
	for (let k = 0; k < 20000; k++) {
		let dates = periodDates(rule, local, k);
		if (k === 0 && !dates.some((c) => dateNum(c.y, c.m, c.d) === startDay)) dates = [{ y: local.y, m: local.m, d: local.d }, ...dates];
		let periodBeyond = true;
		for (const c of dates) {
			const day = dateNum(c.y, c.m, c.d);
			if (day < startDay) continue;
			const ms = zonedToUtc(c.y, c.m, c.d, local.h, local.min, local.s, tz);
			if (ms < toMs) periodBeyond = false;
			if (untilMs !== null && ms > untilMs) return out;
			if (untilDay !== null && day > untilDay) return out;
			count++;
			if (rule.count !== null && count > rule.count) return out;
			out.push({ ms, day });
		}
		if (periodBeyond && dates.length) {
			// every candidate of this period starts after the window; later periods only go later
			return out;
		}
		if (!dates.length && k > 5000) return out;
	}
	return out;
}

// ---------- the public function ----------

// Expand a parsed feed into concrete timed occurrences that overlap [fromMs, toMs).
// Returns [{ uid, title, startMs, endMs, location, description, conference }] sorted by start.
// Drops: all-day events, cancelled events, events you declined, events 6 hours or longer.
export function expandEvents(parsed, fromMs, toMs, opts = {}) {
	const maxMs = (opts.maxHours ?? RULES.maxMeetingHours) * 3600000;
	const me = new Set([opts.myEmail, /@/.test(parsed.calName) ? parsed.calName : null].filter(Boolean).map((s) => s.toLowerCase()));
	const declined = (e) => e.attendees.some((a) => a.partstat === "DECLINED" && me.has(a.email));

	// Overrides: UID + original start -> override event
	const overridden = new Set();
	for (const e of parsed.events) if (e.recId && e.uid) overridden.add(`${e.uid}|${e.recId.ms}`);

	const out = [];
	const push = (e, startMs, durationMs) => {
		const endMs = startMs + durationMs;
		if (e.status === "CANCELLED" || declined(e)) return;
		if (durationMs >= maxMs) return;
		if (endMs <= fromMs || startMs >= toMs) return;
		out.push({
			uid: e.uid ?? "",
			title: (e.summary ?? "").trim() || "Busy",
			startMs,
			endMs,
			location: e.location ?? "",
			description: e.description ?? "",
			conference: e.conference ?? "",
		});
	};

	for (const e of parsed.events) {
		if (e.start.allDay) continue;
		let duration;
		if (e.end && !e.end.allDay) duration = e.end.ms - e.start.ms;
		else if (e.durationMs != null) duration = e.durationMs;
		else duration = 0;
		if (duration < 0) duration = 0;

		if (e.rrule && !e.recId) {
			const exMs = new Set(e.exd.filter((x) => !x.allDay).map((x) => x.ms));
			const exDays = new Set(e.exd.filter((x) => x.allDay).map((x) => dateNum(x.local.y, x.local.m, x.local.d)));
			for (const o of recurrenceStarts(e, toMs)) {
				if (exMs.has(o.ms) || exDays.has(o.day)) continue;
				if (e.uid && overridden.has(`${e.uid}|${o.ms}`)) continue;
				push(e, o.ms, duration);
			}
		} else {
			push(e, e.start.ms, duration);
		}
	}
	return out.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
}

// Convenience: text -> occurrences in one call.
export function eventsFromIcs(text, fromMs, toMs, opts = {}) {
	return expandEvents(parseIcs(text, { defaultTz: opts.defaultTz }), fromMs, toMs, opts);
}
