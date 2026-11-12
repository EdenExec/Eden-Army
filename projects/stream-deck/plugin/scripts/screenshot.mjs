// Screenshots preview/index.html (and each state) with Playwright's Chromium. Run: npm run previews && npm run screenshots
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { readdirSync, existsSync } from "node:fs";

const root = fileURLToPath(new URL("../preview/", import.meta.url));
const candidates = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium/chrome-linux/chrome", "/opt/pw-browsers/chromium"].filter(Boolean);
let exe = candidates.find((p) => existsSync(p) && !readdirSafe(p));
function readdirSafe(p) { try { readdirSync(p); return true; } catch { return false; } }
if (!exe) {
	// fall back to Playwright's own lookup
	exe = undefined;
}
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1700, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`file://${root}index.html`);
await page.screenshot({ path: `${root}all-states.png`, fullPage: true });
for (const id of ["workday", "meeting-12min", "in-call", "sabbath"]) {
	await page.locator(`#${id}`).screenshot({ path: `${root}${id}.png` });
}
await browser.close();
console.log("wrote screenshots in preview/");
