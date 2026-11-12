"""Welcome to PB South: role-agnostic new-hire deck (Jenny, Eden Partner Group, 12 Nov 2026).
Source: PB South's controller deck (Oct 2026) and the PB South Employee Handbook (10 Mar 2025).
Run: python3 build_deck.py  -> welcome-to-pb-south-v1.pptx"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os
HERE = os.path.dirname(os.path.abspath(__file__))
NAVY = RGBColor(0x14, 0x28, 0x4B); INK = RGBColor(0x1A, 0x1A, 0x1A); MUTE = RGBColor(0x5F, 0x66, 0x70)
LINE = RGBColor(0xD5, 0xD9, 0xE0); SOFT = RGBColor(0xF3, 0xF5, 0xF8); WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT = "Arial"
prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)
BL = prs.slide_layouts[6]
W, H = prs.slide_width, prs.slide_height
LOGO = os.path.join(HERE, "assets/pbs-logo.png")

def tb(s, x, y, w, h, text, size=16, bold=False, color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.15):
    t = s.shapes.add_textbox(x, y, w, h); f = t.text_frame; f.word_wrap = True; f.vertical_anchor = anchor
    f.margin_left = f.margin_right = Inches(0); f.margin_top = f.margin_bottom = Inches(0)
    lines = text if isinstance(text, list) else [text]
    for i, ln in enumerate(lines):
        p = f.paragraphs[0] if i == 0 else f.add_paragraph()
        p.alignment = align; p.line_spacing = spacing
        r = p.add_run(); r.text = ln; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color; r.font.name = FONT
    return t

def bullets(s, x, y, w, h, items, size=15, gap=8, color=INK):
    t = s.shapes.add_textbox(x, y, w, h); f = t.text_frame; f.word_wrap = True
    f.margin_left = f.margin_right = f.margin_top = Inches(0)
    for i, it in enumerate(items):
        p = f.paragraphs[0] if i == 0 else f.add_paragraph()
        p.space_after = Pt(gap); p.line_spacing = 1.15
        head, _, rest = it.partition("|")
        r = p.add_run(); r.text = "—  "; r.font.size = Pt(size); r.font.color.rgb = NAVY; r.font.name = FONT; r.font.bold = True
        if rest:
            r = p.add_run(); r.text = head + "  "; r.font.bold = True; r.font.size = Pt(size); r.font.color.rgb = color; r.font.name = FONT
            r = p.add_run(); r.text = rest; r.font.size = Pt(size); r.font.color.rgb = color; r.font.name = FONT
        else:
            r = p.add_run(); r.text = head; r.font.size = Pt(size); r.font.color.rgb = color; r.font.name = FONT
    return t

def rect(s, x, y, w, h, fill, line=None):
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h); r.fill.solid(); r.fill.fore_color.rgb = fill
    if line: r.line.color.rgb = line; r.line.width = Pt(0.75)
    else: r.line.fill.background()
    r.shadow.inherit = False
    for er in r._element.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}effectRef"): er.set("idx", "0")
    return r

def page(title, kicker, n):
    s = prs.slides.add_slide(BL)
    rect(s, 0, 0, W, Inches(0.08), NAVY)
    tb(s, Inches(0.7), Inches(0.55), Inches(9), Inches(0.3), kicker.upper(), 11, True, MUTE)
    tb(s, Inches(0.7), Inches(0.85), Inches(11.5), Inches(0.8), title, 32, True, NAVY)
    s.shapes.add_picture(LOGO, W - Inches(1.55), H - Inches(0.95), height=Inches(0.6))
    tb(s, Inches(0.7), H - Inches(0.6), Inches(6), Inches(0.3), f"Welcome to PB South  ·  {n:02d}", 9, False, MUTE)
    return s

def card(s, x, y, w, h, head, body, size=13):
    rect(s, x, y, w, h, SOFT)
    rect(s, x, y, Inches(0.06), h, NAVY)
    tb(s, x + Inches(0.3), y + Inches(0.25), w - Inches(0.5), Inches(0.4), head, 15, True, NAVY)
    tb(s, x + Inches(0.3), y + Inches(0.72), w - Inches(0.5), h - Inches(0.9), body, size, False, INK)

# 1 Cover
s = prs.slides.add_slide(BL); rect(s, 0, 0, W, H, NAVY)
s.shapes.add_picture(os.path.join(HERE, "assets/building-bw.png"), W - Inches(4.6), 0, height=H)
rect(s, W - Inches(4.6), 0, Inches(0.08), H, WHITE)
tb(s, Inches(0.8), Inches(0.8), Inches(6), Inches(0.3), "PB SOUTH CONSTRUCTION  ·  WEST PALM BEACH", 12, True, RGBColor(0xC9, 0xD2, 0xE0))
tb(s, Inches(0.8), Inches(2.4), Inches(7.6), Inches(2.4), ["Welcome to", "PB South."], 60, True, WHITE, spacing=1.0)
tb(s, Inches(0.8), Inches(4.75), Inches(7.4), Inches(0.9), "Your new-hire guide: who we are, how we work, and everything you need for day one.", 18, False, RGBColor(0xDD, 0xE3, 0xEC))
tb(s, Inches(0.8), H - Inches(0.9), Inches(7), Inches(0.3), "New Hire Guide  ·  [Edition date]", 11, False, RGBColor(0xC9, 0xD2, 0xE0))

# 2 Welcome + inside
s = page("Glad you're here.", "Welcome", 2)
tb(s, Inches(0.7), Inches(1.9), Inches(5.4), Inches(3), ["Every person on this team was picked to be a true builder: sharp, resourceful and proud of the work.", "", "This guide is your map for the first 90 days. Keep it handy, and ask your coach anything."], 17, False, INK)
items = ["Who we are and our story", "Leadership", "Your first week", "Your role, your coach, your 30/60/90", "Pay, benefits and time off", "How we work: hours, dress, tools", "Policies to know", "Day 1 checklist"]
for i, it in enumerate(items):
    y = Inches(1.95) + i * Inches(0.58)
    tb(s, Inches(7.0), y, Inches(0.6), Inches(0.4), f"{i+1:02d}", 15, True, NAVY)
    tb(s, Inches(7.6), y, Inches(5), Inches(0.4), it, 15, False, INK)
    s.shapes.add_connector(1, Inches(7.0), y + Inches(0.46), Inches(12.6), y + Inches(0.46)).line.color.rgb = LINE

# 3 Who we are
s = page("Who we are: true builders.", "About us", 3)
s.shapes.add_picture(os.path.join(HERE, "assets/building-bw.png"), Inches(0.7), Inches(1.9), height=Inches(4.7))
tb(s, Inches(4.6), Inches(1.95), Inches(8), Inches(1.2), "We challenge the status quo, rethink how things get built, and deliver extraordinary results without compromising quality.", 20, True, NAVY)
cards = [("Bold and creative", "Unafraid to push boundaries and rethink the way things are done."),
         ("Resourceful", "Smart solutions, whatever the challenge, and productive every day."),
         ("Quality first", "Bold ideas, fearless execution, and never at the cost of the work.")]
for i, (h, b) in enumerate(cards):
    card(s, Inches(4.6) + i * Inches(2.75), Inches(3.6), Inches(2.55), Inches(2.6), h, b)

# 4 Story
s = page("Our story so far.", "Our brief history", 4)
steps = [("2024", "PB South Construction founded"), ("2024", "Awarded Phillips Point"), ("2025", "Awarded 15 City Place"),
         ("2025", "Awarded 10 City Place"), ("2025", "Backlog built to $500MM"), ("2026", "A growing team, with more ahead")]
x0, x1, y = Inches(1.6), Inches(11.7), Inches(3.6)
ln = s.shapes.add_connector(1, x0, y, x1, y); ln.line.color.rgb = NAVY; ln.line.width = Pt(2)
step = (x1 - x0) / (len(steps) - 1)
for i, (yr, txt) in enumerate(steps):
    cx = x0 + int(step * i)
    d = s.shapes.add_shape(MSO_SHAPE.OVAL, cx - Inches(0.13), y - Inches(0.13), Inches(0.26), Inches(0.26)); d.fill.solid(); d.fill.fore_color.rgb = NAVY; d.line.fill.background()
    tb(s, cx - Inches(1), y - Inches(0.85), Inches(2), Inches(0.5), yr, 24, True, NAVY, PP_ALIGN.CENTER)
    tb(s, cx - Inches(1), y + Inches(0.4), Inches(2), Inches(1), txt, 14, False, INK, PP_ALIGN.CENTER)

# 5 Leadership
s = page("The people you'll hear from.", "Leadership", 5)
leaders = [("Robert Hubner", "President", "25 years in the industry, most recently as a Vice President and Construction Executive at Turner. Leads PB South's vision: a return to the master builder ethos."),
           ("Jeff Rosser", "General Manager", "30+ years of complex commercial and healthcare work in New York and Florida, including 13 years at Skanska. Drives growth, client relationships and operational excellence."),
           ("Vincent Ranieri", "Operations Manager", "20+ years of field leadership, much of it at Turner on high-profile NYC projects. Owns pre-planning, logistics, scheduling and field operations."),
           ("John Fedeli", "Project Executive", "30+ years delivering complex projects, including 11 years leading design and construction at Howard Hughes Holdings. Oversees projects from precon to turnover.")]
for i, (n, t, b) in enumerate(leaders):
    x = Inches(0.7) + (i % 2) * Inches(6.1); yy = Inches(1.95) + (i // 2) * Inches(2.35)
    rect(s, x, yy, Inches(5.8), Inches(2.1), SOFT)
    tb(s, x + Inches(0.35), yy + Inches(0.3), Inches(5.2), Inches(0.4), n, 18, True, NAVY)
    tb(s, x + Inches(0.35), yy + Inches(0.7), Inches(5.2), Inches(0.3), t.upper(), 10, True, MUTE)
    tb(s, x + Inches(0.35), yy + Inches(1.05), Inches(5.1), Inches(1.0), b, 12.5, False, INK)

# 6 First week (cohort)
s = page("Your first week.", "You start with a cohort", 6)
tb(s, Inches(0.7), Inches(1.85), Inches(12), Inches(0.5), "New hires start together on the 1st and 3rd Monday of each month, so your first week is planned before you walk in.", 16, False, INK)
days = [("Mon", "Welcome", "Welcome breakfast, leadership kickoff, Insperity and paperwork, laptop and accounts, meet your coach."),
        ("Tue", "How we build", "Company standards, tools (Procore, Smartsheet, Teams), safety orientation for field roles."),
        ("Wed", "Your team", "Shadow your team or site. Learn the project, the people and the rhythm of the week."),
        ("Thu", "Your role", "Role-specific training with your coach. Set your first 30-day goals."),
        ("Fri", "Week one check-in", "30-minute sit-down with your coach: what's clear, what isn't, what you need.")]
for i, (d, h, b) in enumerate(days):
    x = Inches(0.7) + i * Inches(2.45)
    rect(s, x, Inches(2.65), Inches(2.3), Inches(3.9), SOFT)
    tb(s, x + Inches(0.25), Inches(2.85), Inches(2), Inches(0.5), d.upper(), 22, True, NAVY)
    tb(s, x + Inches(0.25), Inches(3.45), Inches(1.9), Inches(0.5), h, 14, True, INK)
    tb(s, x + Inches(0.25), Inches(4.0), Inches(1.85), Inches(2.4), b, 12, False, INK)

# 7 Role and coach (template)
s = page("Your role and your coach.", "Filled in for you", 7)
card(s, Inches(0.7), Inches(1.9), Inches(5.9), Inches(4.7), "Your role", ["[Title]", "", "[Two lines: what this role owns and why it matters to the project.]", "", "Core responsibilities:", "[3 to 5 lines from the job description]", "", "Reports to: [Name, title]"], 14)
card(s, Inches(6.9), Inches(1.9), Inches(5.7), Inches(4.7), "Your coach", ["[Name, title]  ·  [email]", "", "Your coach is your first call for anything. They will:"], 14)
bullets(s, Inches(7.2), Inches(3.55), Inches(5.2), Inches(3), ["Walk you through your first 30/60/90 days", "Explain how the team and our workflows fit together", "Answer questions and give you honest feedback", "Introduce you to the people you need to know", "Share the tips and tools that get you up to speed"], 13, 5)

# 8 30/60/90
s = page("Your first 90 days.", "30 / 60 / 90", 8)
cols = [("30 days", "Integrate and get clear", ["Handbook confirmed and benefits elected", "You can explain your role and who does what", "Early feedback from your coach", "First 90-day goals agreed", "Blockers raised and handled"]),
        ("60 days", "Contribute", ["Owning real work on your project or desk", "Using our tools without help", "Mid-point check-in with your coach", "One improvement idea shared"]),
        ("90 days", "Grow", ["Yearly goals tied to your role and our strategy", "Progress review and verbal feedback", "Your view on culture, support and resources", "Open forum: what should we do better?"])]
for i, (h, sub, its) in enumerate(cols):
    x = Inches(0.7) + i * Inches(4.1)
    rect(s, x, Inches(1.9), Inches(3.85), Inches(0.95), NAVY)
    tb(s, x + Inches(0.3), Inches(2.0), Inches(3.4), Inches(0.5), h, 22, True, WHITE)
    tb(s, x + Inches(0.3), Inches(2.45), Inches(3.4), Inches(0.35), sub, 13, False, RGBColor(0xDD, 0xE3, 0xEC))
    rect(s, x, Inches(2.85), Inches(3.85), Inches(3.75), SOFT)
    bullets(s, x + Inches(0.3), Inches(3.1), Inches(3.4), Inches(3.4), its, 13, 6)

# 9 Pay and benefits
s = page("Pay and benefits.", "Through Insperity, our HR partner", 9)
facts = [("Bi-weekly", "Paydays, every other week, through Insperity"), ("Day 31+", "Health insurance starts the 1st of the month after 30 days"),
         ("4% match", "401(k), eligible three months after your start date"), ("15 days", "PTO a year (years 1 to 5), usable after day 30")]
for i, (big, small) in enumerate(facts):
    x = Inches(0.7) + i * Inches(3.08)
    tb(s, x, Inches(2.0), Inches(2.9), Inches(0.7), big, 30, True, NAVY)
    tb(s, x, Inches(2.8), Inches(2.7), Inches(0.9), small, 13, False, INK)
s.shapes.add_connector(1, Inches(0.7), Inches(3.95), Inches(12.6), Inches(3.95)).line.color.rgb = LINE
bullets(s, Inches(0.7), Inches(4.25), Inches(6), Inches(2.4), ["Insperity Premier|portal.insperity.com: pay stubs, tax forms, benefits, PTO balance and company training", "Questions|Insperity Contact Center, 866-715-3552, Mon to Fri, 7am to 7pm CT"], 13, 8)
bullets(s, Inches(6.9), Inches(4.25), Inches(5.8), Inches(2.4), ["Sick leave|Up to 40 hours a year, usable from day one", "PTO|20 days a year from year 6; request 2 weeks ahead; unused PTO does not roll over", "The fine print|Your benefits book and the Employee Handbook govern"], 13, 8)

# 10 Holidays
s = page("2026 holidays.", "Time off", 10)
hol = [("New Year's Day", "Thu, Jan 1"), ("Martin Luther King Jr. Day", "Mon, Jan 19"), ("Presidents' Day", "Mon, Feb 16"), ("Good Friday", "Fri, Apr 3"), ("Memorial Day", "Mon, May 25"),
       ("Juneteenth", "Fri, Jun 19"), ("Independence Day (observed)", "Fri, Jul 3"), ("Labor Day", "Mon, Sep 7"), ("Thanksgiving Day", "Thu, Nov 26"), ("Christmas Day", "Fri, Dec 25")]
for i, (n, d) in enumerate(hol):
    x = Inches(0.7) + (i // 5) * Inches(6.1); yy = Inches(1.95) + (i % 5) * Inches(0.78)
    tb(s, x, yy, Inches(4), Inches(0.4), n, 16, False, INK); tb(s, x + Inches(4), yy, Inches(1.8), Inches(0.4), d, 16, True, NAVY, PP_ALIGN.RIGHT)
    s.shapes.add_connector(1, x, yy + Inches(0.55), x + Inches(5.8), yy + Inches(0.55)).line.color.rgb = LINE
tb(s, Inches(0.7), Inches(6.0), Inches(12), Inches(0.5), "Holiday pay starts 30 days after hire. Work the scheduled day before and after a holiday to be paid for it.", 12, False, MUTE)

# 11 How we work
s = page("How we work.", "Hours, dress and the open door", 11)
card(s, Inches(0.7), Inches(1.9), Inches(3.85), Inches(4.7), "Hours", ["8:00 am to 5:00 pm, Monday to Friday, unless your project or site sets its own schedule.", "", "Overtime for hourly team members needs your manager's approval first."], 13)
card(s, Inches(4.75), Inches(1.9), Inches(3.85), Inches(4.7), "Dress", ["Office: business casual. Neat jeans are fine; no ripped jeans, athletic wear or flip-flops.", "", "Meeting a client? Dress for it.", "", "On site: the site's safety and PPE rules come first."], 13)
card(s, Inches(8.8), Inches(1.9), Inches(3.85), Inches(4.7), "Open door", ["Ideas, questions or concerns go straight to your coach, your manager or leadership.", "", "Nobody here is too busy to hear how we can build better."], 13)

# 12 Tools
s = page("Your tools.", "Set up in week one", 12)
tools = [("Chat and meetings", "Microsoft Teams"), ("Email and calendar", "Microsoft Outlook"), ("Projects and field", "Procore and Smartsheet"),
         ("HR, pay and benefits", "Insperity Premier"), ("IT support", "CTS Service Department, service@ctscts.com"), ("Wi-Fi and building access", "Given to you in person on Day 1")]
for i, (h, b) in enumerate(tools):
    x = Inches(0.7) + (i % 3) * Inches(4.1); yy = Inches(1.95) + (i // 3) * Inches(2.3)
    card(s, x, yy, Inches(3.85), Inches(2.05), h, b, 15)

# 13 Communication
s = page("Email like a pro.", "Communication standards", 13)
tb(s, Inches(0.7), Inches(1.9), Inches(5.8), Inches(0.4), "DO", 14, True, NAVY)
bullets(s, Inches(0.7), Inches(2.35), Inches(5.8), Inches(4.2), ["Ask if it needs to be an email at all", "Write a clear subject line", "Reply within 24 hours, even if it's \"working on it, by Friday\"", "Answer every question asked", "Give a timeframe", "Proofread before you hit send"], 14, 7)
tb(s, Inches(6.9), Inches(1.9), Inches(5.8), Inches(0.4), "DON'T", 14, True, NAVY)
bullets(s, Inches(6.9), Inches(2.35), Inches(5.8), Inches(4.2), ["Reply All unless everyone needs it", "Write in anger or ALL CAPS", "Start a new thread for the same topic", "Forget the attachment, or send huge ones", "Put confidential or sensitive information in email", "Use slang"], 14, 7)

# 14 Policies
s = page("Policies to know.", "From the Employee Handbook", 14)
pol = [("Equal opportunity", "We hire, pay and promote on merit. No discrimination or retaliation."), ("Respect", "Zero tolerance for harassment. Report concerns; you're protected."),
       ("Drug and alcohol free", "A safe jobsite and office, always."), ("Artificial intelligence", "Follow the handbook's AI policy before using AI tools with company information."),
       ("Systems and confidentiality", "Company systems are for company business; protect project and client information."), ("Workplace safety", "No weapons, no violence, and speak up about anything unsafe.")]
for i, (h, b) in enumerate(pol):
    x = Inches(0.7) + (i % 3) * Inches(4.1); yy = Inches(1.9) + (i // 3) * Inches(2.2)
    card(s, x, yy, Inches(3.85), Inches(2.0), h, b, 13)
tb(s, Inches(0.7), Inches(6.4), Inches(12), Inches(0.4), "This is a summary. The Employee Handbook is the official policy; read it and sign the acknowledgement in your first week.", 12, False, MUTE)

# 15 Day 1 checklist
s = page("Day 1 checklist.", "Bring it, do it, ask it", 15)
card(s, Inches(0.7), Inches(1.9), Inches(3.85), Inches(4.7), "Bring", ["Photo ID and work authorization documents for your I-9", "Banking details for direct deposit", "Emergency contact information"], 14)
card(s, Inches(4.75), Inches(1.9), Inches(3.85), Inches(4.7), "Do", ["Create your Insperity Premier account", "Pick up your laptop and log in", "Get building access and Wi-Fi in person", "Sign the handbook acknowledgement (this week)"], 14)
card(s, Inches(8.8), Inches(1.9), Inches(3.85), Inches(4.7), "Ask your coach", ["Who's on my team and my project?", "What does a great first 30 days look like?", "When is our week-one check-in?"], 14)

# 16 Close
s = prs.slides.add_slide(BL); rect(s, 0, 0, W, H, NAVY)
tb(s, Inches(0.8), Inches(2.6), Inches(11), Inches(1.6), "Welcome aboard.", 60, True, WHITE)
tb(s, Inches(0.8), Inches(4.0), Inches(10), Inches(0.9), "We're here to support your journey, and we can't wait to see what you build.", 20, False, RGBColor(0xDD, 0xE3, 0xEC))
tb(s, Inches(0.8), H - Inches(0.9), Inches(8), Inches(0.3), "PB SOUTH CONSTRUCTION  ·  WEST PALM BEACH", 12, True, RGBColor(0xC9, 0xD2, 0xE0))

out = os.path.join(HERE, "welcome-to-pb-south-v1.pptx"); prs.save(out); print(out)
