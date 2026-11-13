// Turns live facts (time, meetings, timer, volume, Sabbath) into the plain "view model" the strip draws.
// No drawing and no system calls here, so it is easy to test.

import { LABELS, RULES } from "../theme.js";
import { formatCountdown, formatClock } from "./countdown.js";
import { selectMeeting, isCream, joinState } from "./meetings.js";
import { sabbathWindow, DEFAULT_PLACE } from "./sabbath.js";
import { clockLabel, dayLabel } from "./tz.js";

// input: { now, events, place:{lat,lon,tz}, timer: FocusTimer, volume:{level,muted} }
export function buildView({ now, events = [], place = DEFAULT_PLACE, timer, volume = { level: 0, muted: false } }) {
	const tz = place.tz;
	const sab = sabbathWindow(now, place);
	const rest = !!sab?.active;
	const sel = selectMeeting(events, now);
	const join = joinState(sel, now);

	let left;
	if (rest) {
		left = { label: LABELS.rest, title: LABELS.restTitle, countdown: formatCountdown(sab.end - now), progress: null, cream: false };
	} else if (sel.kind === "none") {
		const toSabbath = sab ? sab.start - now : Infinity;
		if (toSabbath > 0 && toSabbath <= 24 * 3600000) {
			left = {
				label: LABELS.sabbathSoon,
				title: `${LABELS.sabbathSoonTitle} ${clockLabel(sab.start, tz)}`,
				countdown: formatCountdown(toSabbath),
				progress: null,
				cream: false,
			};
		} else {
			left = { label: LABELS.noMeeting, title: LABELS.noMeetingTitle, countdown: "", progress: null, cream: false };
		}
	} else if (sel.kind === "live") {
		const ev = sel.event;
		left = {
			label: `${LABELS.inCall} ${clockLabel(ev.endMs, tz)}`,
			title: ev.title,
			countdown: formatCountdown(ev.endMs - now),
			progress: Math.min(1, Math.max(0, (now - ev.startMs) / Math.max(1, ev.endMs - ev.startMs))),
			cream: isCream(ev, now),
		};
	} else {
		const ev = sel.event;
		const lookahead = RULES.progressLookaheadMin * 60000;
		left = {
			label: `${LABELS.next}  ${clockLabel(ev.startMs, tz)}`,
			title: ev.title,
			countdown: formatCountdown(ev.startMs - now),
			progress: 1 - Math.min(lookahead, Math.max(0, ev.startMs - now)) / lookahead,
			cream: isCream(ev, now),
		};
	}

	const running = timer.running;
	const flashing = timer.flashing(now);
	const focus = {
		state: flashing ? "done" : running ? "running" : "idle",
		minutes: timer.minutes,
		clock: formatClock(timer.remainingMs(now) / 1000),
		flashOn: flashing && Math.floor(now / 1000) % 2 === 0,
	};

	return {
		rest,
		left,
		dayCaption: rest ? "" : dayLabel(now, tz),
		desktopCaption: rest ? "" : LABELS.desktopHint,
		focus,
		volume: { level: Math.round(volume.level), muted: !!volume.muted },
		join: {
			label: LABELS.join,
			timeLabel: join.ev ? clockLabel(join.ev.startMs, tz) : "",
			cream: !rest && join.cream,
			enabled: !rest && !!join.link,
			link: rest ? null : join.link,
		},
	};
}
