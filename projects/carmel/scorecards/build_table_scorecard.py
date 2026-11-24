#!/usr/bin/env python3
"""Build a table-style interview scorecard (.docx) for Google Docs conversion.

Usage: python3 build_table_scorecard.py <role-key|all> <out_dir>
Layout: title, small line(s), header table, off-limits line, must-haves table
with total, quick checks table, questions list, strengths/gaps, next steps, footer.
No candidate names live in this file. Add a role by adding an entry to ROLES.
"""
import sys, os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

FONT = "Montserrat"
CREAM = "F4F1EA"
OFF_LIMITS = ("Off-limits: age or graduation year, family, marital status, pregnancy, religion, "
              "national origin or citizenship, disability or health, arrests, current or past pay.")
FOOTER = "Review before it goes to the client: read every field, pay line and name."
QUICK = ["Work authorization (US)|Y / N", "Needs sponsorship|Y / N", "Location / in-office fit|",
         "Notice period / start|", "Other processes / timing|", "Pay expectation (base / total)|",
         "Bonus structure and timing (not amounts)|"]

ROLES = {
    "da": dict(
        role="Design Associate (San Francisco)",
        ha="Sarah Converse, VP Design",
        lines=["Process: 1) Recruiter screen with Kev, notes to Sarah  2) Zoom with Sarah and Katie  "
               "3) Paper assessment (Bluebeam review of a 50% CD set), in office or take home  "
               "4) Final onsite, may also meet Kim and/or Adam",
               "Must-haves from Sarah, 24 Nov. Assessment details still being set by Sarah, Adam and Kim."],
        rec="Advance to Sarah / Hold / Decline",
        must=["Architectural background with an interiors focus",
              "CAD, Bluebeam and Procore, hands-on",
              "Reads floor plans and reflected ceiling plans; spots nuances that help construction and design",
              "Reviews a plan set against schedules and elevations and finds the disconnects",
              "Knows design phases: 50% CDs through an IFC set",
              "SF fit and timing: in-office, notice, start date"],
        qs=["Walk me through a project you worked on: your role from design through CDs.",
            "Which tools do you use weekly: CAD, Bluebeam, Procore? Where are you weakest?",
            "On a floor plan or ceiling plan, what do you check first? Give a catch you made.",
            "Tell me about a disconnect you found between plans, schedules and elevations. What happened?",
            "What changes between a 50% CD set and an IFC set? What's your part in that?",
            "Spec schedules and renderings: what have you produced, and for whom?",
            "Comfortable with a Bluebeam review of a CD set (about 1.5 to 2 hours), at home or in office?",
            "When could you meet Sarah, and what's your notice period?"],
    ),
    "fpa": dict(
        role="FP&A Analyst, Fund Management (NY)",
        ha="Kyle Beddow",
        lines=["Process: 1) Screen with Kev  2) In person with Kyle in NYC + Excel assessment  "
               "3) Finalist with Meredith Stinson and Phil",
               "Excel assessment is hugely important. Must-haves: confirm with Kyle."],
        rec="Advance to Kyle / Hold / Decline",
        must=["FP&A core: budget vs actuals, variances, fund or portfolio forecasting",
              "Advanced Excel and modeling (walks a complex model; assessment-ready)",
              "Systems: Yardi hands-on (modules, how recent), planning or BI tools",
              "Real estate / asset level: multifamily, fund or property financials",
              "Communicates with senior people: clear numbers, owns errors, takes pushback",
              "NY fit and timing: in-office or hybrid, notice, start date"],
        qs=["Walk me through your most complex model. What did it answer; what went wrong first?",
            "Which Excel tools do you use weekly? Where are you weakest?",
            "How do you review budget vs actuals? What do you do when a line is far off?",
            "A forecast you owned: how often reforecast, how close did it land?",
            "Yardi and other systems: which modules, how recently, what role?",
            "Real estate or fund work: property P&Ls, NOI, capex, fund reporting?",
            "A number you produced was wrong after someone relied on it. What did you do?",
            "Comfortable with a timed Excel assessment in NYC? When could you come in?"],
    ),
    "ad": dict(
        role="Analyst, Acquisitions & Development (NY)",
        ha="Lee and Elaine",
        lines=["Must-haves: confirm with Lee and Elaine."],
        rec="Advance to Lee and Elaine / Hold / Decline",
        must=["Underwriting: acquisition or development models, multifamily preferred",
              "Advanced Excel: walks a model, what it answered, what went wrong first",
              "Market and comp research: summarizes a submarket, defends assumptions",
              "Deal support: memos, IC materials, tight deadlines",
              "Development exposure: budgets, schedules, entitlements or draws",
              "Systems: Yardi or other property systems (confirm it matters)",
              "NY fit and timing: in-office or hybrid, notice, start date"],
        qs=["Walk me through a model you built. Which assumption moved the answer most?",
            "A deal you underwrote that the team passed on: why?",
            "How do you build a rent and expense comp set? Where is the data from?",
            "Walk a development budget: hard, soft, contingency, timeline.",
            "What have you written for IC? What did they push back on?",
            "Too much to do before a deadline: what did you drop and why?",
            "Yardi or other systems: which modules, how recently?",
            "Could you take an online assessment this week?"],
    ),
    "am": dict(
        role="Senior Analyst, Asset Management (NY)",
        ha="Carly Lenderts",
        lines=["Thinnest NY role: no JD found. Must-haves: confirm with Carly."],
        rec="Advance to Carly / Hold / Decline",
        must=["Yardi hands-on: modules, how recent, what role",
              "Multifamily or CRE asset management on an owned portfolio",
              "Business plans and variance to budget: explains a miss and the response",
              "Modeling and reporting for investors or leadership; strong Excel",
              "Fluent with senior stakeholders; handles disagreement",
              "Based in NY, or relocating at own choice and cost",
              "OK with online skills test (AI allowed) and in-office NY final"],
        qs=["Your current role and portfolio: asset types, property count, size?",
            "Which Yardi modules have you used yourself, and when last day to day?",
            "A property that missed budget: what drove it, what did you do?",
            "A business plan you built or reforecast: what was your part?",
            "Which investor or leadership reports do you own? How built in Excel?",
            "You disagreed with a senior person on an analysis. How did it end?",
            "How much of your work is multifamily vs other property types?",
            "OK with an online skills test and an in-office NY final round?"],
    ),
    "pe": dict(
        role="Marina Shores Project Engineer (Long Beach)",
        ha="Bob Robinson and Ryan Molina",
        lines=["Contact runs through Stephanie Effros until early December. "
               "Must-haves: confirm with Bob and Ryan."],
        rec="Advance to Bob and Ryan / Hold / Decline",
        must=["Degree in construction management or engineering",
              "Good internship experience during college",
              "1–2 yrs Project Engineer at large commercial GC or MF owner-builder",
              "Project controls developed; Procore or equivalent",
              "Can work in Long Beach on 390-unit wrap project into 2029",
              "Steady, eager to learn from a strong team; long project"],
        qs=["Your degree and the internships that shaped your path?",
            "PE roles: company, project type and size, what you owned?",
            "Which Procore tools (RFIs, submittals, COs, drawings, budget), how deep?",
            "How do you track cost, schedule and change events? Real example.",
            "A wrap or podium multifamily project: what was your part?",
            "Something went wrong in the field or paperwork. What did you do?",
            "How do you work with supers, subs and design day to day?",
            "Why a project running into 2029? What would keep you on it?"],
    ),
    "dev": dict(
        role="Development Execution & Capital Projects (Santa Monica), STUB",
        ha="Eric Snow (with Kim Hoeksema, to confirm)",
        lines=["STUB: do not use as a screen until Eric confirms must-haves. Must-haves: confirm with Eric."],
        rec="Advance to Eric / Hold / Decline",
        must=["Development execution on multifamily or comparable (to confirm)",
              "Capital projects: budget, schedule, cost tracking (to confirm)",
              "Coordinates construction, design and finance teams (to confirm)",
              "Can step into the departing person's seat; level to confirm",
              "Based in or near Santa Monica; in-office days to confirm"],
        qs=["Development or capital projects: types, size, your role?",
            "How do you build and track budget and schedule, and report variances?",
            "A project that ran over cost or time: what did you do?",
            "How do you work with construction, design and finance on a deal?",
            "What does design-to-construction handoff look like for you?",
            "Which systems and reports do you use for cost and schedule?",
            "What part of a development project do you want to own most?"],
    ),
}


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def borders(table):
    tblPr = table._tbl.tblPr
    b = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}")
        e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4"); e.set(qn("w:space"), "0"); e.set(qn("w:color"), "000000")
        b.append(e)
    tblPr.append(b)


def set_font(run, size=9.5, bold=False, italic=False):
    run.font.name = FONT; run.font.size = Pt(size); run.bold = bold; run.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)
    rpr = run._element.get_or_add_rPr()
    rf = rpr.find(qn("w:rFonts"))
    if rf is None:
        rf = OxmlElement("w:rFonts"); rpr.append(rf)
    for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rf.set(qn(a), FONT)


def para(doc, text, size=9.5, bold=False, italic=False, after=2, before=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after); p.paragraph_format.space_before = Pt(before)
    set_font(p.add_run(text), size, bold, italic)
    return p


def heading(doc, text):
    return para(doc, text, size=11, bold=True, before=8, after=3)


def table(doc, rows, widths, header=True, bold_first_col=False):
    t = doc.add_table(rows=len(rows), cols=len(widths))
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    t.autofit = False
    borders(t)
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            c = t.cell(i, j)
            c.width = widths[j]
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(1); p.paragraph_format.space_before = Pt(1)
            is_head = header and i == 0
            set_font(p.add_run(val), 9, bold=is_head or (bold_first_col and j == 0))
            if is_head or (bold_first_col and j == 0 and not header):
                shade(c, CREAM)
    return t


def build(key, out_dir):
    r = ROLES[key]
    doc = Document()
    sec = doc.sections[0]
    sec.left_margin = sec.right_margin = Inches(0.7)
    sec.top_margin = sec.bottom_margin = Inches(0.6)
    st = doc.styles["Normal"]; st.font.name = FONT; st.font.size = Pt(9.5)

    para(doc, f"Interview Scorecard: {r['role']}", size=16, bold=True, after=2)
    para(doc, "Eden Partner Group · Carmel Partners · Draft for Kev", size=8.5, after=1)
    for ln in r["lines"]:
        para(doc, ln, size=8.5, after=1)

    W = Inches(7.1)
    table(doc, [["Candidate", ""], ["Date", ""], ["Screener", "Kev Williams"],
                ["Hiring manager", r["ha"]], ["Recommendation", r["rec"]]],
          [Inches(1.6), W - Inches(1.6)], header=False, bold_first_col=True)
    para(doc, OFF_LIMITS, size=9, bold=True, before=6, after=2)

    heading(doc, "Must-haves")
    n = len(r["must"])
    rows = [["#", "Must-have", "Score (1–5)", "Evidence (short)"]]
    rows += [[str(i + 1), m, "", ""] for i, m in enumerate(r["must"])]
    rows += [["", "Total", f"__ / {n * 5}", ""]]
    t = table(doc, rows, [Inches(0.35), Inches(3.4), Inches(0.9), Inches(2.45)])
    for c in t.rows[-1].cells:
        for run in c.paragraphs[0].runs:
            run.bold = True

    heading(doc, "Quick checks")
    table(doc, [["Item", "Answer"]] + [q.split("|") for q in QUICK], [Inches(2.8), Inches(4.3)])

    heading(doc, "Questions to ask")
    for i, q in enumerate(r["qs"], 1):
        para(doc, f"{i}. {q}", size=9, after=1)

    heading(doc, "Strengths / Gaps")
    table(doc, [["Strengths", "Gaps"]] + [["", ""]] * 3, [Inches(3.55), Inches(3.55)])

    heading(doc, "Next steps")
    table(doc, [["Next step", "Owner", "Date"]] + [["", "", ""]] * 2,
          [Inches(4.3), Inches(1.6), Inches(1.2)])

    para(doc, FOOTER, size=8.5, italic=True, before=8)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"scorecard-{key}.docx")
    doc.save(path)
    return path


if __name__ == "__main__":
    keys = list(ROLES) if sys.argv[1] == "all" else [sys.argv[1]]
    for k in keys:
        print(build(k, sys.argv[2]))
