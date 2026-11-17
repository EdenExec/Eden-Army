// npm run doc -- path/to/file.md [--out dir] [--pdf] [--cover|--no-cover]
// Lints a markdown document against the Eden writing rules and renders the branded HTML (and optionally PDF).
// Front matter: title (required), subtitle, author, date, cover: true|false, toc: false
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { lintDoc } from "../brand/lint.ts";
import { renderDoc } from "../brand/doc.ts";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--out");
const flag = (n: string) => args.includes(`--${n}`);
const outDir = args.includes("--out") ? args[args.indexOf("--out") + 1]! : "deliverables/docs";

function findChrome(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(root)) return undefined;
  for (const d of readdirSync(root).filter((x) => /^chromium-\d+$/.test(x))) {
    for (const sub of ["chrome-linux", "chrome-linux64"]) {
      const p = join(root, d, sub, "chrome");
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

try {
  if (!file) throw new Error("Usage: npm run doc -- path/to/file.md [--out dir] [--pdf] [--cover|--no-cover]");
  const md = readFileSync(file, "utf8");
  const lint = lintDoc(md);
  for (const e of lint.errors) console.error(`ERROR   ${e}`);
  for (const w of lint.warnings) console.log(`WARNING ${w}`);
  if (lint.errors.length) process.exit(2);
  mkdirSync(outDir, { recursive: true });
  const base = basename(file).replace(/\.md$/i, "");
  const htmlPath = join(outDir, `${base}.html`);
  writeFileSync(htmlPath, renderDoc(md, flag("cover") ? { cover: true } : flag("no-cover") ? { cover: false } : {}));
  console.log(`${lint.warnings.length ? `${lint.warnings.length} warning(s). ` : "Passes the Eden writing rules. "}Wrote ${htmlPath}`);
  if (flag("pdf")) {
    const chrome = findChrome();
    if (!chrome) console.log("No Chromium found, so no PDF. Open the HTML and print it.");
    else {
      const pdf = join(outDir, `${base}.pdf`);
      try {
        execFileSync(chrome, ["--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${resolve(pdf)}`, pathToFileURL(resolve(htmlPath)).href], { stdio: "ignore", timeout: 60_000 });
        console.log(`Wrote ${pdf} (Montserrat is embedded)`);
      } catch { console.log("PDF export failed. Open the HTML and print it."); }
    }
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
