"""Welcome to PB South v2: role-agnostic new-hire deck, Marlowe's fixes (Jenny, Eden Partner Group, 12 Nov 2026).
Sources: PB South controller deck (Oct 2026), PB South Employee Handbook (10 Mar 2025).
Run: python3 build_deck_v2.py -> welcome-to-pb-south-v2.pptx"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os
HERE = os.path.dirname(os.path.abspath(__file__))
NAVY = RGBColor(0x14, 0x28, 0x4B); INK = RGBColor(0x1A, 0x1A, 0x1A); MUTE = RGBColor(0x5F, 0x66, 0x70)
LINE = RGBColor(0xC9, 0xCF, 0xD8); PALE = RGBColor(0xDD, 0xE3, 0xEC); WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT = "Arial"
prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)
BL = prs.slide_layouts[6]; W, H = prs.slide_width, prs.slide_height
LOGO = os.path.join(HERE, "assets/pbs-logo.png"); BLDG = os.path.join(HERE, "assets/building-bw.png")

def tb(s, x, y, w, h, text, size=16, bold=False, color=INK, align=PP_ALIGN.LEFT, spacing=1.2):
    t = s.shapes.add_textbox(x, y, w, h); f = t.text_frame; f.word_wrap = True
    f.margin_left = f.margin_right = f.margin_top = f.margin_bottom = Inches(0)
    for i, ln in enumerate(text if isinstance(text, list) else [text]):
        p = f.paragraphs[0] if i == 0 else f.add_paragraph(); p.alignment = align; p.line_spacing = spacing
        r = p.add_run(); r.text = ln; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color; r.font.name = FONT
    return t

def rows(s, x, y, w, items, size=16, gap=10, mark="—"):
    t = s.shapes.add_textbox(x, y, w, Inches(4)); f = t.text_frame; f.word_wrap = True
    f.margin_left = f.margin_right = f.margin_top = Inches(0)
    for i, it in enumerate(items):
        p = f.paragraphs[0] if i == 0 else f.add_paragraph(); p.space_after = Pt(gap); p.line_spacing = 1.2
        head, _, rest = it.partition("|")
        r = p.add_run(); r.text = mark + "  "; r.font.size = Pt(size); r.font.color.rgb = NAVY; r.font.name = FONT; r.font.bold = True
        for txt, b in ((head + ("  " if rest else ""), bool(rest)), (rest, False)):
            if txt:
                r = p.add_run(); r.text = txt; r.font.size = Pt(size); r.font.bold = b; r.font.color.rgb = INK; r.font.name = FONT
    return t

def rect(s, x, y, w, h, fill):
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h); r.fill.solid(); r.fill.fore_color.rgb = fill; r.line.fill.background()
    for er in r._element.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}effectRef"): er.set("idx", "0")
    return r

def hair(s, x1, y1, x2, y2, color=LINE, wt=0.5):
    c = s.shapes.add_connector(1, x1, y1, x2, y2); c.line.color.rgb = color; c.line.width = Pt(wt); return c

def page(title, kicker, n):
    s = prs.slides.add_slide(BL); rect(s, 0, 0, W, Inches(0.08), NAVY)
    tb(s, Inches(0.7), Inches(0.55), Inches(9), Inches(0.3), kicker.upper(), 12, True, MUTE)
    tb(s, Inches(0.7), Inches(0.9), Inches(11.5), Inches(0.8), title, 34, True, NAVY)
    s.shapes.add_picture(LOGO, W - Inches(1.55), H - Inches(0.95), height=Inches(0.6))
    tb(s, Inches(0.7), H - Inches(0.62), Inches(6), Inches(0.3), f"Welcome to PB South  ·  {n:02d}", 11, False, MUTE)
    return s

def col(s, x, y, w, head, body, sub=None, size=16):
    tb(s, x, y, w, Inches(0.5), head, 20, True, NAVY)
    yy = y + Inches(0.55)
    if sub: tb(s, x, yy, w, Inches(0.4), sub.upper(), 11, True, MUTE); yy += Inches(0.4)
    hair(s, x, yy + Inches(0.05), x + w, yy + Inches(0.05), NAVY, 1)
    if isinstance(body, list) and body and "|" in "".join(body) or (isinstance(body, list) and len(body) > 1):
        rows(s, x, yy + Inches(0.3), w, body, size, 8)
    else:
        tb(s, x, yy + Inches(0.3), w, Inches(3), body, size)

# 1 Cover
s = prs.slides.add_slide(BL); rect(s, 0, 0, W, H, NAVY)
s.shapes.add_picture(BLDG, W - Inches(4.6), 0, height=H); rect(s, W - Inches(4.6), 0, Inches(0.06), H, WHITE)
tb(s, Inches(0.8), Inches(0.8), Inches(7), Inches(0.3), "PB SOUTH CONSTRUCTION  ·  WEST PALM BEACH", 12, True, PALE)
tb(s, Inches(0.8), Inches(2.3), Inches(7.6), Inches(2.4), ["Welcome to", "PB South."], 64, True, WHITE, spacing=1.0)
tb(s, Inches(0.8), Inches(4.8), Inches(7.2), Inches(1), "Your new-hire guide: who we are, how we work, and everything you need for day one.", 20, False, PALE)
tb(s, Inches(0.8), H - Inches(0.9), Inches(7), Inches(0.3), "New Hire Guide  ·  [Edition date]", 12, False, PALE)

# 2 Welcome
s = page("Glad you're here.", "Welcome", 2)
tb(s, Inches(0.7), Inches(2.0), Inches(5.3), Inches(3.5), ["Every person on this team was picked to be a true builder.", "", "This guide is your map for the first 90 days. Keep it handy, and ask your coach anything."], 20)
items = ["Who we are", "Leadership", "Your first week", "Your role, coach and 90 days", "Pay, benefits and time off", "How we work and policies", "Day 1 checklist and tools"]
for i, it in enumerate(items):
    y = Inches(2.0) + i * Inches(0.62)
    tb(s, Inches(7.0), y, Inches(0.7), Inches(0.4), f"{i+1:02d}", 18, True, NAVY); tb(s, Inches(7.7), y, Inches(5), Inches(0.4), it, 18)
    hair(s, Inches(7.0), y + Inches(0.5), Inches(12.6), y + Inches(0.5))

# 3 Who we are + story
s = page("True builders.", "Who we are", 3)
tb(s, Inches(0.7), Inches(1.95), Inches(11.8), Inches(1.2), "We challenge the status quo, rethink how things get built, and deliver extraordinary results without compromising quality.", 22, True, INK)
yrs = [("2024", ["PB South Construction founded", "Awarded Phillips Point"]), ("2025", ["Awarded 15 City Place", "Awarded 10 City Place", "Backlog built to $500MM"]), ("2026", ["A growing team, with more ahead"])]
y = Inches(3.75); hair(s, Inches(0.7), y, Inches(12.6), y, NAVY, 2)
for i, (yr, its) in enumerate(yrs):
    x = Inches(0.7) + i * Inches(4.1)
    d = s.shapes.add_shape(MSO_SHAPE.OVAL, x, y - Inches(0.12), Inches(0.24), Inches(0.24)); d.fill.solid(); d.fill.fore_color.rgb = NAVY; d.line.fill.background()
    tb(s, x, y + Inches(0.35), Inches(3.8), Inches(0.6), yr, 28, True, NAVY)
    rows(s, x, y + Inches(1.05), Inches(3.8), its, 17, 6)

# 4 Leadership
s = page("The people you'll hear from.", "Leadership", 4)
leaders = [("Robert Hubner", "President", "25 years in the industry, including Turner. Leads our master-builder vision."),
           ("Jeff Rosser", "General Manager", "30+ years in New York and Florida, including 13 at Skanska. Drives growth and execution."),
           ("Vincent Ranieri", "Operations Manager", "20+ years of field leadership. Owns pre-planning, logistics and field operations."),
           ("John Fedeli", "Project Executive", "30+ years on complex projects. Oversees delivery from precon to turnover.")]
for i, (n, t, b) in enumerate(leaders):
    x = Inches(0.7) + (i % 2) * Inches(6.1); yy = Inches(2.0) + (i // 2) * Inches(2.25)
    tb(s, x, yy, Inches(5.6), Inches(0.5), n, 22, True, NAVY); tb(s, x, yy + Inches(0.5), Inches(5.6), Inches(0.35), t.upper(), 12, True, MUTE)
    tb(s, x, yy + Inches(0.95), Inches(5.6), Inches(1), b, 16); hair(s, x, yy + Inches(1.95), x + Inches(5.6), yy + Inches(1.95))

# 5 First week
s = page("Your first week.", "You start with a cohort", 5)
tb(s, Inches(0.7), Inches(1.9), Inches(12), Inches(0.5), "New hires start together on the 1st and 3rd Monday of each month.", 18)
days = [("MON", "Welcome", "Leadership kickoff, paperwork, laptop, meet your coach"), ("TUE", "How we build", "Standards, tools and safety orientation"),
        ("WED", "Your team", "Shadow your team or your site"), ("THU", "Your role", "Role training; set 30-day goals"), ("FRI", "Check-in", "30 minutes with your coach")]
for i, (d, h, b) in enumerate(days):
    x = Inches(0.7) + i * Inches(2.45)
    tb(s, x, Inches(2.8), Inches(2.2), Inches(0.6), d, 28, True, NAVY); hair(s, x, Inches(3.5), x + Inches(2.2), Inches(3.5), NAVY, 1)
    tb(s, x, Inches(3.75), Inches(2.2), Inches(0.5), h, 18, True); tb(s, x, Inches(4.3), Inches(2.15), Inches(2), b, 16)

# 6 Role and coach
s = page("Your role and your coach.", "Your manager fills this in", 6)
col(s, Inches(0.7), Inches(2.0), Inches(5.6), "Your role", ["Title|[Title]", "What you own|[One line]", "Reports to|[Name, title]", "Your first project|[Project or desk]"])
col(s, Inches(7.0), Inches(2.0), Inches(5.6), "Your coach", ["Who|[Name, title, email]", "Week 1|Walks you through how we work", "Every week|Questions, feedback, introductions", "Day 30, 60, 90|Your check-ins"])

# 7 90 days
s = page("Your first 90 days.", "30 / 60 / 90", 7)
for i, (h, sub, its) in enumerate([("30 days", "Get clear", ["Benefits elected, handbook signed", "You can explain your role", "90-day goals agreed"]),
                                   ("60 days", "Contribute", ["Owning real work", "Using our tools on your own", "Mid-point check-in"]),
                                   ("90 days", "Grow", ["Yearly goals set", "Progress and feedback", "Your ideas: what should we do better?"])]):
    col(s, Inches(0.7) + i * Inches(4.1), Inches(2.0), Inches(3.75), h, its, sub, 17)

# 8 Pay and benefits
s = page("Pay and benefits.", "Through Insperity, our HR partner", 8)
for i, (big, small) in enumerate([("Bi-weekly", "Paydays, every other week"), ("Day 31+", "Health insurance starts the 1st of the month after 30 days"),
                                  ("4% match", "401(k), eligible after 3 months"), ("15 days", "PTO a year in years 1 to 5, usable after day 30")]):
    x = Inches(0.7) + i * Inches(3.08)
    tb(s, x, Inches(2.0), Inches(2.9), Inches(0.7), big, 32, True, NAVY); tb(s, x, Inches(2.85), Inches(2.8), Inches(1), small, 16)
hair(s, Inches(0.7), Inches(4.15), Inches(12.6), Inches(4.15))
rows(s, Inches(0.7), Inches(4.45), Inches(5.9), ["Insperity Premier|portal.insperity.com for pay, benefits and PTO", "Questions|866-715-3552, weekdays 8am to 8pm Eastern"], 16, 8)
rows(s, Inches(6.9), Inches(4.45), Inches(5.8), ["PTO|Request 2 weeks ahead; doesn't roll over", "Sick leave|See the handbook, or ask HR", "Fine print|The benefits book and handbook govern"], 16, 8)

# 9 Holidays
s = page("2026 holidays.", "Time off", 9)
hol = [("New Year's Day", "Thu, Jan 1"), ("Martin Luther King Jr. Day", "Mon, Jan 19"), ("Presidents' Day", "Mon, Feb 16"), ("Good Friday", "Fri, Apr 3"), ("Memorial Day", "Mon, May 25"),
       ("Juneteenth", "Fri, Jun 19"), ("Independence Day (observed)", "Fri, Jul 3"), ("Labor Day", "Mon, Sep 7"), ("Thanksgiving Day", "Thu, Nov 26"), ("Christmas Day", "Fri, Dec 25")]
for i, (n, d) in enumerate(hol):
    x = Inches(0.7) + (i // 5) * Inches(6.1); yy = Inches(2.0) + (i % 5) * Inches(0.78)
    tb(s, x, yy, Inches(3.9), Inches(0.4), n, 18); tb(s, x + Inches(3.9), yy, Inches(1.9), Inches(0.4), d, 18, True, NAVY, PP_ALIGN.RIGHT)
    hair(s, x, yy + Inches(0.55), x + Inches(5.8), yy + Inches(0.55))
tb(s, Inches(0.7), Inches(6.05), Inches(12), Inches(0.4), "PB South's published 2026 schedule; HR confirms each year. Holiday pay starts 30 days after hire.", 14, False, MUTE)

# 10 How we work + policies
s = page("How we work.", "Hours, dress and policies", 10)
col(s, Inches(0.7), Inches(2.0), Inches(3.75), "Hours", ["8 to 5, Monday to Friday", "Sites may set their own", "Overtime needs approval first"], size=16)
col(s, Inches(4.8), Inches(2.0), Inches(3.75), "Dress", ["Office: business casual", "Meeting a client? Dress up", "On site: safety and PPE first"], size=16)
col(s, Inches(8.9), Inches(2.0), Inches(3.75), "Policies", ["Equal opportunity, zero harassment", "Drug and alcohol free", "Follow the AI and systems policy"], size=16)
tb(s, Inches(0.7), Inches(5.95), Inches(12), Inches(0.5), "The Employee Handbook is the official policy. Read it and sign the acknowledgement in your first week. Questions? Our door is open.", 14, False, MUTE)

# 11 Day 1 + tools
s = page("Day 1 checklist.", "Bring it, do it, use it", 11)
col(s, Inches(0.7), Inches(2.0), Inches(3.75), "Bring", ["Photo ID and work documents (I-9)", "Bank details for direct deposit", "Emergency contact"], size=16)
col(s, Inches(4.8), Inches(2.0), Inches(3.75), "Do", ["Create your Insperity account", "Log in to your laptop", "Get Wi-Fi and access in person"], size=16)
col(s, Inches(8.9), Inches(2.0), Inches(3.75), "Your tools", ["Teams and Outlook", "Procore and Smartsheet", "IT: service@ctscts.com"], size=16)
for sh in list(s.shapes):
    if sh.has_text_frame:
        for p in sh.text_frame.paragraphs:
            if p.runs and p.runs[0].text.startswith("—") and sh.left < Inches(8.5): p.runs[0].text = "☐  "

# 12 Close
s = prs.slides.add_slide(BL); rect(s, 0, 0, W, H, NAVY)
tb(s, Inches(0.8), Inches(2.6), Inches(11), Inches(1.6), "Welcome aboard.", 64, True, WHITE)
tb(s, Inches(0.8), Inches(4.05), Inches(10), Inches(0.9), "We're here to support your journey, and we can't wait to see what you build.", 22, False, PALE)
tb(s, Inches(0.8), H - Inches(0.9), Inches(8), Inches(0.3), "PB SOUTH CONSTRUCTION  ·  WEST PALM BEACH", 12, True, PALE)
out = os.path.join(HERE, "welcome-to-pb-south-v2.pptx"); prs.save(out); print(out, len(prs.slides))
