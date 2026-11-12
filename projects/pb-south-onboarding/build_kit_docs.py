"""PB South New Hire Kit: one-page new-hire overview and manager game plan (.docx). Jenny, Eden Partner Group, 12 Nov 2026."""
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os
HERE = os.path.dirname(os.path.abspath(__file__))
NAVY = RGBColor(0x14, 0x28, 0x4B); MUTE = RGBColor(0x5F, 0x66, 0x70)

def base():
    d = Document()
    for sec in d.sections:
        sec.top_margin = sec.bottom_margin = Inches(0.6); sec.left_margin = sec.right_margin = Inches(0.75)
    st = d.styles["Normal"]; st.font.name = "Arial"; st.font.size = Pt(10.5)
    st.element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    hdr = d.sections[0].header.paragraphs[0]
    hdr.add_run().add_picture(os.path.join(HERE, "assets/pbs-mark.png"), height=Inches(0.35))
    r = hdr.add_run("   PB SOUTH CONSTRUCTION"); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = NAVY
    return d

def h(d, text, size=18, color=NAVY, before=0, after=4):
    p = d.add_paragraph(); p.paragraph_format.space_before = Pt(before); p.paragraph_format.space_after = Pt(after)
    r = p.add_run(text); r.bold = True; r.font.size = Pt(size); r.font.color.rgb = color; return p

def para(d, text, size=10.5, color=None, after=4, italic=False):
    p = d.add_paragraph(); p.paragraph_format.space_after = Pt(after)
    r = p.add_run(text); r.font.size = Pt(size); r.italic = italic
    if color: r.font.color.rgb = color
    return p

def shade(cell, hexcolor):
    tcPr = cell._element.get_or_add_tcPr(); s = OxmlElement("w:shd"); s.set(qn("w:val"), "clear"); s.set(qn("w:color"), "auto"); s.set(qn("w:fill"), hexcolor); tcPr.append(s)

def table(d, rows, widths, header=True, size=10, tall=False):
    from docx.shared import Inches as _I
    from docx.enum.table import WD_ROW_HEIGHT_RULE
    t = d.add_table(rows=len(rows), cols=len(rows[0])); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.LEFT; t.autofit = False
    for j, w in enumerate(widths): t.columns[j].width = w
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            c = t.cell(i, j); c.width = widths[j]; c.text = ""
            r = c.paragraphs[0].add_run(val); r.font.size = Pt(size)
            if header and i == 0: r.bold = True; r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF); shade(c, "14284B")
            elif j == 0: r.bold = True
        if tall and i > 0 and not row[-1]:
            t.rows[i].height = _I(0.34); t.rows[i].height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST
    d.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

# 1. One-page overview (filled in per new hire, gone through together on Day 1)
d = base()
h(d, "Welcome to PB South: your overview", 18)
para(d, "Filled in by your manager and gone through with you on Day 1. Keep it; it answers most first-month questions.", 10, MUTE, 8)
W2 = [Inches(2.1), Inches(4.9)]
table(d, [["Your start", ""], ["Name", ""], ["Title", ""], ["Start date (cohort)", ""], ["Reports to", ""], ["First project or desk", ""], ["Work hours and location", "8:00 am to 5:00 pm, unless your site sets its own"]], W2, tall=True)
table(d, [["Your coach", ""], ["Name and title", ""], ["How to reach them", ""], ["Week-one check-in", "Friday of your first week"]], W2, tall=True)
table(d, [["Who to ask", "Go to"], ["Your work and priorities", "Your manager"], ["How things work here, anything at all", "Your coach"], ["Pay, benefits, PTO balance", "Insperity Premier (portal.insperity.com) first, then HR"], ["HR and admin", "Carol Carabba, HR"], ["Laptop, email, systems", "CTS IT: service@ctscts.com"], ["Safety on site", "Your site superintendent. Stop work if unsure"], ["Something you can't take to your manager", "Jeff Rosser, General Manager"]], W2)
para(d, "Finding anyone: every contact is in the Outlook and Teams directory. Search a name to see their title, phone and email.", 10, None, 6)
table(d, [["Reviews and development", "When"], ["30, 60 and 90 day check-ins", "With your coach and manager; dates booked on Day 1: ______ / ______ / ______"], ["Mid-year review", "Every June or July"], ["Year-end review", "Every December"]], W2)
para(d, "The Employee Handbook and the Insperity benefits documents are the official policies. Sign the handbook acknowledgement in your first week.", 9, MUTE, 0, True)
d.save(os.path.join(HERE, "kit-02-new-hire-overview.docx"))

# 2. Game plan (for Jeff and every hiring manager)
d = base()
h(d, "Onboarding game plan", 18)
para(d, "How PB South brings people in: together, ready and with a plan. For the GM, hiring managers, HR and coaches.", 10, MUTE, 8)
h(d, "1. New hires start in cohorts", 13, before=4)
para(d, "Starts are the 1st and 3rd Monday of each month. Every offer names a cohort date. A hire who misses a cutoff rolls to the next cohort, two weeks later; the GM signs off any exception.")
h(d, "2. The countdown to Day 1", 13, before=6)
W3 = [Inches(1.7), Inches(3.9), Inches(1.4)]
table(d, [["When", "Done", "Owner"],
          ["Start minus 10 days", "Offer accepted; hire added to the cohort roster", "Recruiter / manager"],
          ["Start minus 7 days", "Offer letter, I-9 and tax forms sent; background and drug test ordered", "HR"],
          ["Start minus 5 days", "Insperity record created; coach assigned and makes contact", "HR, manager"],
          ["Start minus 3 days", "Tests cleared; laptop imaged; email and system accounts live", "HR, CTS IT"],
          ["Friday before", "Readiness check: every item green, Day 1 logistics confirmed (parking, PPE, location)", "HR"]], W3)
h(d, "3. The cohort week", 13, before=6)
table(d, [["Day", "Together", "By role"],
          ["Mon", "Welcome deck with the GM or a leader; paperwork; log-ins; the overview page with each hire; meet your coach", "Coach walk-through"],
          ["Tue", "Safety orientation; how PB South works", "Site walk / project tools / office systems"],
          ["Wed", "Benefits and Insperity walk-through; handbook acknowledgement", "Role deep-dive with manager"],
          ["Thu", "How we communicate and give feedback", "Shadow day with coach"],
          ["Fri", "Cohort lunch; what confused you?", "30-day goals set with manager"]], [Inches(0.6), Inches(3.9), Inches(2.5)])
h(d, "4. Reviews and development", 13, before=6)
table(d, [["Checkpoint", "What happens", "Who"],
          ["Day 30", "Role clear, benefits elected, 90-day goals agreed (30-day checklist)", "Manager, coach"],
          ["Day 60", "Doing the work with a checker; blockers cleared", "Manager, coach, one peer"],
          ["Day 90", "Owning the work; yearly goals set (90-day checklist)", "Manager, GM"],
          ["Mid-year (June / July)", "Performance, goals and development conversation", "Manager"],
          ["Year-end (December)", "Annual review: performance, goals, growth", "Manager, GM"]], W3)
h(d, "5. The coach", 13, before=6)
para(d, "A peer in the same role family, at least 12 months in, not the manager. Named 5 days before the start. Week 1: daily 10-minute close-out. Weeks 2 to 8: weekly 30-minute one-on-one. Weeks 9 to 13: every other week. One line logged per week.")
h(d, "6. How we'll know it's working", 13, before=6)
para(d, "Per cohort: days from accept to start, the share fully ready on Day 1, 90-day retention, and a three-question pulse at Day 5, 30, 60 and 90 (I know what's expected of me; I have what I need; I'd recommend working here). Set targets after two or three cohorts.")
h(d, "What's in this folder", 13, before=6)
para(d, "01 Welcome deck (present on Day 1; speaker notes on every slide)  ·  02 New-hire overview (one per hire, filled in by the manager)  ·  03 This game plan")
d.save(os.path.join(HERE, "kit-03-game-plan.docx"))
print("ok")
