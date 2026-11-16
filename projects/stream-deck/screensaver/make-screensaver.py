"""Draws the Sabbath screen saver images: a near-black field and one thin cream cross, centred.
Flat colour, no gradient, no text. Run: python3 make-screensaver.py   (needs Pillow)
Colours are Eden's: panel #0C0B08, cream #F2EEE4."""
from PIL import Image, ImageDraw

PANEL = (0x0C, 0x0B, 0x08)
CREAM = (0xF2, 0xEE, 0xE4)

def draw(w, h, path):
    s = 4  # supersample, so the ends of the strokes are soft
    img = Image.new("RGB", (w * s, h * s), PANEL)
    d = ImageDraw.Draw(img)
    length = h * 0.22 * s            # height of the cross: 22% of the screen
    stroke = max(2, round(h * 0.0036 * s))   # thin: about 8 px on a 2160 px screen
    cx = w * s / 2
    cy = h * s / 2
    top = cy - length / 2
    bar_y = top + length * 0.34      # crossbar a third of the way down
    half = length * 0.24             # crossbar half-width
    r = stroke / 2
    d.rounded_rectangle([cx - r, top, cx + r, top + length], radius=r, fill=CREAM)
    d.rounded_rectangle([cx - half, bar_y - r, cx + half, bar_y + r], radius=r, fill=CREAM)
    img = img.resize((w, h), Image.LANCZOS)
    img.save(path, optimize=True)
    print("wrote", path, img.size)

draw(3840, 2160, "Sabbath-Cross/Cross-3840x2160.png")
draw(5120, 2880, "Sabbath-Cross/Cross-5120x2880.png")
