// Draws the whole touch strip as ONE 800 x 100 SVG, and cuts it into four 200 x 100 slices
// (one per dial) by shifting the viewBox. Colours, sizes and words come from ../theme.js.

import { COLORS as C, FONT, SIZES as S, STRIP, LABELS } from "../theme.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fit = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function text(x, y, size, weight, fill, str, { anchor = "start", spacing = 0, tabular = false } = {}) {
	if (str === "" || str === undefined) return "";
	const style = tabular ? ' style="font-variant-numeric:tabular-nums"' : "";
	return `<text x="${x}" y="${y}" font-family="${esc(FONT)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}"${style}>${esc(str)}</text>`;
}

function bar(x, y, w, frac, fill, track) {
	const f = Math.min(1, Math.max(0, frac));
	return `<rect x="${x}" y="${y}" width="${w}" height="2" fill="${track}" opacity=".35"/><rect x="${x}" y="${y - 1}" width="${Math.max(f > 0 ? 4 : 0, w * f)}" height="4" rx="2" fill="${fill}"/>`;
}

// Left half: the next meeting (or REST).
function leftHalf(m) {
	const { left, rest } = m;
	const cream = left.cream;
	const bg = cream ? C.cream : C.key;
	const main = rest ? C.restText : cream ? C.ink : C.cream;
	const quiet = rest ? C.restLabel : cream ? C.greyOnCream : C.grey;
	const M = S.margin;
	let g = `<rect width="400" height="100" fill="${rest ? C.panel : bg}"/>`;
	g += text(M, 26, S.small, 600, quiet, left.label, { spacing: 1.6 });
	g += text(M, 58, rest ? S.restTitle : S.title, 600, main, fit(left.title, S.titleMaxChars));
	g += text(400 - M, 58, rest ? 28 : S.big, 600, main, left.countdown, { anchor: "end", tabular: true });
	if (left.progress !== null) g += bar(M, 68, 400 - 2 * M, left.progress, cream ? C.ink : C.cream, quiet);
	return g;
}

// Right half: focus timer and volume.
function rightHalf(m) {
	const { focus, volume, rest } = m;
	const M = S.margin;
	let g = `<rect x="400" width="400" height="100" fill="${rest ? C.panel : C.key}"/>`;

	// Focus (x 400 to 600)
	if (rest) {
		g += text(418, 58, 20, 600, C.restFaint, "off");
	} else if (focus.state === "done") {
		g += `<rect x="400" width="200" height="100" fill="${focus.flashOn ? C.cream : C.key}"/>`;
		g += text(418, 58, S.big, 600, focus.flashOn ? C.ink : C.cream, LABELS.focusDone);
	} else if (focus.state === "running") {
		g += text(418, 58, S.big, 600, C.cream, focus.clock, { tabular: true });
	} else {
		g += text(418, 58, S.big, 600, C.cream, String(focus.minutes), { tabular: true });
		g += text(418 + 12 + String(focus.minutes).length * 20, 58, S.unit, 600, C.grey, LABELS.min);
	}

	// Volume (x 600 to 800)
	const vText = rest ? C.restText : C.cream;
	const vFill = volume.muted ? (rest ? C.restLabel : C.grey) : vText;
	g += text(618, 58, volume.muted ? 20 : S.big, 600, vFill, volume.muted ? LABELS.muted : String(volume.level), { tabular: true });
	if (!volume.muted) g += bar(666, 50, 116, volume.level / 100, vText, rest ? C.restLabel : C.grey);
	return g;
}

function dividers(m) {
	if (m.rest) return "";
	const left = m.left.cream ? C.cream : C.divider;
	return `<rect x="599.5" y="14" width="1" height="72" fill="${C.divider}"/><rect x="399.5" y="14" width="1" height="72" fill="${left}"/>`;
}

// Captions at the bottom of each slice: dial name on the left, small hint on the right.
function captions(m) {
	const { rest, focus } = m;
	const cream = m.left.cream;
	const dim = C.off;
	const q = rest ? dim : C.grey;
	const qLeft = cream ? C.greyOnCream : q;
	const focusHint = focus.state === "running" ? LABELS.focusRunning : LABELS.focusIdle;
	const items = [
		[18, LABELS.dials[0], qLeft, 182, m.dayCaption, qLeft],
		[218, LABELS.dials[1], qLeft, 382, m.desktopCaption, qLeft],
		[418, LABELS.dials[2], rest ? dim : C.grey, 582, rest ? "" : focusHint, rest ? dim : C.grey],
		[618, LABELS.dials[3], rest ? C.restLabel : C.grey, 0, "", C.grey],
	];
	let g = "";
	for (const [x, name, fill, hx, hint, hfill] of items) {
		g += text(x, 92, S.caption, 700, fill, name, { spacing: 1.8 });
		if (hint) g += text(hx, 92, S.caption, 500, hfill, hint, { anchor: "end", spacing: 1 });
	}
	return g;
}

function body(m) {
	return `<rect width="${STRIP.width}" height="${STRIP.height}" fill="${C.panel}"/>${leftHalf(m)}${rightHalf(m)}${dividers(m)}${captions(m)}`;
}

// The full strip, 800 x 100.
export function stripSvg(m) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${STRIP.width}" height="${STRIP.height}" viewBox="0 0 ${STRIP.width} ${STRIP.height}">${body(m)}</svg>`;
}

// One dial's 200 x 100 slice of the same drawing (same content, shifted viewBox).
// With { flash: true } a light cream wash covers the slice (used for a brief press or "timer done" flash).
export function sliceSvg(m, index, { flash = false } = {}) {
	const x = Math.max(0, Math.min(STRIP.slices - 1, index)) * STRIP.sliceWidth;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${STRIP.sliceWidth}" height="${STRIP.height}" viewBox="${x} 0 ${STRIP.sliceWidth} ${STRIP.height}">${body(m)}${flash ? `<rect x="${x}" width="${STRIP.sliceWidth}" height="${STRIP.height}" fill="${C.cream}" opacity=".35"/>` : ""}</svg>`;
}

// The same, as an SVG data URI (the form the layout's pixmap value accepts).
export function sliceDataUri(m, index, opts) {
	return `data:image/svg+xml;charset=utf8,${encodeURIComponent(sliceSvg(m, index, opts))}`;
}
