"""Turn a simple markdown doc into Google Docs batchUpdate requests for an empty letterhead copy.
Headings, bold (**x**), bullets (- x), tables become bullet lines "A: B · C". Usage: md2gdoc.py in.md out.json"""
import json, re, sys
src = open(sys.argv[1]).read()
src = re.sub(r"^---\n.*?\n---\n", "", src, flags=re.S)
paras = []  # (text, style, bullet, bolds)
def add(t, style="NORMAL_TEXT", bullet=False):
    bolds, out, i = [], "", 0
    for m in re.finditer(r"\*\*(.+?)\*\*", t):
        out += t[i:m.start()]; s = len(out); out += m.group(1); bolds.append((s, len(out))); i = m.end()
    out += t[i:]
    paras.append((out, style, bullet, bolds))
hdr = None
for line in src.splitlines():
    s = line.rstrip()
    if not s or s.startswith("<!--"):
        continue
    if s.startswith("|"):
        cells = [c.strip() for c in s.strip("|").split("|")]
        if all(re.fullmatch(r":?-{3,}:?", c) for c in cells):
            continue
        if hdr is None:
            hdr = cells; continue
        cells = [c for c in cells if c]
        if not cells: continue
        add("**" + cells[0].replace("**", "") + "**" + (": " + " · ".join(cells[1:]) if len(cells) > 1 else ""), bullet=True)
        continue
    hdr = None
    if s.startswith("# "): add(s[2:], "TITLE")
    elif s.startswith("## "): add(s[3:], "HEADING_1")
    elif s.startswith("### "): add(s[4:], "HEADING_2")
    elif s.startswith("- "): add(s[2:], bullet=True)
    else: add(s)
def u16(t): return len(t.encode("utf-16-le")) // 2
text = "".join(p[0] + "\n" for p in paras)
reqs = [{"replaceAllText": {"containsText": {"text": "Document name", "matchCase": True}, "replaceText": sys.argv[3] if len(sys.argv) > 3 else "Document"}},
        {"insertText": {"location": {"index": 1}, "text": text}}]
end = 1 + u16(text)
reqs.append({"updateTextStyle": {"range": {"startIndex": 1, "endIndex": end}, "textStyle": {"weightedFontFamily": {"fontFamily": "Montserrat", "weight": 400}, "fontSize": {"magnitude": 10.5, "unit": "PT"}}, "fields": "weightedFontFamily,fontSize"}})
reqs.append({"updateParagraphStyle": {"range": {"startIndex": 1, "endIndex": end}, "paragraphStyle": {"spaceBelow": {"magnitude": 6, "unit": "PT"}}, "fields": "spaceBelow"}})
runs = []
idx = 1
sizes = {"TITLE": 22, "HEADING_1": 14, "HEADING_2": 12}
for t, style, bullet, bolds in paras:
    n = u16(t); a, b = idx, idx + n + 1
    if style != "NORMAL_TEXT":
        reqs.append({"updateParagraphStyle": {"range": {"startIndex": a, "endIndex": b}, "paragraphStyle": {"namedStyleType": style}, "fields": "namedStyleType"}})
        reqs.append({"updateTextStyle": {"range": {"startIndex": a, "endIndex": a + n}, "textStyle": {"bold": style != "TITLE", "fontSize": {"magnitude": sizes[style], "unit": "PT"}, "weightedFontFamily": {"fontFamily": "Montserrat", "weight": 600 if style != "TITLE" else 400}}, "fields": "bold,fontSize,weightedFontFamily"}})
    for s0, s1 in bolds:
        reqs.append({"updateTextStyle": {"range": {"startIndex": a + u16(t[:s0]), "endIndex": a + u16(t[:s1])}, "textStyle": {"bold": True}, "fields": "bold"}})
    if bullet:
        if runs and runs[-1][1] == a: runs[-1][1] = b
        else: runs.append([a, b])
    idx = b
for a, b in runs:
    reqs.append({"createParagraphBullets": {"range": {"startIndex": a, "endIndex": b}, "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"}})
json.dump(reqs, open(sys.argv[2], "w"))
print(len(reqs), "requests,", len(json.dumps(reqs)), "bytes,", len(paras), "paragraphs")
