"""Dot-matrix US maps with a heat layer for the JO deck (Kev 13 Nov; Marlowe's review the same night).

Reads us-atlas nation-10m.json (public: Natural Earth / Census, via jsdelivr) next to this file.
Each view is its own small SVG so the dots keep one on-screen size at every zoom:
base dots are an SVG pattern clipped to the coastline, heat dots are drawn only where roles are.
Ink is black; the page inverts it in dark mode.
"""
import json, math, os

W = 1000.0
LAT0 = 38.0
K = math.cos(math.radians(LAT0))
BOX = (-125.0, -66.5, 24.3, 49.6)  # lower 48: lon min, lon max, lat min, lat max
_S = W / ((BOX[1] - BOX[0]) * K)


def project(lon, lat):
    return (lon - BOX[0]) * K * _S, (BOX[3] - lat) * _S


H = project(BOX[0], BOX[2])[1]
_RINGS = None


def rings(here):
    global _RINGS
    if _RINGS is not None:
        return _RINGS
    tj = json.load(open(os.path.join(here, "nation.json")))
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
            out.append([project(*p) for p in pts])
    _RINGS = out
    return out


def _clip(ring, x0, y0, x1, y1):
    """Sutherland-Hodgman: clip a polygon to a rectangle."""
    def cut(pts, inside, inter):
        res = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            ia, ib = inside(a), inside(b)
            if ib:
                if not ia:
                    res.append(inter(a, b))
                res.append(b)
            elif ia:
                res.append(inter(a, b))
        return res

    def ix(a, b, x):
        t = (x - a[0]) / ((b[0] - a[0]) or 1e-12)
        return (x, a[1] + t * (b[1] - a[1]))

    def iy(a, b, y):
        t = (y - a[1]) / ((b[1] - a[1]) or 1e-12)
        return (a[0] + t * (b[0] - a[0]), y)

    p = ring
    for inside, inter in ((lambda q: q[0] >= x0, lambda a, b: ix(a, b, x0)),
                          (lambda q: q[0] <= x1, lambda a, b: ix(a, b, x1)),
                          (lambda q: q[1] >= y0, lambda a, b: iy(a, b, y0)),
                          (lambda q: q[1] <= y1, lambda a, b: iy(a, b, y1))):
        if not p:
            break
        p = cut(p, inside, inter)
    return p


def _inside(x, y, rs):
    c = False
    for r in rs:
        j = len(r) - 1
        for i in range(len(r)):
            xi, yi = r[i]
            xj, yj = r[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi:
                c = not c
            j = i
    return c


def fit_view(lon0, lon1, lat0, lat1, aspect):
    """Map-unit rectangle covering a lon/lat box, widened to the element's aspect (w/h)."""
    xa, ya = project(lon0, lat1)
    xb, yb = project(lon1, lat0)
    w, h = xb - xa, yb - ya
    if w / h < aspect:
        nw = h * aspect
        xa -= (nw - w) / 2
        w = nw
    else:
        nh = w / aspect
        ya -= (nh - h) / 2
        h = nh
    return (xa, ya, w, h)


def view_svg(here, view, points, px_w, base=.10, peak=.58, line=.12, sigma_frac=.035):
    """view: (x, y, w, h) in map units. points: [(lon, lat, weight)].
    px_w: the element's width as a share of the slide width (0..1). Dots are 0.35% of the
    slide width across and 0.7% apart, whatever the zoom."""
    vx, vy, vw, vh = view
    s = vw * 0.007 / px_w          # dot spacing in map units
    r = s * 0.25                   # 0.35% W diameter
    tol = vw / 700
    m = s * 2
    clipped = []
    for ring in rings(here):
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        if max(xs) < vx - m or min(xs) > vx + vw + m or max(ys) < vy - m or min(ys) > vy + vh + m:
            continue
        c = _clip(ring, vx - m, vy - m, vx + vw + m, vy + vh + m)
        simp = [c[0]] if c else []
        for p in c[1:]:
            if abs(p[0] - simp[-1][0]) + abs(p[1] - simp[-1][1]) > tol:
                simp.append(p)
        if len(simp) > 3:
            clipped.append([(p[0] - vx, p[1] - vy) for p in simp])
    d = "".join("M" + "L".join("%.2f %.2f" % p for p in rg) + "Z" for rg in clipped)
    sig = max(vw * sigma_frac, s * 1.6)
    pp = [((project(lo, la)[0] - vx, project(lo, la)[1] - vy), w) for lo, la, w in points]
    heat = []
    if pp:
        y, row = s * 0.433, 0
        while y < vh:
            x = s / 2 + (s / 2 if row % 2 else 0)
            while x < vw:
                hv = sum(w * math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * sig * sig)) for (px, py), w in pp)
                if hv > 0.02 and _inside(x, y, clipped):
                    heat.append((x, y, hv))
                x += s
            y += s * 0.866
            row += 1
    hmax = max([hv for _, _, hv in heat] or [1])
    circles = []
    for x, y, hv in heat:
        k = math.sqrt(hv / hmax)
        op = (peak - base) * k
        if op > 0.012:
            circles.append('<circle cx="%.2f" cy="%.2f" r="%.3f" fill-opacity="%.3f"/>' % (x, y, r * (1 + 0.7 * k), op))
    ph = s * 0.866 * 2
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.2f %.2f">'
            '<defs><path id="o" d="%s"/><clipPath id="c"><use href="#o"/></clipPath>'
            '<pattern id="p" width="%.3f" height="%.3f" patternUnits="userSpaceOnUse">'
            '<circle cx="%.3f" cy="%.3f" r="%.3f"/><circle cx="0" cy="%.3f" r="%.3f"/><circle cx="%.3f" cy="%.3f" r="%.3f"/></pattern></defs>'
            '<rect width="100%%" height="100%%" fill="url(#p)" fill-opacity="%.3f" clip-path="url(#c)"/>'
            '<use href="#o" fill="none" stroke="#000" stroke-opacity="%.3f" stroke-width="%.3f"/>'
            '<g>%s</g></svg>') % (vw, vh, d, s, ph, s / 2, s * 0.433, r, s * 1.299, r, s, s * 1.299, r,
                                  base, line, vw / 600, "".join(circles))
