// Key faces (144 x 144 SVG). Same palette and font as the strip; edit looks in ../theme.js.
import { COLORS as C, FONT } from "../theme.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// big: optional large mark (e.g. a numeral); label: word under it; sub: small line under the label.
// tone: "ready" (charcoal, cream text), "now" (cream key), "dim" (faded).
export function keyFace({ big = "", label = "", sub = "", tone = "ready" }) {
	const bg = tone === "now" ? C.cream : C.key;
	const main = tone === "now" ? C.ink : tone === "dim" ? C.off : C.cream;
	const quiet = tone === "now" ? C.greyOnCream : tone === "dim" ? C.off : C.grey;
	const t = (x, y, size, weight, fill, str, spacing) =>
		str ? `<text x="${x}" y="${y}" font-family="${esc(FONT)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" letter-spacing="${spacing}">${esc(str)}</text>` : "";
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">` +
		`<rect width="144" height="144" fill="${C.panel}"/><rect x="4" y="4" width="136" height="136" rx="14" fill="${bg}"/>` +
		t(72, big && label ? 82 : 78, big ? 60 : 24, 600, main, big, 0) +
		t(72, big ? 116 : 84, big ? 17 : 22, 600, main, label.toUpperCase(), 3) +
		t(72, big ? 132 : 112, 14, 500, quiet, sub, 1.5) +
		`</svg>`
	);
}

// Join key: dim "JOIN" until a meeting with a link is near; cream with the start time at 15 minutes.
export function joinKeyFace(join) {
	if (join.cream) return keyFace({ label: join.label, sub: join.timeLabel.replace(" ", ""), tone: "now" });
	return keyFace({ label: join.label, tone: join.enabled ? "ready" : "dim" });
}

export const svgDataUri = (svg) => `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`;

// The Cross (v7): one thin vertical stroke and one shorter crossbar, a third of the way down. No word, no ornament.
// Drawn on the same 144 x 144 key as every other face. tone: "ready" (charcoal key) or "rest" (panel, softer cream).
export function crossGlyph(stroke, cx = 72, top = 34, len = 76) {
	const bar = Math.round(len * 0.34);
	const half = Math.round(len * 0.24);
	return (
		`<g fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round">` +
		`<path d="M${cx} ${top}V${top + len}"/><path d="M${cx - half} ${top + bar}H${cx + half}"/></g>`
	);
}

export function crossKeyFace({ tone = "ready" } = {}) {
	const bg = tone === "rest" ? C.panel : C.key;
	const stroke = tone === "rest" ? C.restText : C.cream;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">` +
		`<rect width="144" height="144" fill="${C.panel}"/><rect x="4" y="4" width="136" height="136" rx="14" fill="${bg}"/>` +
		crossGlyph(stroke) +
		`</svg>`
	);
}

// ---- glyph keys for the Sabbath layout (v7): one or two strokes and one word, as in design/v3 ----
export const GLYPHS = {
	music: '<circle cx="64" cy="70" r="8"/><path d="M72 70V36l16 8"/>',
	// a plain hammer: handle and head
	workshop: '<path d="M58 82L82 48"/><path d="M72 40l22 15"/>',
	// the zodiac sign for twins: two upright strokes joined by two soft arcs
	gemini: '<path d="M54 42q18 10 36 0"/><path d="M54 78q18-10 36 0"/><path d="M63 48v24M81 48v24"/>',
};

export function glyphFace({ glyph, label = "", tone = "ready" }) {
	const g = GLYPHS[glyph];
	if (!g) return keyFace({ label });
	const bg = tone === "rest" ? C.panel : C.key;
	const ink = tone === "rest" ? C.restText : C.cream;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">` +
		`<rect width="144" height="144" fill="${C.panel}"/><rect x="4" y="4" width="136" height="136" rx="14" fill="${bg}"/>` +
		`<g fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${g}</g>` +
		`<text x="72" y="116" font-family="${esc(FONT)}" font-size="17" font-weight="600" fill="${ink}" text-anchor="middle" letter-spacing="1.8">${esc(label.toUpperCase())}</text>` +
		`</svg>`
	);
}
