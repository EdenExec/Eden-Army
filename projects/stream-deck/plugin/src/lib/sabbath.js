import { zonedParts } from "./tz.js";

export const DEFAULT_PLACE = { lat: 43.615, lon: -116.202, tz: "America/Boise" }; // Boise

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

// Sunset as a UTC instant (ms) for a calendar date (y, m 1-12, d) at a place.
// NOAA solar position formulas; good to a minute or two, which is plenty here.
export function sunsetUtc(y, m, d, lat, lon) {
	// Julian century at about local solar noon of that date.
	const jd = Date.UTC(y, m - 1, d, 12) / 86400000 + 2440587.5 - lon / 360;
	const T = (jd - 2451545) / 36525;
	const L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
	const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
	const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
	const C =
		Math.sin(rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
		Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * T) +
		Math.sin(rad(3 * M)) * 0.000289;
	const omega = 125.04 - 1934.136 * T;
	const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega));
	const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
	const eps = eps0 + 0.00256 * Math.cos(rad(omega));
	const decl = Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda)));
	const yy = Math.tan(rad(eps / 2)) ** 2;
	const eqTime =
		4 *
		deg(
			yy * Math.sin(rad(2 * L0)) -
				2 * e * Math.sin(rad(M)) +
				4 * e * yy * Math.sin(rad(M)) * Math.cos(rad(2 * L0)) -
				0.5 * yy * yy * Math.sin(rad(4 * L0)) -
				1.25 * e * e * Math.sin(rad(2 * M)),
		);
	const cosHa = Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(decl)) - Math.tan(rad(lat)) * Math.tan(decl);
	if (cosHa > 1 || cosHa < -1) return null; // sun never sets / rises (not a concern at these latitudes)
	const ha = deg(Math.acos(cosHa));
	const minutesUtc = 720 - 4 * (lon - ha) - eqTime;
	return Date.UTC(y, m - 1, d) + minutesUtc * 60000;
}

// Calendar date + weekday arithmetic without time zones.
function addDays(y, m, d, n) {
	const t = new Date(Date.UTC(y, m - 1, d + n));
	return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), weekday: t.getUTCDay() };
}

// Sabbath: Friday sunset to Saturday sunset, in the place's own dates.
// Returns { active, start, end }: while active, start/end are the current window;
// otherwise they are the next window.
export function sabbathWindow(nowMs, place = DEFAULT_PLACE) {
	const { lat, lon, tz } = place;
	const today = zonedParts(nowMs, tz);
	let next = null;
	for (let i = -2; i <= 8; i++) {
		const fri = addDays(today.y, today.m, today.d, i);
		if (fri.weekday !== 5) continue;
		const sat = addDays(fri.y, fri.m, fri.d, 1);
		const start = sunsetUtc(fri.y, fri.m, fri.d, lat, lon);
		const end = sunsetUtc(sat.y, sat.m, sat.d, lat, lon);
		if (start === null || end === null) continue;
		if (nowMs >= start && nowMs < end) return { active: true, start, end };
		if (start > nowMs && !next) next = { active: false, start, end };
	}
	return next;
}
