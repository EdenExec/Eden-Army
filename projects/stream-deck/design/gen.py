import os, sys
OUT = sys.argv[1]
FONT = "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif"

# State palettes (dark device). Tokens follow the Day Board dark set.
S = {
  "idle":     dict(bg="#14130E", ink="#F2EEE4", lab="#A39D8D"),
  "active":   dict(bg="#F2EEE4", ink="#14130E", lab="#5B564A"),
  "attn":     dict(bg="#14130E", ink="#F2EEE4", lab="#A39D8D"),
  "disabled": dict(bg="#0C0B08", ink="#3A362B", lab="#3A362B"),
  "rest":     dict(bg="#0C0B08", ink="#8C8576", lab="#6B655A"),
  "empty":    dict(bg="#0E0D0A", ink="#0E0D0A", lab="#0E0D0A"),
}
BRASS = "#D9B45E"

G = {  # glyphs, 5px stroke, drawn in a 56px box centred on (72,58)
 "radar": '<rect x="61" y="32" width="22" height="38" rx="11"/><path d="M50 58a22 22 0 0 0 44 0"/><path d="M72 80v8"/>',
 "join":  '<rect x="42" y="42" width="42" height="32" rx="7"/><path d="M84 54l18-9v26l-18-9"/>',
 "note":  '<rect x="48" y="32" width="48" height="54" rx="7"/><path d="M58 48h28M58 59h28M58 70h16"/>',
 "board": '<rect x="42" y="34" width="60" height="48" rx="7"/><path d="M42 49h60M62 49v33"/>',
 "focus": '<circle cx="72" cy="58" r="23"/><circle cx="72" cy="58" r="5" fill="CUR" stroke="none"/>',
 "call":  ''.join(f'<circle cx="{x}" cy="{y}" r="4.5" fill="CUR" stroke="none"/>' for y in (40,58,76) for x in (54,72,90)),
 "rest":  '<path d="M40 76h64"/><path d="M52 76a20 20 0 0 1 40 0"/><path d="M58 88h28"/>',
}

def svg(body, bg):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">'
            f'<rect width="144" height="144" fill="{bg}"/>{body}</svg>')

def text(x, y, s, size, fill, weight=600, anchor="middle", ls=0):
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}">{s}</text>')

def action(glyph, label, state="idle", badge=None):
    p = S[state]
    g = G[glyph].replace("CUR", p["ink"])
    body = (f'<g fill="none" stroke="{p["ink"]}" stroke-width="5" stroke-linecap="round" '
            f'stroke-linejoin="round">{g}</g>')
    body += text(72, 122, label, 15, p["lab"], 600, ls=1.6)
    if badge:  # the one restrained alert tone: a brass dot with a count
        body += f'<circle cx="114" cy="28" r="14" fill="{BRASS}"/>'
        body += text(114, 33.5, badge, 15, "#14130E", 700)
    if state == "attn":
        body += f'<rect x="20" y="132" width="104" height="3" rx="1.5" fill="{BRASS}"/>'
    return svg(body, p["bg"])

def folder(word, count, state="idle"):
    p = S[state]
    body = f'<rect x="20" y="20" width="34" height="6" rx="3" fill="{p["ink"]}"/>'  # the tab
    size = 19 if len(word) <= 7 else 16
    body += text(72, 82, word, size, p["ink"], 700, ls=1.4)
    body += text(20, 124, count, 14, p["lab"], 600, anchor="start", ls=1)
    body += f'<path d="M116 112l7 7-7 7" fill="none" stroke="{p["lab"]}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
    return svg(body, p["bg"])

def live(time, big, unit, title, frac, state="idle"):
    p = S[state]
    body = text(20, 32, time, 14, p["lab"], 600, anchor="start", ls=1.4)
    body += f'<circle cx="120" cy="27" r="4" fill="{p["ink"]}"/>'  # live pulse mark
    body += (f'<text x="20" y="90" font-family="{FONT}" font-size="54" font-weight="600" fill="{p["ink"]}" '
             f'style="font-variant-numeric:tabular-nums">{big}<tspan font-size="20" font-weight="600" fill="{p["lab"]}" dx="4">{unit}</tspan></text>')
    body += text(20, 116, title, 15, p["ink"], 500, anchor="start")
    body += f'<rect x="20" y="129" width="104" height="2" fill="{p["lab"]}" opacity=".35"/>'
    body += f'<rect x="20" y="128" width="{104*frac:.0f}" height="4" rx="2" fill="{p["ink"]}"/>'
    return svg(body, p["bg"])

def rest(sub):
    p = S["rest"]
    body = (f'<g fill="none" stroke="{p["ink"]}" stroke-width="4" stroke-linecap="round">{G["rest"]}</g>')
    body += text(72, 118, "SABBATH", 14, p["ink"], 600, ls=2)
    body += text(72, 134, sub, 11, p["lab"], 500, ls=0.6)
    return svg(body, p["bg"])

def empty():
    return svg('<rect x="66" y="71" width="12" height="2" rx="1" fill="#1E1C16"/>', S["empty"]["bg"])

# The eight sample files
samples = {
  "key-next-meeting-live": live("9:30 AM", "12", "min", "Search sync", 0.6),
  "key-join-active":       action("join", "JOIN", "active"),
  "key-radar-idle":        action("radar", "RADAR"),
  "key-board-attention":   action("board", "TODAY", "attn", badge="2"),
  "key-recruiting-folder": folder("RECRUIT", "6 KEYS"),
  "key-call-disabled":     action("call", "CALL", "disabled"),
  "key-focus-idle":        action("focus", "FOCUS"),
  "key-sabbath-rest":      rest("until Sat sundown"),
}
for n, s in samples.items():
    open(os.path.join(OUT, n + ".svg"), "w").write(s)

# Home page, workday, 12 minutes before a call (Join has turned cream)
work = [
  [samples["key-next-meeting-live"], samples["key-board-attention"], empty(), empty(), rest("hold to begin") ],
  [samples["key-recruiting-folder"], folder("FAMILY", "KDTW"), folder("TOOLS", "8 KEYS"), empty(), empty()],
  [samples["key-join-active"], samples["key-radar-idle"], action("note", "NOTE"), samples["key-focus-idle"], action("call", "CALL")],
]
# The same page in the Sabbath: work keys rest, only Rest and family stay awake
sab = [
  [live("SAT", "5", "hr", "Sundown 5:02", 0.3, "rest"), action("board", "TODAY", "disabled"), empty(), empty(), samples["key-sabbath-rest"]],
  [folder("RECRUIT", "", "disabled"), folder("FAMILY", "KDTW"), folder("TOOLS", "", "disabled"), empty(), empty()],
  [action("join", "JOIN", "disabled"), action("radar", "RADAR", "disabled"), action("note", "NOTE", "disabled"), action("focus", "FOCUS", "disabled"), samples["key-call-disabled"]],
]

def panel(rows, caption):
    keys = "".join(f'<div class="k">{k}</div>' for r in rows for k in r)
    return f'<figure><div class="deck"><div class="grid">{keys}</div></div><figcaption>{caption}</figcaption></figure>'

legend_items = [
  (action("radar", "RADAR"), "Idle", "Dark key, cream glyph."),
  (action("join", "JOIN", "active"), "On", "Turns cream, like the Day Board."),
  (action("board", "TODAY", "attn", badge="2"), "Needs you", "One brass dot, one brass line."),
  (action("call", "CALL", "disabled"), "Off", "Fades into the panel."),
  (rest("until Sat sundown"), "Rest", "Dim, warm, no work."),
]
legend = "".join(f'<div class="lg"><div class="k sm">{s}</div><div><b>{t}</b><span>{d}</span></div></div>' for s, t, d in legend_items)

html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stream Deck Contact Sheet</title>
<style>
:root{{--bg:#F6F3EC;--ink:#17160F;--mute:#6B655A;--line:#D9D2C3;--sans:Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);padding-block:40px 56px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
.wrap{{max-width:1280px;margin:0 auto}}
header{{border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:36px}}
.org{{font-size:12px;font-weight:700;letter-spacing:.24em}}
h1{{font-size:24px;font-weight:700;font-style:italic;margin:6px 0 4px}}
.sub{{color:var(--mute);font-size:14px;margin:0}}
.panels{{display:flex;flex-wrap:wrap;gap:40px}}
figure{{margin:0;min-width:0}}
.deck{{background:#050504;border-radius:30px;padding:26px;box-shadow:0 1px 0 #2A271E inset,0 18px 40px rgba(23,22,15,.18)}}
.grid{{display:grid;grid-template-columns:repeat(5,96px);gap:16px}}
.k{{width:96px;height:96px;border-radius:15px;overflow:hidden;box-shadow:0 0 0 1px #1F1D17}}
.k svg{{width:100%;height:100%;display:block}}
figcaption{{font-size:13px;color:var(--mute);margin-top:14px}}
figcaption b{{color:var(--ink)}}
h2{{font-size:14px;font-weight:700;letter-spacing:.14em;margin:48px 0 18px}}
.legend{{display:flex;flex-wrap:wrap;gap:22px 34px}}
.lg{{display:flex;gap:12px;align-items:center}}
.k.sm{{width:64px;height:64px;border-radius:11px}}
.lg b{{display:block;font-size:13px}} .lg span{{font-size:12px;color:var(--mute)}}
footer{{margin-top:48px;border-top:1px solid var(--line);padding-top:14px;font-size:11px;font-weight:700;letter-spacing:.24em}}
@media (max-width:700px){{.grid{{grid-template-columns:repeat(5,52px);gap:9px}}.k{{width:52px;height:52px;border-radius:9px}}.deck{{padding:16px;border-radius:20px}}}}
</style></head><body><div class="wrap">
<header><div class="org">KDTW GROUP</div><h1>Stream Deck, home page</h1><p class="sub">15-key panel, design study. Key faces at true proportion.</p></header>
<div class="panels">
{panel(work, "<b>Workday.</b> Twelve minutes to a call, so Join has turned cream.")}
{panel(sab, "<b>Sabbath.</b> Work keys rest. Family stays awake.")}
</div>
<h2>KEY STATES</h2><div class="legend">{legend}</div>
<footer>KDTW GROUP</footer>
</div></body></html>'''
open(os.path.join(OUT, "contact-sheet.html"), "w").write(html)
print("ok")
