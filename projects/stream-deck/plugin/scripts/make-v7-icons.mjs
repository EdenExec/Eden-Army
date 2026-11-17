// Renders the v7 key faces (Cross, Barny's Workshop, Gemini, Music in the Sabbath tone) to ../design/v7/ as SVG and PNG
// at 144 and 288, straight from src/lib/keyface.js so the plugin and the PNG files can never drift apart.
// Run: node scripts/make-v7-icons.mjs
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { crossKeyFace, glyphFace } from "../src/lib/keyface.js";

const out = fileURLToPath(new URL("../../design/v7/", import.meta.url));
mkdirSync(out, { recursive: true });
// The PNGs are full-bleed like the v3 icons (the device draws its own key corners); the plugin's live faces keep the inset.
const bleed = (svg) => svg.replace(/<rect width="144" height="144" fill="[^"]+"\/><rect x="4" y="4" width="136" height="136" rx="14" fill="([^"]+)"\/>/, '<rect width="144" height="144" fill="$1"/>');
const faces = Object.fromEntries(Object.entries({
	"key-cross": crossKeyFace({ tone: "ready" }),
	"key-cross-dim": crossKeyFace({ tone: "rest" }),
	"key-barnys-workshop": glyphFace({ glyph: "workshop", label: "Barny's" }),
	"key-gemini": glyphFace({ glyph: "gemini", label: "Gemini" }),
}).map(([k, v]) => [k, bleed(v)]));
const candidates = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", "/opt/pw-browsers/chromium/chrome-linux/chrome"].filter(Boolean);
const exe = candidates.find((p) => existsSync(p) && true);
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
for (const scale of [1, 2]) {
	const page = await browser.newPage({ viewport: { width: 144, height: 144 }, deviceScaleFactor: scale });
	for (const [name, svg] of Object.entries(faces)) {
		if (scale === 1) writeFileSync(`${out}${name}.svg`, svg);
		await page.setContent(`<body style="margin:0">${svg}</body>`);
		await page.screenshot({ path: `${out}${name}-${144 * scale}.png` });
	}
}
await browser.close();
console.log("wrote", Object.keys(faces).join(", "));
