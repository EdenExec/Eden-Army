import { RULES } from "../theme.js";

const URL_RE = /https?:\/\/[^\s<>"')\]\\]+/gi;
// Hosts we treat as a video call link, in order of preference when several are present.
const CALL_HOST = /(^|\.)(zoom\.us|zoomgov\.com|meet\.google\.com|teams\.microsoft\.com|teams\.live\.com|webex\.com)$/i;

function cleanUrl(u) {
	return u.replace(/[.,;:!?]+$/, "");
}

function callUrlsIn(text) {
	const found = [];
	for (const raw of text.match(URL_RE) ?? []) {
		const url = cleanUrl(raw);
		try {
			const parsed = new URL(url);
			if (parsed.protocol === "https:" && CALL_HOST.test(parsed.hostname)) found.push(url);
		} catch {
			// not a URL
		}
	}
	return found;
}

// Find the join link of an event. Looks at X-GOOGLE-CONFERENCE, then LOCATION, then DESCRIPTION.
// Only https links to Zoom, Google Meet, Teams or Webex are returned.
export function findJoinLink(ev) {
	for (const field of [ev.conference, ev.location, ev.description]) {
		if (!field) continue;
		const hit = callUrlsIn(field)[0];
		if (hit) return hit;
	}
	return null;
}

// The 15-minute cream rule: cream from 15 minutes before the start until 5 minutes after it.
export function isCream(ev, now, rules = RULES) {
	if (!ev) return false;
	return now >= ev.startMs - rules.creamBeforeMin * 60000 && now <= ev.startMs + rules.creamAfterMin * 60000;
}

// Which meeting does the strip show?
// events: sorted occurrences. Returns { kind: "next" | "live" | "none", event }.
//  - an unfinished meeting is "live" when it has started, "next" when it has not.
//  - if one is live and the next one starts within the cream window, the next one wins.
export function selectMeeting(events, now, rules = RULES) {
	const open = events.filter((e) => e.endMs > now).sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
	if (!open.length) return { kind: "none", event: null };
	const live = open.filter((e) => e.startMs <= now).pop() ?? null;
	const upcoming = open.find((e) => e.startMs > now) ?? null;
	if (live && upcoming && upcoming.startMs - now <= rules.creamBeforeMin * 60000) return { kind: "next", event: upcoming };
	if (live) return { kind: "live", event: live };
	return { kind: "next", event: upcoming };
}

// Join key state for the event the strip shows.
//  hidden: nothing to join (no meeting, no link, or more than 30 minutes away) -> dim "JOIN"
//  cream: within 15 minutes before, up to 15 minutes after the start -> cream with the start time
export function joinState(selection, now, rules = RULES) {
	const ev = selection.event;
	if (!ev) return { link: null, cream: false, ev: null };
	const link = findJoinLink(ev);
	if (!link) return { link: null, cream: false, ev };
	if (ev.startMs - now > rules.joinDimBeyondMin * 60000) return { link: null, cream: false, ev };
	const cream = now >= ev.startMs - rules.creamBeforeMin * 60000 && now <= ev.startMs + rules.joinKeyAfterMin * 60000;
	return { link, cream, ev };
}
