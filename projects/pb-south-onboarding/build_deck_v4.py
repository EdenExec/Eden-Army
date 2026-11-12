"""Welcome to PB South v2: role-agnostic new-hire deck, Marlowe's fixes (Jenny, Eden Partner Group, 12 Nov 2026).
Sources: PB South controller deck (Oct 2026), PB South Employee Handbook (10 Mar 2025).
v3 (Kev, 12 Nov): high-res mark, leadership headshots and titles, role/coach slide moved to the presenter guide, speaker notes.
v4 (Kev, 12 Nov): adds Reviews and development, and Who to ask.
Run: python3 build_deck_v4.py -> welcome-to-pb-south-v4.pptx"""
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
LOGO = os.path.join(HERE, "assets/pbs-mark.png"); LOGO_W = os.path.join(HERE, "assets/pbs-mark-white.png"); BLDG = os.path.join(HERE, "assets/cover-tower.jpg")

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
    s.shapes.add_picture(LOGO, W - Inches(2.95), H - Inches(0.85), height=Inches(0.42))
    tb(s, W - Inches(2.45), H - Inches(0.75), Inches(1.8), Inches(0.3), "PB SOUTH", 13, True, NAVY)
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
s.shapes.add_picture(BLDG, W - Inches(6.0), 0, width=Inches(6.0), height=H)
s.shapes.add_picture(LOGO_W, Inches(0.8), Inches(0.6), height=Inches(0.9))
tb(s, Inches(1.85), Inches(0.92), Inches(5.2), Inches(0.3), "PB SOUTH CONSTRUCTION  ·  WEST PALM BEACH", 12, True, PALE)
tb(s, Inches(0.8), Inches(2.3), Inches(6.2), Inches(2.4), ["Welcome to", "PB South."], 60, True, WHITE, spacing=1.0)
tb(s, Inches(0.8), Inches(4.8), Inches(5.9), Inches(1.2), "Your new-hire guide: who we are, how we work, and everything you need for day one.", 20, False, PALE)
tb(s, Inches(0.8), H - Inches(0.9), Inches(7), Inches(0.3), "New Hire Guide  ·  [Edition date]", 12, False, PALE)

# 2 Welcome
s = page("Glad you're here.", "Welcome", 2)
tb(s, Inches(0.7), Inches(2.0), Inches(5.3), Inches(3.5), ["Every person on this team was picked to be a true builder.", "", "This guide is your map for the first 90 days. Keep it handy, and ask your coach anything."], 20)
items = ["Who we are", "Leadership", "Your first week", "Your first 90 days and reviews", "Pay, benefits and time off", "How we work and who to ask", "Day 1 checklist and tools"]
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
leaders = [("Robert Hubner", "Founder, President & CEO", "25 years building high-profile projects in New York and Florida. Leads our master-builder vision.", "hubner"),
           ("Jeff Rosser", "General Manager", "30+ years in New York and Florida, including 13 at Skanska. Drives growth and execution.", "rosser"),
           ("Vincent Ranieri", "VP of Operations", "20+ years of field leadership. Owns pre-planning, logistics and field operations.", "ranieri"),
           ("John Fedeli", "VP of Executives", "30+ years on complex projects. Oversees delivery from precon to turnover.", "fedeli")]
for i, (n, t, b, img) in enumerate(leaders):
    x = Inches(0.7) + (i % 2) * Inches(6.1); yy = Inches(1.95) + (i // 2) * Inches(2.3)
    s.shapes.add_picture(os.path.join(HERE, f"assets/{img}.png"), x, yy, height=Inches(1.6))
    tx = x + Inches(1.9)
    tb(s, tx, yy + Inches(0.05), Inches(3.9), Inches(0.5), n, 22, True, NAVY); tb(s, tx, yy + Inches(0.55), Inches(3.9), Inches(0.35), t.upper(), 12, True, MUTE)
    tb(s, tx, yy + Inches(0.95), Inches(3.9), Inches(1), b, 15); hair(s, x, yy + Inches(2.0), x + Inches(5.8), yy + Inches(2.0))

# 5 First week
s = page("Your first week.", "You start with a cohort", 5)
tb(s, Inches(0.7), Inches(1.9), Inches(12), Inches(0.5), "New hires start together on the 1st and 3rd Monday of each month.", 18)
days = [("MON", "Welcome", "Leadership kickoff, paperwork, laptop, meet your coach"), ("TUE", "How we build", "Standards, tools and safety orientation"),
        ("WED", "Your team", "Shadow your team or your site"), ("THU", "Your role", "Role training; set 30-day goals"), ("FRI", "Check-in", "30 minutes with your coach")]
for i, (d, h, b) in enumerate(days):
    x = Inches(0.7) + i * Inches(2.45)
    tb(s, x, Inches(2.8), Inches(2.2), Inches(0.6), d, 28, True, NAVY); hair(s, x, Inches(3.5), x + Inches(2.2), Inches(3.5), NAVY, 1)
    tb(s, x, Inches(3.75), Inches(2.2), Inches(0.5), h, 18, True); tb(s, x, Inches(4.3), Inches(2.15), Inches(2), b, 16)

# 7 90 days
s = page("Your first 90 days.", "30 / 60 / 90", 6)
for i, (h, sub, its) in enumerate([("30 days", "Get clear", ["Benefits elected, handbook signed", "You can explain your role", "90-day goals agreed"]),
                                   ("60 days", "Contribute", ["Owning real work", "Using our tools on your own", "Mid-point check-in"]),
                                   ("90 days", "Grow", ["Yearly goals set", "Progress and feedback", "Your ideas: what should we do better?"])]):
    col(s, Inches(0.7) + i * Inches(4.1), Inches(2.0), Inches(3.75), h, its, sub, 17)


# Reviews and development
s = page("Reviews and development.", "When we sit down together", 7)
steps = [("Day 30", "Check-in"), ("Day 60", "Check-in"), ("Day 90", "Check-in and yearly goals"), ("June / July", "Mid-year review"), ("December", "Year-end review")]
x0, x1, y = Inches(1.3), Inches(12.0), Inches(3.3)
hair(s, x0, y, x1, y, NAVY, 2)
stepw = (x1 - x0) / (len(steps) - 1)
for i, (when, what) in enumerate(steps):
    cx = x0 + int(stepw * i)
    d = s.shapes.add_shape(MSO_SHAPE.OVAL, cx - Inches(0.13), y - Inches(0.13), Inches(0.26), Inches(0.26)); d.fill.solid(); d.fill.fore_color.rgb = NAVY; d.line.fill.background()
    tb(s, cx - Inches(1.2), y - Inches(0.85), Inches(2.4), Inches(0.5), when, 22, True, NAVY, PP_ALIGN.CENTER)
    tb(s, cx - Inches(1.2), y + Inches(0.4), Inches(2.4), Inches(0.8), what, 16, False, INK, PP_ALIGN.CENTER)
tb(s, Inches(0.7), Inches(4.9), Inches(11.8), Inches(1.2), ["Twice a year, every year: a mid-year review in June or July, and a year-end review in December.", "Each one covers your performance, your goals and how you want to grow here. Come with your own notes."], 17)

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


# Who to ask
s = page("Who to ask.", "Beyond your coach", 11)
tb(s, Inches(0.7), Inches(1.85), Inches(12), Inches(0.5), "Every contact is in the Outlook and Teams directory: search a name, see their title, phone and email.", 17)
asks = [("Your work and priorities", "Your manager"), ("How things work here, or anything at all", "Your coach"), ("Pay, benefits, PTO balance", "Insperity Premier first, then HR"),
        ("HR and admin questions", "Carol Carabba, HR"), ("Laptop, email, systems", "CTS IT: service@ctscts.com"), ("Safety on site", "Your site superintendent; stop work if unsure"),
        ("Something you can't take to your manager", "Open door: Jeff Rosser, General Manager")]
for i, (need, who) in enumerate(asks):
    yy = Inches(2.55) + i * Inches(0.55)
    tb(s, Inches(0.7), yy, Inches(6), Inches(0.4), need, 16); tb(s, Inches(6.9), yy, Inches(5.7), Inches(0.4), who, 16, True, NAVY)
    hair(s, Inches(0.7), yy + Inches(0.46), Inches(12.6), yy + Inches(0.46))

# 11 Day 1 + tools
s = page("Day 1 checklist.", "Bring it, do it, use it", 12)
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
s.shapes.add_picture(LOGO_W, Inches(0.8), H - Inches(1.35), height=Inches(0.7))
tb(s, Inches(1.7), H - Inches(1.12), Inches(8), Inches(0.3), "PB SOUTH CONSTRUCTION  ·  WEST PALM BEACH", 12, True, PALE)
NOTES_OLD = {
 1: "Welcome the cohort by name. Introduce yourself and your role. 30 seconds on why PB South exists: a return to the master builder.",
 2: "Set expectations: this deck is theirs to keep. Every question is a good one this week.",
 3: "Tell one real story about a PB South project. Point to the timeline: how fast we've grown, and why that means room to grow with us.",
 4: "If a leader can drop in for five minutes, do it here. Otherwise say who each person is to the new hire in practice.",
 5: "Walk the week. Name each new hire's coach out loud, and when Friday's check-in is.",
 6: "Per new hire, cover YOUR ROLE AND YOUR COACH here (see the presenter guide): title, what they own, who they report to, first project or desk, coach name and contact. Then walk the 30/60/90 and book the 30-day check-in now.",
 7: "Insperity questions go to Insperity first, then HR. Don't quote numbers beyond the slide; the benefits book governs.",
 8: "HR confirms the holiday list each year. Mention the day-before and day-after rule.",
 9: "Hours, dress and policies. Hand over the Employee Handbook and the acknowledgement to sign this week.",
 10: "Do the checklist live: Insperity account, laptop login, Wi-Fi and building access given in person, never in this deck.",
 11: "Close warm. Remind them who their coach is and when you'll see them next.",
}
NOTES = {1: NOTES_OLD[1], 2: NOTES_OLD[2], 3: NOTES_OLD[3], 4: NOTES_OLD[4], 5: NOTES_OLD[5], 6: NOTES_OLD[6],
 7: "Set the calendar now: 30, 60 and 90 day check-ins, then mid-year (June or July) and year-end (December) reviews every year. Ask them to keep their own notes.",
 8: NOTES_OLD[7], 9: NOTES_OLD[8], 10: NOTES_OLD[9],
 11: "Show them how to search the Outlook or Teams directory. Make it clear they can always come to HR or the GM.",
 12: NOTES_OLD[10], 13: NOTES_OLD[11]}
for i, sl in enumerate(prs.slides, 1):
    if i in NOTES: sl.notes_slide.notes_text_frame.text = NOTES[i]
out = os.path.join(HERE, "welcome-to-pb-south-v4.pptx"); prs.save(out); print(out, len(prs.slides))
