import os, sys
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
FONT = "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif"

# Tokens: Day Board dark set
BG, INK, LAB = "#14130E", "#F2EEE4", "#A39D8D"
CREAM, CINK, CLAB = "#F2EEE4", "#14130E", "#5B564A"
PANEL, FAINT = "#0C0B08", "#3A362B"
RESTG, RESTL = "#8C8576", "#6B655A"
BRASS = "#D9B45E"

ST = {
  "idle": (BG, INK, LAB),
  "on":   (CREAM, CINK, CLAB),
  "off":  (PANEL, FAINT, FAINT),
  "rest": (PANEL, RESTG, RESTL),
}

def T(x, y, s, size, fill, w=600, a="middle", ls=0, extra=""):
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{w}" '
            f'fill="{fill}" text-anchor="{a}" letter-spacing="{ls}"{extra}>{s}</text>')

def svg(w, h, body, bg):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<rect width="{w}" height="{h}" fill="{bg}"/>{body}</svg>')

# Glyphs: one or two geometric strokes, 4px, inside a 44px box centred on (72,56).
GL = {
 "radar":   '<circle cx="72" cy="56" r="20"/><circle cx="72" cy="56" r="5" fill="C" stroke="none"/>',
 "command": '<rect x="52" y="36" width="40" height="40" rx="4"/><path d="M52 50h40"/>',
 "note":    '<path d="M50 48h44M50 64h28"/>',
 "join":    '<path d="M50 56h40M78 44l12 12-12 12"/>',
 "mute":    '<rect x="63" y="34" width="18" height="36" rx="9"/><path d="M72 70v8"/>',
 "muteoff": '<rect x="63" y="34" width="18" height="36" rx="9"/><path d="M72 70v8M52 36l40 40"/>',
 "camera":  '<rect x="50" y="42" width="44" height="30" rx="4"/>',
 "camoff":  '<rect x="50" y="42" width="44" height="30" rx="4"/><path d="M52 36l40 40"/>',
 "share":   '<path d="M72 74V40M60 52l12-12 12 12M52 78h40"/>',
 "breakout":'<rect x="52" y="36" width="17" height="17" rx="3"/><rect x="75" y="36" width="17" height="17" rx="3"/><rect x="52" y="59" width="17" height="17" rx="3"/><rect x="75" y="59" width="17" height="17" rx="3"/>',
 "leave":   '<path d="M52 56h40"/>',
 "rest":    '<path d="M48 68h48M56 68a16 16 0 0 1 32 0"/>',
}

def key(glyph, label, state="idle", badge=None, sub=None):
    bg, ink, lab = ST[state]
    g = GL[glyph].replace('"C"', f'"{ink}"')
    b = (f'<g fill="none" stroke="{ink}" stroke-width="4" stroke-linecap="round" '
         f'stroke-linejoin="round">{g}</g>')
    b += T(72, 116, label, 17, ink if state == "on" else lab if state != "idle" else INK, 600, ls=1.8)
    if sub:
        b += T(72, 133, sub, 11, lab, 500, ls=1)
    if badge:
        b += f'<circle cx="116" cy="28" r="12" fill="{BRASS}"/>' + T(116, 33, badge, 14, CINK, 700)
        b += f'<rect x="24" y="132" width="96" height="3" rx="1.5" fill="{BRASS}"/>'
    return svg(144, 144, b, bg)

def desk(n, label, state="idle"):
    bg, ink, lab = ST[state]
    b = T(72, 84, str(n), 58, ink, 500)
    b += T(72, 116, label, 15, lab if state != "on" else CLAB, 600, ls=1.8)
    if state == "on":  # current desktop: a short bar under the numeral
        b += f'<rect x="62" y="94" width="20" height="3" rx="1.5" fill="{CINK}"/>'
    return svg(144, 144, b, bg)

def blank(bg=PANEL):
    return svg(144, 144, '', bg)

# ---------- strip, 800 x 100, four 200px segments over the dials ----------
def strip(mode):
    b = ""
    seg_lab = []  # (x, label, value, colour)
    if mode in ("work", "soon", "zoom"):
        hot = mode == "soon"
        lbg = CREAM if hot else BG
        ink, lab = (CINK, CLAB) if hot else (INK, LAB)
        b += f'<rect width="400" height="100" fill="{lbg}"/><rect x="400" width="400" height="100" fill="{BG}"/>'
        if mode == "work":
            top, title, cd, frac = "NEXT  10:30 AM", "Search sync", "1 h 30", 0.25
        elif mode == "soon":
            top, title, cd, frac = "NEXT  10:30 AM", "Search sync", "12 min", 0.8
        else:
            top, title, cd, frac = "IN CALL  ENDS 11:00", "Search sync", "18 min", 0.6
        b += T(18, 26, top, 12, lab, 600, a="start", ls=1.6)
        b += T(18, 58, title, 24, ink, 600, a="start")
        b += T(382, 58, cd, 30, ink, 600, a="end", extra=' style="font-variant-numeric:tabular-nums"')
        b += f'<rect x="18" y="68" width="364" height="2" fill="{lab}" opacity=".35"/>'
        b += f'<rect x="18" y="67" width="{364*frac:.0f}" height="4" rx="2" fill="{ink}"/>'
        # focus
        focus_on = mode != "zoom"
        fc = INK if focus_on else FAINT
        b += T(418, 58, "25" if focus_on else "off", 30 if focus_on else 20, fc, 600, a="start")
        if focus_on:
            b += T(458, 58, "min", 14, LAB, 600, a="start")
        # volume
        b += T(618, 58, "60", 30, INK, 600, a="start")
        b += f'<rect x="666" y="50" width="116" height="2" fill="{LAB}" opacity=".35"/><rect x="666" y="49" width="70" height="4" rx="2" fill="{INK}"/>'
        seg_lab = [(18, "DAY", "THU 12", lab), (218, "DESKTOP", "1 AGENDA", lab),
                   (418, "FOCUS", "PRESS TO START", LAB if focus_on else FAINT), (618, "VOLUME", "", LAB)]
        b += f'<rect x="599.5" y="14" width="1" height="72" fill="#2A271E"/><rect x="399.5" y="14" width="1" height="72" fill="{"#2A271E" if not hot else CREAM}"/>'
    else:  # sabbath
        b += f'<rect width="800" height="100" fill="{PANEL}"/>'
        b += T(18, 26, "REST", 12, RESTL, 600, a="start", ls=1.6)
        b += T(18, 58, "Until sundown Saturday", 22, RESTG, 500, a="start")
        b += T(382, 58, "5 h", 28, RESTG, 500, a="end")
        b += T(618, 58, "40", 30, RESTG, 500, a="start")
        b += f'<rect x="666" y="50" width="116" height="2" fill="{RESTL}" opacity=".35"/><rect x="666" y="49" width="46" height="4" rx="2" fill="{RESTG}"/>'
        seg_lab = [(18, "DAY", "", FAINT), (218, "DESKTOP", "", FAINT), (418, "FOCUS", "", FAINT), (618, "VOLUME", "", RESTL)]
    for x, l, v, c in seg_lab:
        b += T(x, 92, l, 11, c, 700, a="start", ls=1.8)
        if v:
            b += T(x + 164, 92, v, 11, c, 500, a="end", ls=1)
    return svg(800, 100, b, PANEL)

# ---------- pages ----------
radar_attn = key("radar", "RADAR", badge="1")
home = {
 "key-radar": key("radar", "RADAR"),
 "key-radar-attention": radar_attn,
 "key-command": key("command", "COMMAND"),
 "key-note": key("note", "NOTE"),
 "key-join-idle": key("join", "JOIN", "off"),
 "key-join-soon": key("join", "JOIN", "on", sub="10:30"),
 "key-desktop-1-agenda": desk(1, "AGENDA", "on"),
 "key-desktop-2-work": desk(2, "WORK"),
 "key-desktop-3-people": desk(3, "PEOPLE"),
 "key-desktop-4-music": desk(4, "MUSIC"),
}
zoom = {
 "key-zoom-mic-live": key("mute", "MIC ON", "on"),
 "key-zoom-mic-muted": key("muteoff", "MUTED"),
 "key-zoom-camera-on": key("camera", "CAMERA", "on"),
 "key-zoom-camera-off": key("camoff", "CAM OFF"),
 "key-zoom-share": key("share", "SHARE"),
 "key-zoom-breakout": key("breakout", "BREAKOUT"),
 "key-zoom-leave": key("leave", "LEAVE", sub="HOLD"),
}
sab = {"key-sabbath-rest": key("rest", "REST", "rest", sub="UNTIL SUNDOWN")}
strips = {f"strip-{m}": strip(m) for m in ("work", "soon", "zoom", "sabbath")}
for d in (home, zoom, sab, strips):
    for n, s in d.items():
        open(os.path.join(OUT, n + ".svg"), "w").write(s)

pages = [
 ("Workday, 9:00 AM", "Calm. Agenda desktop is showing; Radar has one reply waiting.",
  [radar_attn, home["key-command"], home["key-note"], home["key-join-idle"],
   home["key-desktop-1-agenda"], home["key-desktop-2-work"], home["key-desktop-3-people"], home["key-desktop-4-music"]],
  strips["strip-work"], ["DAY", "DESKTOP", "FOCUS", "VOLUME"]),
 ("Meeting in 12 minutes", "Join and the meeting half of the strip turn cream, like the Day Board.",
  [home["key-radar"], home["key-command"], home["key-note"], home["key-join-soon"],
   home["key-desktop-1-agenda"], home["key-desktop-2-work"], home["key-desktop-3-people"], home["key-desktop-4-music"]],
  strips["strip-soon"], ["DAY", "DESKTOP", "FOCUS", "VOLUME"]),
 ("Zoom page", "Swaps in when Zoom is in front. Cream means the room can hear and see you.",
  [zoom["key-zoom-mic-live"], zoom["key-zoom-camera-on"], zoom["key-zoom-share"], zoom["key-zoom-breakout"],
   home["key-note"], home["key-radar"], blank(), zoom["key-zoom-leave"]],
  strips["strip-zoom"], ["DAY", "DESKTOP", "FOCUS", "VOLUME"]),
 ("Sabbath", "Friday sunset to Saturday sunset. Work rests; music and volume stay awake.",
  [sab["key-sabbath-rest"], blank(), blank(), blank(),
   blank(), blank(), blank(), desk(4, "MUSIC", "rest")],
  strips["strip-sabbath"], ["", "", "", ""]),
]

def device(title, cap, keys, st, rest=False):
    k = "".join(f'<div class="k">{s}</div>' for s in keys)
    dials = "".join(f'<div class="dial{" dim" if rest and i < 3 else ""}"></div>' for i in range(4))
    return (f'<figure><div class="dev"><div class="keys">{k}</div><div class="strip">{st}</div>'
            f'<div class="dials">{dials}</div></div><figcaption><b>{title}.</b> {cap}</figcaption></figure>')

html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stream Deck Plus Contact Sheet</title>
<style>
:root{{--bg:#F6F3EC;--ink:#17160F;--mute:#6B655A;--line:#D9D2C3;--sans:Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);padding-block:40px 56px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
.wrap{{max-width:1180px;margin:0 auto}}
header{{border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:36px}}
.org{{font-size:12px;font-weight:700;letter-spacing:.24em}}
h1{{font-size:24px;font-weight:700;font-style:italic;margin:6px 0 4px}}
.sub{{color:var(--mute);font-size:14px;margin:0}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,500px),1fr));gap:48px 40px}}
figure{{margin:0;min-width:0}}
.dev{{background:#050504;border-radius:28px;padding:28px 30px 30px;width:min(100%,500px);box-shadow:0 1px 0 #2A271E inset,0 18px 40px rgba(23,22,15,.18)}}
.keys{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}}
.k{{aspect-ratio:1;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px #1F1D17;max-width:100%}}
.k svg,.strip svg{{width:100%;height:auto;display:block}}
.strip{{margin-top:26px;border-radius:8px;overflow:hidden;box-shadow:0 0 0 1px #1F1D17}}
.dials{{display:grid;grid-template-columns:repeat(4,1fr);margin-top:22px;justify-items:center}}
.dial{{width:64px;height:64px;border-radius:50%;background:#16150F;box-shadow:0 0 0 2px #24221A,0 0 0 6px #0A0907,inset 0 2px 0 #26241C}}
.dial.dim{{opacity:.55}}
figcaption{{font-size:13px;color:var(--mute);margin-top:14px;max-width:500px}}
figcaption b{{color:var(--ink)}}
footer{{margin-top:48px;border-top:1px solid var(--line);padding-top:14px;font-size:11px;font-weight:700;letter-spacing:.24em}}
@media (max-width:560px){{.dev{{padding:16px;border-radius:20px}}.keys{{gap:9px}}.k{{border-radius:9px}}.dial{{width:44px;height:44px}}}}
</style></head><body><div class="wrap">
<header><div class="org">KDTW GROUP</div><h1>Stream Deck +, v2</h1><p class="sub">Eight keys, one strip, four dials. Four moments in Kev's week.</p></header>
<div class="grid">{"".join(device(t, c, k, s, rest=(t == "Sabbath")) for t, c, k, s, _ in pages)}</div>
<footer>KDTW GROUP</footer>
</div></body></html>'''
open(os.path.join(OUT, "contact-sheet.html"), "w").write(html)
print("ok")
