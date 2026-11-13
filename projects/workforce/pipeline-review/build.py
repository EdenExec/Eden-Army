#!/usr/bin/env python3
"""Friday Pipeline Review builder.

Run:  python3 build.py        (from anywhere)
Reads the agents' JSON and markdown from ../ , builds one DATA object,
relabels discreet clients, writes review.html next to this file.
Tolerant: any missing file or field becomes an empty value and a warning.
"""
import json, os, re, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WARN = []


def warn(m):
    WARN.append(m)
    print("WARN:", m, file=sys.stderr)


def load(rel, default=None):
    p = os.path.join(ROOT, rel)
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        warn("missing/unreadable %s (%s)" % (rel, type(e).__name__))
        return {} if default is None else default


def text(rel):
    try:
        with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
            return f.read()
    except Exception:
        warn("missing text " + rel)
        return ""


def g(d, *ks, default=None):
    for k in ks:
        if isinstance(d, dict) and k in d and d[k] is not None:
            d = d[k]
        else:
            return default
    return d


def flip(n):
    """'Last, First' -> 'First Last'."""
    if isinstance(n, str) and "," in n:
        a, b = n.split(",", 1)
        return (b.strip() + " " + a.strip()).strip()
    return n or ""


def days_between(a, b):
    try:
        return (datetime.date.fromisoformat(b) - datetime.date.fromisoformat(a)).days
    except Exception:
        return None


# ---------------------------------------------------------------- inputs
FLOW = load("dean/rpa-flow.json")
RECS = ["max", "evan", "noah", "andrew", "bridger", "nick", "kev"]
NAMES = {"max": "Max", "evan": "Evan", "noah": "Noah", "andrew": "Andrew “Juicy”",
         "bridger": "Bridger", "nick": "Nick", "kev": "Kev"}
JOS = load("casey/jos.json")
INTV = load("casey/interviewing.json")
MPP = load("casey/mps-ptcs.json")
NEXT = load("casey/next-week.json")
BUILT = load("scout/built.json")
OUT = load("scout/outcomes.json")
QC = load("qc/qc.json")
DIALS = load("radar/dials.json")
DIAL_BY = g(DIALS, "by_recruiter", default={}) or {}
DIAL_TEAM = g(DIALS, "team")

PARTIAL = g(FLOW, "partial_week", default="")[:10] or "2026-11-09"
PULLED = re.split(r"\s*\(", g(FLOW, "pulled", default="Thu 12 Nov 2026, 9:18 PM PT"))[0]
ASOF = g(JOS, "as_of", default="Fri 13 Nov 2026")
ASOF_ISO = "2026-11-13"
weeks_keys = sorted(g(FLOW, "weeks", default={}).keys())
complete = [k for k in weeks_keys if k != PARTIAL]
last_key = complete[-1] if complete else None
four = complete[-4:]

# ---------------------------------------------------------------- RPA flow
STAGES = [("dials", "Dial"), ("rps", "RP"), ("resumes", "Resume"), ("ptcs", "PTC"), ("ftis", "FTI")]


def ratio(a, c):
    """per 100 of the earlier step; None when either side is missing or the base is 0."""
    if not isinstance(a, (int, float)) or not isinstance(c, (int, float)) or not a:
        return None
    return round(c / a * 100, 1)


RATIOS = [("dr", "RPs per 100 dials", "dials", "rps"), ("rr", "Resumes per 100 RPs", "rps", "resumes"),
          ("rp", "PTCs per 100 resumes", "resumes", "ptcs"), ("pf", "FTIs per 100 PTCs", "ptcs", "ftis")]
flow_weeks = []
for k in weeks_keys:
    w = FLOW["weeks"][k]
    hh = dict(w.get("headhunters", {}))
    hh["dials"] = DIAL_TEAM if k == PARTIAL else None
    d = datetime.date.fromisoformat(k)
    flow_weeks.append({"key": k, "label": "%d %s" % (d.day, d.strftime("%b")),
                       "partial": k == PARTIAL, "v": hh,
                       "ratio": {rk: ratio(hh.get(a), hh.get(c)) for rk, _, a, c in RATIOS}})
four_tot = g(FLOW, "four_complete_weeks_total", default={})
avg_ratio = {rk: ratio(four_tot.get(a), four_tot.get(c)) for rk, _, a, c in RATIOS}
cw = [w for w in flow_weeks if not w["partial"]]
pw = [w for w in flow_weeks if w["partial"]]
leak = {}
if cw:
    leak = {"resumes_first": cw[0]["v"].get("resumes"), "resumes_last": cw[-1]["v"].get("resumes"),
            "first_label": cw[0]["label"], "last_label": cw[-1]["label"],
            "resumes_this": pw[0]["v"].get("resumes") if pw else None,
            "screens_first": cw[0]["v"].get("screens"), "screens_this": pw[0]["v"].get("screens") if pw else None}
worst = None
for s_ in RECS[:5]:
    dl, rp = DIAL_BY.get(s_), g(FLOW, "per_recruiter", s_, PARTIAL, "rps")
    r_ = ratio(dl, rp)
    if r_ is not None and (worst is None or r_ < worst[1]):
        worst = (s_, r_, dl, rp)
leak["worst"] = {"name": NAMES.get(worst[0], worst[0]).split(" ")[0], "ratio": worst[1], "dials": worst[2], "rps": worst[3]} if worst else None
flow = {
    "stages": [{"k": k, "n": n} for k, n in STAGES],
    "ratios": [{"k": rk, "n": n} for rk, n, _, _ in RATIOS],
    "weeks": flow_weeks, "avg_ratio": avg_ratio, "leak": leak,
    "dial_source": g(DIALS, "source", default=""), "dial_pulled": g(DIALS, "pulled", default=""),
    "std": g(FLOW, "standards", default={}),
}

# ---------------------------------------------------------------- recruiters
METRICS = [("dials", "Dial"), ("rps", "RP"), ("resumes", "Resume"), ("ptcs", "PTC"), ("ftis", "FTI"), ("mps", "MPs (side figure)")]


def clean_coach(s):
    return (s or "").replace("Note:", "Note:")


def monday_days(pk):
    d0 = datetime.date.fromisoformat(pk)
    return [d0 + datetime.timedelta(days=i) for i in range(5)]


recs = []
for s in RECS:
    d = load("dean/recruiters/%s.json" % s)
    wk = d.get("weeks", {})
    this = dict(wk.get(PARTIAL, {}))
    last = dict(wk.get(last_key, {}) if last_key else {})
    this["dials"] = DIAL_BY.get(s)  # None for Nick and Kev; earlier weeks have no dial data
    mets = []
    for k, n in METRICS:
        vals = [wk.get(x, {}).get(k) for x in four] if k != "dials" else []
        vals = [v for v in vals if isinstance(v, (int, float))]
        avg = round(sum(vals) / len(vals), 1) if vals else None
        mets.append({"k": k, "n": n, "this": this.get(k), "last": last.get(k), "avg": avg})
    rpd = d.get("rp_by_day", {}) or {}
    days = []
    try:
        for dt in monday_days(PARTIAL):
            iso = dt.isoformat()
            days.append({"d": dt.strftime("%a"), "iso": iso, "rps": rpd.get(iso),
                         "open": iso >= ASOF_ISO})
    except Exception:
        pass
    con = d.get("contacts", {}) or {}
    names = {k: [flip(x) for x in con.get(k, [])] for k in ("resumes", "ptcs", "ftis", "mps")}
    jos_active = []
    for j in d.get("jos", []):
        jos_active.append({"name": j.get("name", ""), "num": j.get("num"), "col": j.get("column"),
                           "rps": g(j, "this", "rps", default=0), "ptcs": g(j, "this", "ptcs", default=0),
                           "ftis": g(j, "this", "ftis", default=0)})
    jos_active.sort(key=lambda x: -(x["rps"] or 0))
    ratios = {rk: ratio(this.get(a), this.get(c)) for rk, _, a, c in RATIOS}
    nxt = []
    nw = g(NEXT, "recruiters", s, default={}) or {}
    for j in nw.get("ranked_jos", []):
        lp = j.get("live_pipeline", {}) or {}
        nxt.append({"order": j.get("order"), "client": j.get("client", ""), "role": j.get("role", ""),
                    "loc": j.get("location", ""), "seat": j.get("my_seat", ""), "rank": j.get("board_rank"),
                    "ptc": lp.get("ptc", 0), "sub": lp.get("submitted", 0), "int": lp.get("interviewing", 0),
                    "push": j.get("push_monday_to_friday", "")})
    recs.append({"slug": s, "name": NAMES[s], "below": s in ("nick", "kev"), "days": days,
                 "total": this.get("rps"), "vals": {k: this.get(k) for k, _ in STAGES}, "metrics": mets, "ratios": ratios, "dials": this.get("dials"), "names": names, "jos": jos_active,
                 "next": nxt, "seats": nw.get("seats"), "lead_seats": nw.get("lead_seats"),
                 "coaching": clean_coach(d.get("coaching", "")), "rps_last": last.get("rps")})

team = {
    "dials": DIAL_TEAM,
    "total": g(FLOW, "weeks", PARTIAL, "headhunters", "rps"),
    "goal": g(FLOW, "standards", "rps_week_team", default=375),
    "per": g(FLOW, "standards", "rps_week_per_recruiter", default=75),
    "day": g(FLOW, "standards", "rps_day", default=15),
    "last_total": g(FLOW, "weeks", last_key, "headhunters", "rps") if last_key else None,
}

# ---------------------------------------------------------------- JO board
ACTIVE_ST = ("active", "new", "kill?")
all_jos = JOS.get("jos", []) or []
act = [j for j in all_jos if j.get("status") in ACTIVE_ST]
AT_RISK = ["triton-precon-miami", "pb-south-demo-super-miami", "discreet-qc-oil-gas"]
need_lead = [u.get("jo") for u in (NEXT.get("unowned") or [])]
no_cand_ids = NEXT.get("no_pipeline_active") or [j["id"] for j in act if sum((j.get("counts") or {}).values()) == 0]
by_id = {j.get("id"): j for j in all_jos}


def jo_label(j):
    return {"client": j.get("client", ""), "role": j.get("role", ""), "loc": j.get("location", "")}


jo_rows = []
for j in act:
    c = j.get("counts", {}) or {}
    jo_rows.append({"n": len(jo_rows), "client": j.get("client", ""), "role": j.get("role", ""),
                    "loc": j.get("location", ""), "owner": j.get("owner"), "status": j.get("status"),
                    "rank": j.get("rank"), "quiet": j.get("days_since_movement"),
                    "open": j.get("days_open"), "sourced": c.get("sourced", 0), "ptc": c.get("ptc", 0),
                    "sub": c.get("submitted", 0), "int": c.get("interviewing", 0), "off": c.get("offer", 0),
                    "risk": AT_RISK.index(j["id"]) + 1 if j.get("id") in AT_RISK else 0,
                    "nocand": j.get("id") in no_cand_ids, "nolead": j.get("id") in need_lead,
                    "next": j.get("next_action", "") if j.get("id") in AT_RISK else ""})
jo_rows.sort(key=lambda r: (r["risk"] == 0, r["rank"] if r["rank"] is not None else 99))
risk_why = {}
for r in (NEXT.get("quiet_7d") or []):
    risk_why[r.get("jo")] = r
jos = {
    "total": len(act),
    "by_status": {s: sum(1 for j in act if j.get("status") == s) for s in ACTIVE_ST},
    "on_hold": sum(1 for j in all_jos if j.get("status") == "on hold"),
    "no_cand": sum(1 for r in jo_rows if r["nocand"]),
    "need_lead": sum(1 for r in jo_rows if r["nolead"]),
    "quiet7": len(NEXT.get("quiet_7d") or []),
    "rows": jo_rows,
}

# ---------------------------------------------------------------- interviewing
live = INTV.get("live", []) or []
groups = {}
for p in live:
    key = (p.get("client", ""), p.get("role", ""))
    cl = p.get("client", "")
    if cl.startswith("("):
        cl = ""
    gp = groups.setdefault(key, {"client": cl, "role": p.get("role", ""), "people": []})
    gp["people"].append({"name": p.get("name", ""), "since": p.get("stage_since"),
                         "days": days_between(p.get("stage_since", ""), ASOF_ISO),
                         "who": p.get("recruiter")})
grp = sorted(groups.values(), key=lambda x: -len(x["people"]))
intv = {"people": len({p.get("name") for p in live}), "rows": len(live), "jos": len(groups),
        "groups": grp, "stale": INTV.get("stale_stage_count")}

# ---------------------------------------------------------------- MPs and PTCs
ptc_seen, ptcs = set(), []
for a in MPP.get("ptc_activities", []) or []:
    k = (a.get("candidate"), a.get("date"))
    if k in ptc_seen:
        continue
    ptc_seen.add(k)
    ptcs.append({"date": a.get("date"), "name": a.get("candidate"), "who": a.get("recruiter"),
                 "jo": a.get("jo_or_mpc")})
mps = [{"date": a.get("date"), "name": a.get("client_contact"), "who": a.get("recruiter"),
        "jo": a.get("jo_or_bucket")} for a in (MPP.get("mp_activities") or [])]
mpp = {"window": MPP.get("window"), "ptcs": ptcs, "mps": mps,
       "ptc_by": MPP.get("ptc_by_recruiter", {}), "mp_by": MPP.get("mp_by_recruiter", {}),
       "stage_changes": [{"date": s.get("date"), "name": s.get("candidate"), "stage": s.get("stage"),
                          "jo": s.get("jo_or_mpc"), "who": s.get("recruiter")}
                         for s in (MPP.get("ptc_stage_changes") or [])],
       "mpc_total": MPP.get("mpc_adds_total")}

# ---------------------------------------------------------------- depth charts
LANES = [("offer", "Offer"), ("interviewing", "Interviewing"), ("submitted", "Submitted"),
         ("ptc", "PTC"), ("queue", "Queue")]
depth, nocand_list = [], []
dpath = os.path.join(ROOT, "casey", "depth")
files = sorted(os.listdir(dpath)) if os.path.isdir(dpath) else []
if not files:
    warn("no casey/depth files")
for fn in files:
    if not fn.endswith(".json"):
        continue
    try:
        with open(os.path.join(dpath, fn), encoding="utf-8") as f:
            d = json.load(f)
    except Exception:
        warn("bad depth file " + fn)
        continue
    jo = d.get("jo", {}) or {}
    if jo.get("status") not in ACTIVE_ST:
        continue
    lanes = {}
    total = 0
    for k, _ in LANES:
        arr = (d.get("lanes", {}) or {}).get(k, []) or []
        tot = (d.get("lanes", {}) or {}).get(k + "_total", len(arr))
        total += tot or 0
        arr = sorted(arr, key=lambda p: bool(p.get("stale")))
        lanes[k] = {"total": tot, "people": [{"name": p.get("name", ""), "status": ("Resume sent" if p.get("status") == "Submitted" else p.get("status", "")),
                                              "stale": bool(p.get("stale"))} for p in arr[:7]]}
    row = {"client": jo.get("client", ""), "role": jo.get("role", ""), "loc": jo.get("location", ""),
           "owner": jo.get("owner"), "rank": jo.get("rank"), "open": jo.get("days_open"),
           "status": jo.get("status"), "lanes": lanes, "total": total}
    (depth if total else nocand_list).append(row)
depth.sort(key=lambda r: (r["rank"] if r["rank"] is not None else 99))
nocand_list.sort(key=lambda r: (r["rank"] if r["rank"] is not None else 99))

# ---------------------------------------------------------------- lead gen
T = g(OUT, "totals", default={})
never = g(OUT, "went_nowhere", "never_loaded", default=[])
leadgen = {
    "lists": g(BUILT, "totals", "distinct_lists", default=T.get("distinct_lists")),
    "names": g(BUILT, "totals", "names_on_distinct_lists", default=T.get("names_on_distinct_lists")),
    "loaded_sheets": T.get("sheets_loaded_to_crelate"), "sheets": T.get("sheets_in_lead_log"),
    "loaded_names": T.get("names_on_loaded_sheets"),
    "dialed": T.get("unique_people_with_a_logged_call_or_voicemail_after_load"),
    "zero_call_sheets": T.get("loaded_sheets_with_zero_logged_calls"),
    "zero_call_names": T.get("names_on_those"),
    "median_days": T.get("median_days_landed_to_in_crelate"),
    "mp": T.get("unique_people_with_marketing_call"), "ptc": T.get("unique_people_with_PTC"),
    "sub": T.get("unique_people_with_submittal"), "fti": T.get("unique_people_with_first_time_interview"),
    "traced": T.get("people_with_MP_or_PTC_total"), "traced_strong": T.get("of_which_strongly_traced_to_a_loaded_sheet"),
    "built_not_landed": len(BUILT.get("built_not_landed", []) or []),
    "never_loaded": len([x for x in never if "superseded" not in (x.get("why") or "")]),
    "never_loaded_names": g(OUT, "went_nowhere", "never_loaded_total_names_excluding_superseded"),
}
leadgen["stalls"] = [
    "Phones gate the load: BPO waits for “Phones Added”, median %s days to reach Crelate" % (leadgen["median_days"] or "n/a"),
    "Nobody owns the click: four seats, rotating, one human",
    "Dialing is not tracked: %s loaded sheets show no logged call" % (leadgen["zero_call_sheets"] if leadgen["zero_call_sheets"] is not None else "n/a"),
    "The Lead Log is stale, Drive is the truth",
    "Volume outruns dial capacity: %s loaded names, %s people called" % (leadgen["loaded_names"], leadgen["dialed"]),
]
leadgen["options"] = [
    {"n": 1, "name": "One seat, one clicker", "cost": "No new spend", "speed": "Same day", "safety": "Best", "rec": True,
     "who": "Noah exports from one seat until it nears 1,800 credits, then moves to the next"},
    {"n": 2, "name": "BPO exports on one dedicated seat", "cost": "No new spend", "speed": "Fastest, overnight", "safety": "Highest risk",
     "who": "Needs ZoomInfo’s written OK and password handling first"},
    {"n": 3, "name": "Pool the credits", "cost": "Unknown, may be free", "speed": "Fast once set up", "safety": "Good",
     "who": "One question to the ZoomInfo rep"},
    {"n": 4, "name": "Stop chasing the full allowance", "cost": "None", "speed": "Fast", "safety": "Good",
     "who": "Use the seat that has credits; real need is 1,000 to 2,000 a month, not 8,000"},
]
leadgen["recommendation"] = ("Option 1 sized the Option 4 way: one seat, one clicker (Noah). BPO keeps cleaning and loading, "
                             "but loads the same night without waiting for phones. Ask the rep about pooling in the same email.")
opt_md = text("scout/options.md")
if opt_md and "## Recommendation" not in opt_md:
    warn("scout/options.md has no Recommendation section; using built-in text")



# ---------------------------------------------------------------- credits, market intel, marketing
def md_sections(src):
    """{heading: [lines]} split on '## ' (text before the first heading under '_top')."""
    out, cur = {"_top": []}, "_top"
    for ln in src.splitlines():
        if ln.startswith("## "):
            cur = ln[3:].strip()
            out[cur] = []
        else:
            out[cur].append(ln)
    return out


def md_table(lines):
    rows = []
    for ln in lines:
        s_ = ln.strip()
        if s_.startswith("|") and not re.match(r"^\|[\s:|-]+\|?$", s_):
            rows.append([c.strip() for c in s_.strip("|").split("|")])
    return rows[1:] if rows else []


def md_bullets(lines):
    return [re.sub(r"\*\*|`", "", re.match(r"^\s*[-*]\s+(.*)", l).group(1)).strip() for l in lines if re.match(r"^\s*[-*]\s+", l)]


def plain(s_):
    return re.sub(r"\*\*|`", "", s_ or "").strip()


CR = load("scout/credits.json")
zi, el = g(CR, "zoominfo", default={}) or {}, g(CR, "elevenlabs", default={}) or {}
credits = {
    "as_of": g(CR, "as_of", default=""),
    "zi": {"allowance": zi.get("allowance_monthly"), "allowance_confirmed": bool(zi.get("allowance_confirmed")),
           "confirmed": zi.get("paid_credits_confirmed_this_month"), "pending": zi.get("paid_credits_pending_estimate"),
           "pct": zi.get("estimated_pct_of_allowance"), "unknown": zi.get("unknown") or [],
           "to_confirm": zi.get("to_confirm_by_kev") or [],
           "ceiling": g(zi, "theoretical_ceiling_phone_enrichment", "ceiling")},
    "el": {"used": el.get("used"), "plan": el.get("plan"), "pct": el.get("pct_used"), "remaining": el.get("remaining"),
           "reset": el.get("reset"), "last": el.get("last_render")},
    "decision": "Decision made 13 Nov: exports move to BPO (Kev\u2019s ZoomInfo rep OK\u2019d).",
}
CR_ON = bool(CR)

MI = load("scout/market-intel.json")
mi_markets = []
for m_ in (MI.get("markets") or []):
    sigs = m_.get("signals") or []
    live_ = [x for x in sigs if not x.get("context")] or sigs
    top = next((x for x in live_ if x.get("url")), live_[0] if live_ else {})
    mi_markets.append({"market": m_.get("market", ""), "top": plain(top.get("text")), "url": top.get("url"),
                       "scoop": top.get("zoominfo_scoop_id"), "context": bool(top.get("context")),
                       "verify": bool(top.get("verify")), "nlive": len([x for x in sigs if not x.get("context")]),
                       "so": plain(m_.get("so_what")), "action": plain(m_.get("action"))})
rh_on = os.path.exists(os.path.join(ROOT, "scout", "rhaven.md"))
market = {"week": g(MI, "week_of", default=""), "headline": MI.get("headline") or [], "markets": mi_markets,
          "rhaven": "Rhaven feed: coming" if rh_on else "Rhaven reporting plugs in once Cody connects it",
          "caveats": MI.get("caveats") or []}

rc = md_sections(text("marketing/recap.md"))
res_ = " ".join(plain(l) for l in rc.get("_top", []) if l.strip() and not l.startswith("#"))
rc_wait = md_table(rc.get("Waiting on approval (all QC publish, all pending)", []) or next((v for k, v in rc.items() if k.startswith("Waiting")), []))
rc_note = " ".join(plain(l) for k, v in rc.items() if k.startswith("Waiting") for l in v if l.startswith("Note"))
marketing = {
    "result": re.sub(r"^Result:\s*", "", res_),
    "out": md_bullets(next((v for k, v in rc.items() if k.startswith("What went out")), [])),
    "wait": [{"draft": plain(r[0]).strip('"'), "acct": plain(r[1]), "age": plain(r[3])} for r in rc_wait if len(r) >= 4],
    "wait_note": re.sub(r"^Note:\s*", "", rc_note),
    "stalled": md_bullets(next((v for k, v in rc.items() if k.startswith("What stalled")), [])),
}

ROT = load("marketing/rotation.json")
rotation = {"week": g(ROT, "week", default=""), "note": g(ROT, "note", default=""),
            "posts": [{"n": p.get("n"), "when": p.get("day_time", ""), "acct": p.get("account", ""), "title": p.get("title", ""),
                       "hook": p.get("hook", ""), "src": p.get("source", ""), "url": p.get("url"),
                       "status": p.get("status", "DRAFT, needs Kev\u2019s yes")} for p in (ROT.get("posts") or [])]}

lr = md_sections(text("marketing/linkedin-reports.md"))
pp = md_sections(text("marketing/page-plan.md"))
lr_top = " ".join(plain(l) for l in lr.get("_top", []) if l.strip() and not l.startswith("#"))
linkedin = {
    "exports": [{"n": k.split(":")[0], "what": k.split(":", 1)[-1].strip()} for k in lr if k.startswith("Export")],
    "files": [[plain(c) for c in r] for r in md_table(next((v for k, v in lr.items() if k.startswith("File names")), []))],
    "who": next((plain(l) for l in lr.get("_top", []) if l.startswith("**Who")), ""),
    "numbers": [[plain(c) for c in r] for r in md_table(next((v for k, v in lr.items() if k.startswith("The three numbers")), []))],
    "moves": [[plain(c) for c in r] for r in md_table(next((v for k, v in pp.items() if k.startswith("Five moves")), []))],
    "when": "Fridays by 1pm MT",
    "target": [[plain(c) for c in r] for r in md_table(next((v for k, v in pp.items() if k.startswith("30-day")), []))],
}
if not linkedin["moves"]:
    warn("no page moves parsed")

# ---------------------------------------------------------------- agent WIP
def parse_md(src):
    """Return {label: [items]} from a short WIP markdown file."""
    out, cur = {}, None
    labels = [("shipped", r"^(?:\*\*|##\s*)?(shipped|built this week)"),
              ("progress", r"^(?:\*\*|##\s*)?(in progress|open asks)"),
              ("ideas", r"^(?:\*\*|##\s*)?ideas"),
              ("help", r"^(?:\*\*|##\s*)?where i (?:could|can) help")]
    for line in src.splitlines():
        s = line.strip()
        if not s or s.startswith("# "):
            continue
        hit = None
        for k, rx in labels:
            if re.match(rx, s, re.I):
                hit = k
                break
        if hit:
            cur = hit
            out.setdefault(cur, [])
            rest = re.sub(r"^(?:\*\*|##\s*)?[^:*]*?(?:\*\*|:)\s*", "", s, count=1) if (":" in s and not s.startswith("##")) else ""
            if rest and not rest.startswith("(") and len(rest) > 2:
                out[cur].append(rest)
            continue
        if cur is None:
            continue
        m = re.match(r"^(?:[-*]|\d+\.)\s+(.*)", s)
        out[cur].append(m.group(1) if m else s)
    return out


def tidy(s):
    s = re.sub(r"\*\*|`", "", s)
    s = re.sub(r"\s*Links \(repo\):.*$", "", s)
    s = re.sub(r"\s*\(each needs Kev.s yes or no\)", "", s)
    return s.strip()


def shorten(s, n=210):
    s = tidy(s)
    if len(s) <= n:
        return s
    cut = s[:n].rsplit(" ", 1)[0]
    return cut.rstrip(",;:") + "…"


def parse_inline_wip(src):
    out = {}
    for line in src.splitlines():
        m = re.match(r"^\s*[-*]\s+\*\*([^:*]+):\*\*\s*(.*)", line)
        if not m:
            continue
        lab, rest = m.group(1).lower(), m.group(2).strip()
        k = "shipped" if lab.startswith("shipped") else "progress" if lab.startswith("in progress") else "ideas" if lab.startswith("ideas") else "help" if lab.startswith("where") else None
        if not k:
            continue
        parts = re.split(r"\s*\(\d\)\s*", rest)
        parts = [x for x in parts if x.strip()]
        out[k] = [x.strip().rstrip(";") for x in parts] if k == "ideas" else re.split(r";\s+", rest) if k == "help" else [rest]
    return out


agents = []
for aid, nm, role, rel in [("dean", "Dean", "Workforce and training", "dean/wip.md"),
                           ("casey", "Casey", "Client care and the JO board", "casey/wip.md"),
                           ("scout", "Scout", "Research and lead lists", "scout/wip.md"),
                           ("jenny", "Jenny", "Comms, brand and design", "marketing/wip.md"),
                           ("q", "Q", "Command Center builder", "q/wip.md")]:
    src = text(rel) if os.path.exists(os.path.join(ROOT, rel)) else ""
    p = (parse_inline_wip(src) if aid == "jenny" else parse_md(src)) if src else {}
    if aid == "q" and not src:
        p = {"shipped": ["Spec for agents working together: ticket lead and collaborators, dotted lines on the Floor, weekly WIP cards, Radar’s QC strip, Duet feed (spec only, nothing built)"],
             "progress": ["First slice (ticket fields and dotted line) can ship Mon 16 to Fri 20 Nov, no new permission needed"],
             "ideas": ["Pairs-this-week tally on the Floor: distinct agent pairs that shared a closed ticket", "Radar’s QC strip: open tickets and open team requests as hard rules"],
             "help": ["Radar adopts the runner rules for collaborators and hand-offs", "q-qa checks the merged tree"]}
    agents.append({"id": aid, "name": nm, "role": role,
                   "shipped": [shorten(x) for x in p.get("shipped", [])][:3],
                   "progress": [shorten(x) for x in p.get("progress", [])][:4],
                   "ideas": [shorten(x, 170) for x in p.get("ideas", [])][:3],
                   "help": [shorten(x, 170) for x in p.get("help", [])][:3]})

together = {
    "lead": "Jenny", "ticket": "Friday Pipeline Review",
    "nodes": [
        {"id": "jenny", "name": "Jenny", "piece": "Design and assembly"},
        {"id": "dean", "name": "Dean", "piece": "RPA flow and seven recruiter pages"},
        {"id": "casey", "name": "Casey", "piece": "JO board, depth charts, MPs and PTCs, next week"},
        {"id": "scout", "name": "Scout", "piece": "Lead gen flow, outcomes and BPO options"},
        {"id": "radar", "name": "Radar", "piece": "QC check, publish, 10:55 refresh"},
    ],
}

decisions = [
    {"who": "Kev", "q": "Lead gen exports move to BPO", "state": "Decided 13 Nov",
     "rec": "Kev\u2019s ZoomInfo rep OK\u2019d it. Scout\u2019s earlier advice (one seat, one clicker, ask about pooling) is now the fallback."},
    {"who": "Kev", "q": "Radar sends status cards to Kev\u2019s Duet session: weekday admin card Mon-Thu, Friday EOW report", "state": "Decided 13 Nov", "rec": ""},
    {"who": "Kev", "q": "Friday cards PDF and Friday check-out dropped; the Friday WIP review replaces them", "state": "Decided 13 Nov", "rec": ""},
    {"who": "Q", "q": "PTC definition for the QC strip", "rec": "Candidate presented to a client with no answer yet; name the response window."},
    {"who": "Q", "q": "Duet messages: a standing yes for Radar\u2019s recurring slots?", "rec": ""},
    {"who": "Q", "q": "Marlowe on the Floor: show on a pairing line, or only in Kev\u2019s private view?", "rec": ""},
    {"who": "Q", "q": "Sharing artifacts: approve each shipped artifact before it is shareable?", "rec": ""},
    {"who": "Q", "q": "WIP report: replaces the 3:50pm week review input, or sits beside it?", "rec": ""},
    {"who": "Casey", "q": "Confirm Crelate \u201cGo / No-Go\u201d means resume sent", "rec": ""},
    {"who": "Casey", "q": "Name a lead recruiter on the %d JOs without one; confirm or kill the 3 \u201ckill?\u201d JOs" % jos["need_lead"], "rec": ""},
]

# ---------------------------------------------------------------- QC
qc_rows = []
for r in (QC.get("rows") or []):
    light = (r.get("light") or "").lower()
    qc_rows.append({"check": r.get("check", ""), "light": light if light in ("red", "amber", "green") else "pending",
                    "line": r.get("line", "")})
if not qc_rows:
    qc_rows = [{"check": c, "light": "pending", "line": ""} for c in (
        "Finance up to date (Tally)", "Contracts awaiting signature",
        "Open PTCs and client needs", "Open tickets and team requests")]
qc = {"as_of": QC.get("as_of", ""), "rows": qc_rows, "filled": bool(QC.get("rows"))}

# ---------------------------------------------------------------- ops, travel, touch list
OPS = load("radar/ops.json")
LEAD = load("radar/leadership.json")
risk_keys = {(r["client"], r["role"], r["loc"]) for r in jo_rows if r.get("risk")}
touch = {"offer": [], "interviewing": [], "ptc": []}
for gp in grp:
    for p in gp["people"]:
        touch["interviewing"].append({"name": p["name"], "client": gp["client"], "role": gp["role"],
                                      "note": ("%sd in stage" % p["days"]) if p.get("days") is not None else ""})
for dr in depth:
    off = [p for p in dr["lanes"]["offer"]["people"]]
    for p in off:
        touch["offer"].append({"name": p["name"], "client": dr["client"], "role": dr["role"], "note": p.get("status", "")})
    if (dr["client"], dr["role"], dr["loc"]) in risk_keys:
        for p in [x for x in dr["lanes"]["ptc"]["people"] if not x["stale"]][:3]:
            touch["ptc"].append({"name": p["name"], "client": dr["client"], "role": dr["role"], "note": "PTC"})

# ---------------------------------------------------------------- DATA
DATA = {
    "meta": {"title": "Friday Pipeline Review", "date": "13 Nov 2026", "pulled": PULLED,
             "board_asof": ASOF, "partial_week": PARTIAL,
             "partial_label": "Week of %s is partial (Mon to Thu)" % datetime.date.fromisoformat(PARTIAL).strftime("%-d %b"),
             "round_table": "Round Table, 11am MT"},
    "flow": flow, "team": team, "recs": recs, "jos": jos, "intv": intv, "mpp": mpp,
    "depth": depth, "nocand": nocand_list, "leadgen": leadgen, "agents": agents,
    "together": together, "qc": qc, "decisions": decisions,
    "credits": credits if CR_ON else None, "ops": OPS or None, "travel": LEAD or None, "touch": touch, "market": market, "marketing": marketing, "rotation": rotation, "linkedin": linkedin,
}

# ---------------------------------------------------------------- relabel discreet clients
DISC = "Client · discreet"
RULES = [
    (re.compile(r"Baker(?:\s+(?:Construction|Concrete|FL))?", re.I), DISC),
    (re.compile(r"\bINL\b", re.I), DISC),
    (re.compile(r"Idaho\s+National(?:\s+Laborator(?:y|ies))?", re.I), DISC),
    (re.compile(r"Idaho\s+Falls", re.I), "location withheld"),
]
s = json.dumps(DATA, ensure_ascii=False)
for rx, rep in RULES:
    s, n = rx.subn(rep, s)
    if n:
        print("relabeled %d x %s" % (n, rx.pattern))
s = s.replace(DISC + " " + DISC, DISC)
s = s.replace("</", "<\\/")

tpl_path = os.path.join(HERE, "template.html")
with open(tpl_path, encoding="utf-8") as f:
    tpl = f.read()
assert "__DATA__" in tpl, "template has no __DATA__ placeholder"
html = tpl.replace("__DATA__", s)

# ---------------------------------------------------------------- guards
bad = re.search(r"baker|\binl\b|idaho\s+national", html, re.I)
assert not bad, "discreet client still present: %r" % (bad.group(0) if bad else "")
_nomkt = json.dumps({k: v for k, v in DATA.items() if k not in ("market", "ops")}, ensure_ascii=False)
_m = re.search(r"\$\s?\d", tpl + _nomkt)  # market intel alone may carry public project values
if _m:
    warn("dollar figure found outside #market-intel and the ops cards near %r" % (tpl + _nomkt)[max(0, _m.start() - 30):_m.end() + 30])
for pat, what in [(r"\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b", "phone number"),
                  (r"[\w.+-]+@[\w-]+\.[\w.]+", "email address")]:
    m = re.search(pat, html)
    if m:
        warn("%s found in output near %r" % (what, html[max(0, m.start() - 30):m.end() + 30]))

out = os.path.join(HERE, "review.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print("wrote %s (%d bytes); depth cards %d, no-candidate JOs %d, warnings %d" % (
    out, len(html), len(depth), len(nocand_list), len(WARN)))
