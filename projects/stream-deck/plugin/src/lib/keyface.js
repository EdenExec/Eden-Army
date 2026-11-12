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
