"""Dot-matrix US map with a heat layer for the JO deck background.

Reads us-atlas nation-10m.json (public, Natural Earth / Census via jsdelivr) from ../geo/,
projects the lower 48 to a 1000-wide SVG, fills it with a dot grid and darkens dots near
open roles. Returns (svg_text, project_fn).
"""
import json, math, os

W = 1000.0
LON0, LAT0 = -96.0, 38.0
K = math.cos(math.radians(LAT0))
BOX = (-125.0, -66.5, 24.3, 49.6)  # lon min, lon max, lat min, lat max


def _xy(lon, lat):
    x = (lon - BOX[0]) * K
    y = (BOX[3] - lat)
    s = W / ((BOX[1] - BOX[0]) * K)
    return x * s, y * s


H = _xy(BOX[0], BOX[2])[1]


def project(lon, lat):
    return _xy(lon, lat)


def _rings(path):
    tj = json.load(open(path))
    sx, sy = tj["transform"]["scale"]
    tx, ty = tj["transform"]["translate"]
    arcs = []
    for a in tj["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in a:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    geom = tj["objects"]["nation"]["geometries"][0]
    polys = geom["arcs"] if geom["type"] == "MultiPolygon" else [geom["arcs"]]
    out = []
    for poly in polys:
        for ring in poly:
            pts = []
            for i in ring:
                seg = arcs[i] if i >= 0 else list(reversed(arcs[~i]))
                pts.extend(seg if not pts else seg[1:])
            lons = [p[0] for p in pts]
            lats = [p[1] for p in pts]
            if min(lons) < BOX[0] - 1 or max(lats) > BOX[3] + 1 or min(lats) < BOX[2] - 1:
                continue  # Alaska, Hawaii, territories
            pr = [project(*p) for p in pts]
            simp = [pr[0]]
            for p in pr[1:]:
                if abs(p[0] - simp[-1][0]) + abs(p[1] - simp[-1][1]) > 1.6:
                    simp.append(p)
            if len(simp) > 8:
                out.append(simp)
    return out


def _inside(x, y, rings):
    c = False
    for r in rings:
        n = len(r)
        j = n - 1
        for i in range(n):
            xi, yi = r[i]
            xj, yj = r[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi:
                c = not c
            j = i
    return c


def build_svg(here, points, step=8.5, sigma=30.0):
    """points: list of (lon, lat, weight). Returns SVG text (black ink; page inverts in dark mode)."""
    rings = _rings(os.path.join(here, "nation.json"))
    pp = [(project(lo, la), w) for lo, la, w in points]
    dots = []
    y = step / 2
    while y < H:
        # bounding rings per row for speed
        row = [r for r in rings if min(p[1] for p in r) <= y <= max(p[1] for p in r)]
        x = step / 2 + (step / 2 if int(y / step) % 2 else 0)
        while x < W:
            if row and _inside(x, y, row):
                heat = 0.0
                for (px, py), w in pp:
                    d2 = (x - px) ** 2 + (y - py) ** 2
                    heat += w * math.exp(-d2 / (2 * sigma * sigma))
                h = 1 - math.exp(-heat / 3.0)  # 0..1, saturates gently
                r_ = 1.55 + 2.6 * h
                op = 0.16 + 0.70 * h
                dots.append('<circle cx="%.1f" cy="%.1f" r="%.2f" fill-opacity="%.2f"/>' % (x, y, r_, op))
            x += step
        y += step * 0.866
    outline = "".join("M" + "L".join("%.1f %.1f" % p for p in r) + "Z" for r in rings)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">'
            '<path d="%s" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.2"/>'
            '<g fill="#000">%s</g></svg>') % (W, math.ceil(H), outline, "".join(dots))
