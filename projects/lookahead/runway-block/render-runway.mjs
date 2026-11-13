#!/usr/bin/env node
// Renders the runway block to a PNG (and optionally a one-page PDF) from a JSON file.
// Usage: node render-runway.mjs <data.json> <out.png> [--width 1600] [--dark] [--pdf out.pdf] [--html out.html]
// The JSON replaces the contents of <script type="application/json" id="runway-data"> in runway.html.
// No network: Montserrat is embedded from the repo's own font files when present, otherwise the system fallback is used.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); if (i < 0) return dflt; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const width = parseInt(opt("--width", "1600"), 10);
const pdfOut = opt("--pdf", "");
const htmlOut = opt("--html", "");
const dark = flag("--dark");
const [jsonPath, pngPath] = args;
if (!jsonPath || !pngPath) {
  console.error("usage: node render-runway.mjs <data.json> <out.png> [--width 1600] [--dark] [--pdf out.pdf] [--html out.html]");
  process.exit(2);
}

// 1. Validate the data (JSON only; the page itself handles missing optional fields).
const data = JSON.parse(readFileSync(resolve(jsonPath), "utf8"));
const problems = [];
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
if (!isDate(data.asOf)) problems.push("asOf is not YYYY-MM-DD");
if (!isDate(data.startMonday)) problems.push("startMonday is not YYYY-MM-DD");
if (data.weeks && (data.weeks < 6 || data.weeks > 8)) problems.push("weeks should be 6 to 8 (clamped)");
for (const e of data.events || []) {
  if (!isDate(e.start)) problems.push(`event ${e.id}: bad start`);
  if (e.end && !isDate(e.end)) problems.push(`event ${e.id}: bad end`);
  if (!["work", "family", "travel", "milestone", "deadline"].includes(e.kind)) problems.push(`event ${e.id}: unknown kind ${e.kind} (shown as work)`);
  if (e.status && !["confirmed", "tentative"].includes(e.status)) problems.push(`event ${e.id}: unknown status ${e.status}`);
}
problems.forEach((p) => console.warn("warning:", p));

// 2. Build the page: inject the data, and embed Montserrat if the repo has it.
let html = readFileSync(join(here, "runway.html"), "utf8");
const open = '<script type="application/json" id="runway-data">';
const a = html.indexOf(open), b = html.indexOf("</script>", a);
if (a < 0 || b < 0) throw new Error("runway.html has no runway-data tag");
const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
html = html.slice(0, a + open.length) + "\n" + json + "\n" + html.slice(b);

const fontDir = resolve(here, "../../../workshop/submittal/fonts");
if (existsSync(fontDir)) {
  const faces = readdirSync(fontDir).filter((f) => /^montserrat-latin-\d+-(normal|italic)\.woff2$/.test(f)).map((f) => {
    const [, w, s] = /-(\d+)-(normal|italic)\./.exec(f);
    const b64 = readFileSync(join(fontDir, f)).toString("base64");
    return `@font-face{font-family:"Montserrat";font-style:${s};font-weight:${w};src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
  });
  if (faces.length) html = html.replace("</head>", `<style>${faces.join("")}</style>\n</head>`);
}
if (htmlOut) writeFileSync(resolve(htmlOut), html);

// 3. Render with Playwright Chromium.
const require = createRequire(import.meta.url);
let chromium;
for (const mod of ["playwright", "playwright-core", "/opt/node-tools/node_modules/playwright", "/opt/node22/lib/node_modules/playwright"]) {
  try { ({ chromium } = require(mod)); break; } catch {}
}
if (!chromium) throw new Error("Playwright not found");
const exeCandidates = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium/chrome-linux64/chrome", "/opt/pw-browsers/chromium/chrome-linux/chrome",
  ...(existsSync("/opt/pw-browsers") ? readdirSync("/opt/pw-browsers").filter((d) => /^chromium-\d+$/.test(d)).map((d) => `/opt/pw-browsers/${d}/chrome-linux64/chrome`) : [])].filter(Boolean);
const executablePath = exeCandidates.find((p) => existsSync(p));
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: width < 600 ? 2 : 1, colorScheme: dark ? "dark" : "light" });
page.on("request", (r) => { if (!r.url().startsWith("data:") && !r.url().startsWith("about:")) console.warn("warning: external request", r.url()); });
await page.setContent(html, { waitUntil: "load" });
await page.waitForFunction(() => document.documentElement.dataset.rendered === "1");
await page.evaluate(() => document.fonts.ready.then(() => window.__runwayRelayout && window.__runwayRelayout()));
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 0) console.warn(`warning: page scrolls sideways by ${overflow}px at ${width}px`);
await page.screenshot({ path: resolve(pngPath), fullPage: true });
let pages = null;
if (pdfOut) {
  await page.setViewportSize({ width: 995, height: 760 }); // US Letter landscape less 0.32in margins, in CSS px
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.evaluate(() => window.__runwayRelayout && window.__runwayRelayout());
  const buf = await page.pdf({ path: resolve(pdfOut), format: "Letter", landscape: true, printBackground: true, preferCSSPageSize: true });
  pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (pages > 1) console.warn(`warning: print runs to ${pages} pages`);
}
await browser.close();
console.log(`wrote ${pngPath} (${width}px${dark ? ", dark" : ""}, sideways overflow ${overflow}px${pages != null ? `, print ${pages} page(s)` : ""})`);
