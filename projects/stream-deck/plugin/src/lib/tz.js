// Small time zone helpers built on Intl (no dependency). Works with IANA names like "America/Boise".

const formatters = new Map();
function formatterFor(tz) {
	let f = formatters.get(tz);
	if (!f) {
		f = new Intl.DateTimeFormat("en-US", {
			timeZone: tz,
			hourCycle: "h23",
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			weekday: "short",
		});
		formatters.set(tz, f);
	}
	return f;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Wall-clock parts of an instant in a zone. weekday: 0 = Sunday.
export function zonedParts(ms, tz) {
	const out = {};
	for (const p of formatterFor(tz).formatToParts(new Date(ms))) out[p.type] = p.value;
	return {
		y: +out.year,
		m: +out.month,
		d: +out.day,
		h: +out.hour % 24,
		min: +out.minute,
		s: +out.second,
		weekday: WEEKDAYS.indexOf(out.weekday),
	};
}

// Offset of a zone from UTC at an instant, in ms (Boise in winter: -7 h).
export function zoneOffsetMs(ms, tz) {
	const p = zonedParts(ms, tz);
	return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(ms / 1000) * 1000;
}

// Wall-clock time in a zone -> UTC instant (ms). For a time that does not exist (spring forward)
// it lands an hour later; for a repeated time (fall back) it takes the first one.
export function zonedToUtc(y, m, d, h, min, s, tz) {
	if (!tz || tz === "UTC") return Date.UTC(y, m - 1, d, h, min, s);
	const guess = Date.UTC(y, m - 1, d, h, min, s);
	let result = guess - zoneOffsetMs(guess, tz);
	const again = guess - zoneOffsetMs(result, tz);
	if (again !== result) result = again;
	return result;
}

export function isValidZone(tz) {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}

// "10:30 AM" in a zone.
export function clockLabel(ms, tz) {
	const p = zonedParts(ms, tz);
	const h12 = p.h % 12 === 0 ? 12 : p.h % 12;
	return `${h12}:${String(p.min).padStart(2, "0")} ${p.h < 12 ? "AM" : "PM"}`;
}

// "THU 12" in a zone.
export function dayLabel(ms, tz) {
	const p = zonedParts(ms, tz);
	return `${WEEKDAYS[p.weekday].toUpperCase()} ${p.d}`;
}
