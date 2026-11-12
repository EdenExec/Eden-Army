// Writes the four strip states into preview/ as SVG, plus a page (preview/index.html) that shows
// each state with its four dial slices and the Join key. Run: npm run previews
import { writeFileSync, mkdirSync } from "node:fs";
import { buildView } from "../src/lib/view.js";
import { stripSvg, sliceSvg } from "../src/lib/strip.js";
import { joinKeyFace } from "../src/lib/keyface.js";
import { FocusTimer } from "../src/lib/timer.js";
import { parseIcs, expandEvents } from "../src/lib/ical.js";
import { GOOGLE_FEED, BOISE } from "../test/fixtures.js";

const place = { lat: 43.615, lon: -116.202, tz: "America/Boise" };
const events = expandEvents(parseIcs(GOOGLE_FEED, { defaultTz: place.tz }), BOISE(12, 0), BOISE(14, 0));

const states = [
	{ id: "workday", title: "Workday, 9:00 AM", now: BOISE(12, 9), volume: { level: 60, muted: false } },
	{ id: "meeting-12min", title: "Meeting in 12 minutes", now: BOISE(12, 10, 18), volume: { level: 60, muted: false } },
	{ id: "in-call", title: "In a call, focus timer running", now: BOISE(12, 10, 52), volume: { level: 36, muted: false }, timer: 18 },
	{ id: "sabbath", title: "Sabbath (Saturday noon)", now: Date.UTC(2026, 10, 14, 19), volume: { level: 40, muted: false } },
];

mkdirSync(new URL("../preview/", import.meta.url), { recursive: true });
let page = `<!doctype html><meta charset="utf-8"><title>Strip preview</title><style>
body{margin:0;background:#f5f2ea;font:14px Helvetica,Arial,sans-serif;color:#14130e;padding:24px;width:1640px}
h2{margin:28px 0 8px;font-size:16px}.row{display:flex;gap:12px;align-items:flex-start}
.full svg{width:1600px;height:200px;display:block;border-radius:6px}
.slices{display:flex;gap:16px;margin-top:10px}.slices svg{width:400px;height:200px;display:block;border-radius:6px}
.key svg{width:144px;height:144px;display:block}small{color:#6b655a}</style>`;
for (const s of states) {
	const timer = new FocusTimer();
	if (s.timer) {
		timer.minutes = 25;
		timer.start(s.now - (25 - s.timer) * 60000);
	}
	const v = buildView({ now: s.now, events, place, timer, volume: s.volume });
	writeFileSync(new URL(`../preview/strip-${s.id}.svg`, import.meta.url), stripSvg(v));
	page += `<section id="${s.id}"><h2>${s.title}</h2><div class="full">${stripSvg(v)}</div><div class="row"><div class="slices">${[0, 1, 2, 3].map((i) => sliceSvg(v, i)).join("")}</div><div class="key">${joinKeyFace(v.join)}<small>Join key</small></div></div></section>`;
}
writeFileSync(new URL("../preview/index.html", import.meta.url), page + "<p><small>Top: the whole 800 x 100 strip. Below: the four 200 x 100 slices, one per dial, shown at 2x.</small></p>");
console.log("wrote preview/index.html and four strip SVGs");
