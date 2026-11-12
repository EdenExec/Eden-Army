// Renders every key-*.svg in this folder to png/<name>-144.png and -288.png (Chromium via Playwright).
// Usage: node render-png.cjs   (run from design/v3 after gen3.py)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
(async () => {
  const dir = __dirname, out = path.join(dir, "png");
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const scale of [1, 2]) {
    const ctx = await b.newContext({ viewport: { width: 144, height: 144 }, deviceScaleFactor: scale });
    const page = await ctx.newPage();
    for (const f of fs.readdirSync(dir).filter((n) => /^key-.*\.svg$/.test(n))) {
      const svg = fs.readFileSync(path.join(dir, f), "utf8");
      await page.setContent(`<body style="margin:0">${svg}</body>`);
      await page.screenshot({ path: path.join(out, f.replace(".svg", `-${144 * scale}.png`)) });
    }
    await ctx.close();
  }
  await b.close();
})();
