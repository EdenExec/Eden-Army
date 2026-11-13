"""Merge one person's Friday scorecard answers into their Round Table card.

python3 -I compile.py <weeks.json> <candor.json or -> <card.json or -> <out.json>

weeks.json  : the scorecard page's weeks/<weekOf> document (ArtifactData get, data only)
candor.json : the page's candor/<uid> document; only <weekOf>.burnout is used
card.json   : the Round Table's people/<slug>/cards/<weekOf> document as it stands ("-" if none)
out.json    : the fields to write back with ArtifactData update/set (pin if_version to the card read)

Rules (Kev, 13 Nov 2026): fill the recruiter's side and the boxes so Kev opens a filled card.
Never touch Kev's coach fields. Boxes are copied only where the card has none ticked yet,
so a box Kev already tapped is never overwritten. Text fields Kev or the recruiter already
wrote on the card are kept, with the survey text added below a divider.
"""
import json, sys

RATE = ["Poor", "Fine", "Good", "Excellent"]
WEEKLY = ["Audit your inventory", "Build your own book", "Autopsy your week", "Grew toward my next role",
          "Replied in a timely manner", "Took training seriously", "Sharp all week", "Push your job orders forward"]
COACH = {"kev_score", "coach_notes", "needs", "advice", "pip", "pip_reason"}


def load(p):
    if p == "-":
        return {}
    d = json.load(open(p))
    return d.get("data", d) if isinstance(d, dict) else {}


def lines(*parts):
    return "\n".join(p.strip() for p in parts if p and str(p).strip())


def merge_text(old, new):
    old, new = (old or "").strip(), (new or "").strip()
    if not new or new in old:
        return old
    return new if not old else old + "\n— from the scorecard —\n" + new


def main():
    a, cand, card, out = load(sys.argv[1]), load(sys.argv[2]), load(sys.argv[3]), sys.argv[4]
    week = a.get("week_of")
    c = (cand.get(week) or {}) if week else {}
    upd = {}

    wr = a.get("wr") or []
    ratings = ", ".join(f"{WEEKLY[i]} {RATE[v]}" for i, v in enumerate(wr) if v is not None)
    summary = lines(
        f"Self score {a['self_score']}%" if a.get("self_score") is not None else "",
        f"10-5-3-1 alignment {a['align']}/5" if a.get("align") else "",
        f"Must Dos: {ratings}" if ratings else "",
        f"Numbers check: {a['numbers_note']}" if a.get("numbers_note") else "",
    )
    wins = lines(a.get("wins"), f"Got better: {a['grew']}" if a.get("grew") else "",
                 f"Talk about: {a['prospect']}" if a.get("prospect") else "", summary)
    lived = lines(a.get("lived_out"), f"Nominates: {a['nominee']}" if a.get("nominee") else "")
    nxt = lines(a.get("next_week"), f"WIP to follow up: {a['wip']}" if a.get("wip") else "",
                f"JOs: {a['jos']}" if a.get("jos") else "")
    for key, val in (("wins", wins), ("lived_out", lived), ("autopsy", a.get("autopsy")), ("next_week", nxt)):
        merged = merge_text(card.get(key), val)
        if merged != (card.get(key) or ""):
            upd[key] = merged
    if c.get("burnout") is not None and card.get("burnout") is None:
        upd["burnout"] = c["burnout"]

    for key, n in (("d", 35), ("w", 8), ("cv", 21)):
        src = (a.get(key) or [])[:n]
        if any(src) and not any(card.get(key) or []):
            upd[key] = [bool(x) for x in src] + [False] * (n - len(src))
    if any(k in upd for k in ("d", "w")):
        d = upd.get("d", card.get("d") or [])
        w = upd.get("w", card.get("w") or [])
        upd["boxes"] = sum(bool(x) for x in d) + sum(bool(x) for x in w)

    assert not (COACH & set(upd)), "never write Kev's coach fields"
    if upd:
        upd["week_of"] = card.get("week_of") or week
        upd["survey_compiled"] = True
    json.dump(upd, open(out, "w"), indent=1)
    print(f"{len(upd)} fields:", ", ".join(sorted(upd)) or "nothing to write")


if __name__ == "__main__":
    main()
