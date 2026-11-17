#!/usr/bin/env python3
"""Build the client-blind partner list of Eden's open job orders.

    python3 build.py                      # draft, as of the default date
    python3 build.py --as-of "20 Nov 2026"
    python3 build.py --final              # drop the "Draft for Kev's review" banner

Reads the JO deck and the overrides, keeps confirmed open roles only (drops
review: true and everything under overrides["jo_closed"]), writes index.html next
to this script, then scans the page for client, owner and candidate names and for
pay or fee wording. Any hit stops the build and nothing is written.

Partners see: title, market, sector, client_blind, must-haves, sell, priority,
and an EPG reference code. Never: client names, fees or splits, pay, Eden owners,
candidates, or rows still marked review.
"""
import argparse
import html
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRATCH = Path("/tmp/claude-0/-home-user-Agent-Builder/fd7334b6-e351-59ff-b6a1-40fa39714868/scratchpad/friday-review")
DEFAULT_DECK = SCRATCH / "casey" / "jo-deck.json"
DEFAULT_OVERRIDES = SCRATCH / "radar" / "overrides.json"
DEFAULT_AS_OF = "13 Nov 2026"

# Kev fills these in before sharing. CONTACT shows under the submit line when set.
CONTACT = ""

# Client and project names that must never reach partners. Client names from
# overrides["client_names"] are added at build time, with their first word.
BLOCKED_NAMES = [
    "Baker", "PB South", "VMG", "Moss", "Triton", "Megawatt", "Hoffman", "XL",
    "MK Marlow", "Marlow", "Sherrill", "INL", "Idaho National",
    # project nicknames used internally
    "CityPlace", "Brickell", "Hibiscus", "Project X", "HSI",
]
# Pay, fee and split wording in role text (the footer's split-terms line is exempt).
MONEY = re.compile(r"\$|\bfees?\b|\bsplits?\b|\bsalary\b|\bpay\b|\bcompensation\b|\bbase\b|\bbonus\b|\b\d+\s?k\b", re.I)

# Per-JO rewording so the text stays blind. Applied before the scan.
# Most of these rows are still review: true; the rewording is ready for when they are confirmed.
REWORD = {
    "jo-007": {"sell": "Lead field operations on a major downtown West Palm Beach build."},
    "jo-013": {"must_haves": [
        "Technical elevator expertise, not a general CM",
        "Background at an elevator manufacturer or installer",
        "Manages a very large elevator scope",
    ]},
    "jo-033": {"market": "Eastern Idaho"},
    "jo-035": {"market": "Eastern Idaho"},
}

PRIORITY = {"hot": "Hot", "active": "Active", "new": "Active"}
SECTORS = {
    "commercial": "Commercial", "mechanical": "MEP", "data centers": "Data centers",
    "industrial": "Industrial", "healthcare": "Healthcare", "other": "Low-voltage and other",
}
REGIONS = ["Florida", "DC and Virginia", "Texas", "West", "Midwest and Gulf", "Location to confirm"]
WEST = {"WA", "ID", "CA", "NV", "OR", "UT", "AZ", "CO", "MT", "WY", "NM"}
MIDWEST_GULF = {"OH", "ND", "SD", "LA", "MS", "AL", "IL", "IN", "MI", "MN", "WI", "IA", "MO", "KS", "NE", "OK"}
STATE_NAMES = {"Louisiana": "LA", "North Dakota": "ND", "Ohio": "OH", "Idaho": "ID", "Washington State": "WA"}


def region_of(market: str) -> str:
    m = market or ""
    if re.search(r"to be confirmed|\btbc\b|\btbd\b", m, re.I) and not re.search(r"\bFL\b|Florida", m):
        return "Location to confirm"
    if re.search(r"\bFL\b|Florida", m):
        return "Florida"
    if re.search(r"\bDC\b|\bVA\b|Virginia|Maryland|\bMD\b", m):
        return "DC and Virginia"
    if re.search(r"\bTX\b|Texas", m):
        return "Texas"
    codes = set(re.findall(r"\b([A-Z]{2})\b", m))
    codes |= {c for n, c in STATE_NAMES.items() if n in m}
    if codes & WEST:
        return "West"
    if codes & MIDWEST_GULF:
        return "Midwest and Gulf"
    return "Location to confirm"


def ref_code(jo_id: str) -> str:
    return "EPG-" + re.sub(r"\D", "", jo_id).zfill(3)


def load_roles(deck, overrides):
    closed = set(overrides.get("jo_closed", {}))
    roles = []
    for r in deck:
        if r.get("review") or r["id"] in closed:
            continue
        r = {**r, **REWORD.get(r["id"], {})}
        roles.append({
            "ref": ref_code(r["id"]),
            "title": r["title"],
            "market": r["market"],
            "region": region_of(r["market"]),
            "sector": r["sector"],
            "sector_label": SECTORS.get(r["sector"], r["sector"].title()),
            "blind": r["client_blind"],
            "must": r["must_haves"],
            "sell": r["sell"],
            "priority": PRIORITY.get(r["priority"], "Active"),
        })
    roles.sort(key=lambda x: (REGIONS.index(x["region"]), x["priority"] != "Hot", x["ref"]))
    return roles


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


e = html.escape


def render(roles, as_of, draft):
    n = len(roles)
    hot = sum(r["priority"] == "Hot" for r in roles)
    regions = [g for g in REGIONS if any(r["region"] == g for r in roles)]
    sectors = [s for s in SECTORS if any(r["sector"] == s for r in roles)]
    sectors += sorted({r["sector"] for r in roles} - set(sectors))

    def chip(group, value, label, count):
        return (f'<button type="button" class="chip" id="f-{group}-{slug(value)}" data-group="{group}" '
                f'data-value="{e(value)}" aria-pressed="{"true" if value == "all" else "false"}">'
                f'{e(label)}<span class="n">{count}</span></button>')

    region_chips = chip("region", "all", "All", n) + "".join(
        chip("region", g, g, sum(r["region"] == g for r in roles)) for g in regions)
    sector_chips = chip("sector", "all", "All", n) + "".join(
        chip("sector", s, SECTORS.get(s, s.title()), sum(r["sector"] == s for r in roles)) for s in sectors)

    sections = []
    for g in regions:
        rs = [r for r in roles if r["region"] == g]
        g_hot = sum(r["priority"] == "Hot" for r in rs)
        items = []
        for r in rs:
            must = "".join(f"<li>{e(m)}</li>" for m in r["must"])
            pill = "pill hot" if r["priority"] == "Hot" else "pill"
            items.append(f"""
      <article class="role" data-region="{e(r['region'])}" data-sector="{e(r['sector'])}">
        <div class="role-id">
          <button type="button" class="ref" data-ref="{r['ref']}" aria-label="Copy reference code {r['ref']}">{r['ref']}</button>
          <span class="{pill}">{r['priority']}</span>
        </div>
        <div class="role-main">
          <h3>{e(r['title'])}</h3>
          <p class="where">{e(r['market'])}<span class="sep" aria-hidden="true">/</span>{e(r['sector_label'])}</p>
          <p class="blind">{e(r['blind'])}</p>
        </div>
        <div class="role-detail">
          <p class="label">Must-haves</p>
          <ul class="must">{must}</ul>
          <p class="sell"><span class="label">The pitch</span>{e(r['sell'])}</p>
        </div>
      </article>""")
        sections.append(f"""
    <section class="region" data-region="{e(g)}" aria-labelledby="h-{slug(g)}">
      <div class="region-head">
        <h2 id="h-{slug(g)}">{e(g)}</h2>
        <p class="tally"><span class="tally-n">{len(rs)}</span> {"role" if len(rs) == 1 else "roles"} · {g_hot} hot</p>
      </div>
      <div class="roles">{''.join(items)}
      </div>
    </section>""")

    banner = ('\n  <!-- DRAFT BANNER: delete this one line, or run build.py --final -->\n'
              '  <div class="draft" id="draft-banner">Draft for Kev\'s review. Not yet shared with partners.</div>\n'
              if draft else "")
    contact = f'\n      <p class="contact">{e(CONTACT)}</p>' if CONTACT else ""

    return f"""<title>Eden Open Roles</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&display=swap">
<style>
/* Layout: one quiet column, a white ledger per region on cream; each role reads as a row (code, role, requirements). */
:root {{
  --bg: #FAF8F3; --card: #FFFFFF; --ink: #111111; --mute: #5A5A5A; --line: #D9D6CE; --soft: #F0EDE6;
  --accent: #111111; --accent-ink: #FFFFFF; --warn: #7A5A1C;
  --font: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  color-scheme: light;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --bg: #151515; --card: #1D1D1C; --ink: #F2F0EA; --mute: #A3A09A; --line: #2F2F2D; --soft: #232321;
    --accent: #F2F0EA; --accent-ink: #111111; --warn: #D2A95C; color-scheme: dark;
  }}
}}
:root[data-theme="dark"] {{
  --bg: #151515; --card: #1D1D1C; --ink: #F2F0EA; --mute: #A3A09A; --line: #2F2F2D; --soft: #232321;
  --accent: #F2F0EA; --accent-ink: #111111; --warn: #D2A95C; color-scheme: dark;
}}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--ink); font-family: var(--font); font-size: 15px; line-height: 1.55; }}
.wrap {{ max-width: 920px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 40px; display: grid; gap: 32px; }}
.draft {{ max-width: 920px; margin: 16px auto 0; margin-inline: max(16px, env(safe-area-inset-left, 0px)) max(16px, env(safe-area-inset-right, 0px)); padding: 10px 14px; border: 1px dashed var(--warn); color: var(--warn); font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }}
@media (min-width: 952px) {{ .draft {{ margin-inline: auto; }} }}
.eyebrow, .label, .tally, .chip-row-label {{ font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--mute); margin: 0; }}
header.mast {{ display: grid; gap: 12px; padding-bottom: 24px; border-bottom: 2px solid var(--ink); }}
header.mast .eyebrow {{ color: var(--ink); }}
h1 {{ margin: 0; font-size: clamp(1.9rem, 5vw, 2.9rem); line-height: 1.1; font-weight: 700; font-style: italic; letter-spacing: -.01em; text-wrap: balance; }}
.facts {{ display: flex; flex-wrap: wrap; gap: 6px 22px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--mute); font-variant-numeric: tabular-nums; }}
.facts strong {{ color: var(--ink); font-weight: 600; }}
.intro {{ margin: 0; max-width: 62ch; color: var(--mute); }}
.filters {{ display: grid; gap: 14px; }}
.chip-row {{ display: grid; gap: 8px; }}
.chips {{ display: flex; flex-wrap: wrap; gap: 8px; }}
.chip {{ font: inherit; font-size: 13px; font-weight: 500; color: var(--ink); background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; display: inline-flex; gap: 8px; align-items: baseline; cursor: pointer; }}
.chip .n {{ font-size: 11px; color: var(--mute); font-variant-numeric: tabular-nums; }}
.chip:hover {{ border-color: var(--ink); }}
.chip[aria-pressed="true"] {{ background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }}
.chip[aria-pressed="true"] .n {{ color: var(--accent-ink); opacity: .7; }}
button:focus-visible {{ outline: 2px solid var(--ink); outline-offset: 2px; }}
.status {{ margin: 0; font-size: 13px; color: var(--mute); font-variant-numeric: tabular-nums; }}
.region {{ display: grid; gap: 12px; }}
.region-head {{ display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 16px; }}
h2 {{ margin: 0; font-size: 1.3rem; font-weight: 700; letter-spacing: -.005em; }}
.tally-n {{ color: var(--ink); }}
.roles {{ background: var(--card); border: 1px solid var(--line); }}
.role {{ display: grid; gap: 10px 28px; padding: 20px; border-top: 1px solid var(--line); }}
.role:first-child {{ border-top: 0; }}
.role-id {{ display: flex; align-items: center; justify-content: space-between; gap: 10px; }}
.ref {{ font: inherit; font-size: 12px; font-weight: 600; letter-spacing: .12em; font-variant-numeric: tabular-nums; color: var(--ink); background: var(--soft); border: 1px solid var(--line); padding: 3px 8px; cursor: copy; white-space: nowrap; }}
.ref.copied {{ background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }}
.pill {{ font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; padding: 3px 9px; border: 1px solid var(--line); color: var(--mute); border-radius: 999px; }}
.pill.hot {{ background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }}
.role-main, .role-detail {{ min-width: 0; display: grid; gap: 4px; align-content: start; }}
h3 {{ margin: 0; font-size: 1.05rem; line-height: 1.3; font-weight: 700; text-wrap: balance; }}
.where {{ margin: 0; font-size: 13px; font-weight: 500; }}
.where .sep {{ color: var(--line); margin-inline: 8px; }}
.blind {{ margin: 0; font-size: 13px; font-style: italic; color: var(--mute); }}
.role-detail {{ gap: 6px; }}
.must {{ margin: 0; padding: 0; list-style: none; display: grid; gap: 3px; font-size: 14px; }}
.must li {{ padding-left: 16px; position: relative; }}
.must li::before {{ content: ""; position: absolute; left: 0; top: .62em; width: 6px; height: 6px; background: var(--ink); }}
.sell {{ margin: 6px 0 0; display: grid; gap: 2px; font-size: 14px; font-weight: 500; }}
@media (min-width: 760px) {{
  .role {{ grid-template-columns: 7.5rem minmax(0, 1fr) minmax(0, 1.15fr); }}
  .role-id {{ flex-direction: column; align-items: flex-start; justify-content: flex-start; }}
}}
.empty {{ margin: 0; padding: 24px 20px; background: var(--card); border: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }}
.empty button {{ font: inherit; font-size: 13px; font-weight: 600; background: var(--accent); color: var(--accent-ink); border: 0; padding: 8px 14px; cursor: pointer; }}
footer.submit {{ display: grid; gap: 10px; padding-top: 24px; border-top: 2px solid var(--ink); }}
footer.submit p {{ margin: 0; max-width: 62ch; }}
.howto {{ font-size: 1rem; font-weight: 600; }}
.brandline {{ display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 16px; padding-top: 16px; margin-top: 8px; border-top: 1px solid var(--line); font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--mute); }}
@media (prefers-reduced-motion: no-preference) {{ .chip, .ref {{ transition: background-color .15s, color .15s, border-color .15s; }} }}
</style>
{banner}
<main class="wrap">
  <header class="mast">
    <p class="eyebrow">Eden Partner Group · Open Roles for Partners</p>
    <h1>{n} open roles, client-blind</h1>
    <ul class="facts">
      <li>As of <strong>{e(as_of)}</strong></li>
      <li><strong>{n}</strong> roles</li>
      <li><strong>{hot}</strong> hot</li>
      <li><strong>{len(regions)}</strong> regions</li>
    </ul>
    <p class="intro">Each role carries an Eden reference code. Quote it when you submit a candidate. Tap a code to copy it.</p>
  </header>

  <div class="filters" role="group" aria-label="Filter roles">
    <div class="chip-row"><p class="chip-row-label">Region</p><div class="chips">{region_chips}</div></div>
    <div class="chip-row"><p class="chip-row-label">Sector</p><div class="chips">{sector_chips}</div></div>
    <p class="status" id="status" aria-live="polite">Showing all {n} roles</p>
  </div>
{''.join(sections)}
  <div class="empty" id="empty" hidden><span>No roles match both filters.</span><button type="button" id="clear">Show all roles</button></div>

  <footer class="submit">
    <p class="label">How to submit</p>
    <p class="howto">Submit candidates to your Eden contact with the reference code. Eden's standard split terms apply.</p>{contact}
    <div class="brandline"><span>edenpartnergroup.com</span><span>Eden Partner Group</span></div>
  </footer>
</main>

<script>
(function () {{
  var state = {{ region: "all", sector: "all" }};
  var total = {n};
  var roles = Array.prototype.slice.call(document.querySelectorAll(".role"));
  var sections = Array.prototype.slice.call(document.querySelectorAll(".region"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  function apply() {{
    var shown = 0;
    roles.forEach(function (r) {{
      var ok = (state.region === "all" || r.dataset.region === state.region) &&
               (state.sector === "all" || r.dataset.sector === state.sector);
      r.hidden = !ok; if (ok) shown++;
    }});
    sections.forEach(function (s) {{ s.hidden = !s.querySelector(".role:not([hidden])"); }});
    chips.forEach(function (c) {{ c.setAttribute("aria-pressed", String(state[c.dataset.group] === c.dataset.value)); }});
    document.getElementById("empty").hidden = shown > 0;
    document.getElementById("status").textContent = shown === total
      ? "Showing all " + total + " roles" : "Showing " + shown + " of " + total + " roles";
  }}
  chips.forEach(function (c) {{
    c.addEventListener("click", function () {{ state[c.dataset.group] = c.dataset.value; apply(); }});
  }});
  document.getElementById("clear").addEventListener("click", function () {{ state.region = "all"; state.sector = "all"; apply(); }});
  document.querySelectorAll(".ref").forEach(function (b) {{
    b.addEventListener("click", function () {{
      var code = b.dataset.ref;
      function done() {{ b.classList.add("copied"); b.textContent = "Copied"; setTimeout(function () {{ b.classList.remove("copied"); b.textContent = code; }}, 1400); }}
      function fallback() {{ var r = document.createRange(); r.selectNodeContents(b); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }}
      try {{ navigator.clipboard.writeText(code).then(done, fallback); }} catch (err) {{ fallback(); }}
    }});
  }});
}})();
</script>
"""


def scan(page, deck, overrides):
    """Return a list of problems. Client and project names anywhere in the page; owner and
    candidate names outside the draft banner; pay or fee wording outside the footer line."""
    problems = []
    clients = set(BLOCKED_NAMES)
    for v in overrides.get("client_names", {}).values():
        clients.add(v)
        clients.add(v.split()[0])
    clients.discard("General")
    for name in sorted(clients):
        if re.search(r"(?<![A-Za-z])" + re.escape(name) + r"(?![A-Za-z])", page, re.I):
            problems.append(f"client or project name: {name}")
    no_banner = re.sub(r'<div class="draft".*?</div>', "", page, flags=re.S)
    people = {r.get("eden_owner") for r in deck if r.get("eden_owner")}
    people |= {v.get("eden_owner") for v in overrides.get("jo", {}).values() if v.get("eden_owner")}
    people |= set(overrides.get("backburner", []))
    for name in sorted(p for p in people if p):
        if re.search(r"(?<![A-Za-z])" + re.escape(name) + r"(?![A-Za-z])", no_banner):
            problems.append(f"person name: {name}")
    body = no_banner.split("<main", 1)[1].split('<footer class="submit">', 1)[0]
    text = re.sub(r"<[^>]+>", " ", body)
    for m in MONEY.finditer(text):
        problems.append(f"pay or fee wording: {m.group(0)!r}")
    return problems


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--deck", default=str(DEFAULT_DECK))
    ap.add_argument("--overrides", default=str(DEFAULT_OVERRIDES))
    ap.add_argument("--as-of", default=DEFAULT_AS_OF)
    ap.add_argument("--final", action="store_true", help="omit the draft banner")
    ap.add_argument("--out", default=str(HERE / "index.html"))
    a = ap.parse_args()

    deck = json.loads(Path(a.deck).read_text())
    overrides = json.loads(Path(a.overrides).read_text())
    roles = load_roles(deck, overrides)
    page = render(roles, a.as_of, draft=not a.final)
    problems = scan(page, deck, overrides)
    if problems:
        print("BLIND CHECK FAILED, nothing written:", *problems, sep="\n  ", file=sys.stderr)
        sys.exit(1)
    Path(a.out).write_text(page)
    hot = sum(r["priority"] == "Hot" for r in roles)
    print(f"Wrote {a.out}: {len(roles)} roles ({hot} hot), as of {a.as_of}. Blind check passed.")
    for g in REGIONS:
        c = sum(r["region"] == g for r in roles)
        if c:
            print(f"  {g}: {c}")


if __name__ == "__main__":
    main()
