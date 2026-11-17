// Renders the plugin icon (PNG, 256 and 512) from scripts/plugin-icon.svg. Run: node scripts/make-icons.mjs
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const svg = readFileSync(here("plugin-icon.svg"), "utf8");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
for (const [size, name] of [[256, "plugin.png"], [512, "plugin@2x.png"]]) {
	const page = await browser.newPage({ viewport: { width: size, height: size } });
	await page.setContent(`<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${svg.replace(/width="512" height="512"/, `width="${size}" height="${size}"`)}</div></body>`);
	await page.screenshot({ path: here(`../com.kdtw.edendeck.sdPlugin/imgs/${name}`), omitBackground: true });
}
await browser.close();
