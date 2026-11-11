#!/usr/bin/env python3
"""Build the 1099 partner sheet: every open JO flagged partner_share on the Team Hub, as one printable PDF.

Kev, 5 Nov 2026: partners can see client names (they sign NDAs) and can get a printout of all
available job orders. Input is a JSON list of jobs/{id} docs exported from the Hub (id, client,
role, location, opened, rank, team, partner_share, status, partner_note). Only active JOs with
partner_share true are printed. Internal fields (board_note, condition, leads, depth, pay) never print.

  python3 build.py jobs.json --out out/ [--draft "label"]
"""
import argparse, datetime, html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', '..', '..', 'workshop', 'submittal', 'fonts')
CHROME = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'

def esc(s): return html.escape(str(s or ''), quote=True)

def lead(j):
    for p in j.get('team') or []:
        if (p.get('role_on_job') or '') not in ('standby', 'backup') and p.get('recruiter'):
            return p['recruiter']
    return 'Kev'

def build(jobs, draft=None, today=None):
    today = today or datetime.date.today()
    rows = [j for j in jobs if j.get('partner_share') is True and (j.get('status') or 'active') == 'active']
    rows.sort(key=lambda j: (str(j.get('client') or '').lower(), float(j.get('rank') or 999), str(j.get('role') or '')))
    groups = {}
    for j in rows: groups.setdefault(j.get('client') or 'Client to confirm', []).append(j)
    font = lambda w, f: f"@font-face{{font-family:'Montserrat';font-weight:{w};src:url('file://{os.path.abspath(os.path.join(FONTS, f))}') format('woff2')}}"
    css = '\n'.join([font(400, 'montserrat-latin-400-normal.woff2'), font(600, 'montserrat-latin-600-normal.woff2'),
                     font(700, 'montserrat-latin-700-normal.woff2'), font(800, 'montserrat-latin-800-normal.woff2')]) + """
@page{size:Letter;margin:.55in .6in .7in}
*{box-sizing:border-box}
body{margin:0;font-family:'Montserrat','Helvetica Neue',Arial,sans-serif;color:#1A1A1A;font-size:10pt;line-height:1.4}
.brand{font-size:8pt;letter-spacing:3px;text-transform:uppercase;color:#8F6F3E;font-weight:600}
h1{font-size:20pt;font-weight:800;text-transform:uppercase;letter-spacing:-.3px;margin:4px 0 2px}
.sub{color:#6F695D;font-size:9pt;margin:0}
.rule{height:1.5px;background:linear-gradient(to right,#8F6F3E 0%,#EAE4D8 18%);margin:10px 0 14px}
.draft{border:1.5px dashed #8A6A1F;color:#8A6A1F;background:#F3EAD0;font-weight:700;font-size:8.5pt;letter-spacing:1px;text-transform:uppercase;padding:6px 10px;margin:0 0 12px}
.terms{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;font-size:8.5pt;color:#3A362F;background:#FAF8F4;border:1px solid #EAE4D8;padding:9px 12px;margin:0 0 16px}
.terms b{color:#1A1A1A}
h2{font-size:11pt;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin:14px 0 4px;padding-bottom:3px;border-bottom:1.5px solid #8F6F3E;break-after:avoid}
table{width:100%;border-collapse:collapse}
th{white-space:nowrap;font-size:7.5pt;letter-spacing:1.2px;text-transform:uppercase;color:#6F695D;font-weight:600;text-align:left;padding:5px 6px;border-bottom:1px solid #EAE4D8}
td{padding:6px;border-bottom:1px solid #EAE4D8;vertical-align:top}
tr{break-inside:avoid}
td.role b{font-weight:700}
td.role small{display:block;color:#6F695D;font-size:8.5pt;margin-top:2px}
td.num{white-space:nowrap;color:#6F695D;font-size:8.5pt}
.hot{display:inline-block;background:#1A1A1A;color:#fff;font-size:7pt;font-weight:700;letter-spacing:1px;padding:1px 5px;margin-left:6px;vertical-align:1px}
.empty{border:1px dashed #EAE4D8;padding:14px;color:#6F695D}
.foot{margin-top:18px;padding-top:8px;border-top:1px solid #EAE4D8;font-size:7.5pt;letter-spacing:1px;text-transform:uppercase;color:#6F695D;display:flex;justify-content:space-between}
"""
    body = []
    body.append('<div class="brand">Eden Partner Group</div><h1>Available job orders</h1>')
    body.append(f'<p class="sub">For Eden\'s 1099 split partners · {today.strftime("%-d %B %Y")} · {len(rows)} open job order{"" if len(rows)==1 else "s"} across {len(groups)} client{"" if len(groups)==1 else "s"}</p><div class="rule"></div>')
    if draft: body.append(f'<div class="draft">Draft · {esc(draft)} · not for partners yet</div>')
    body.append('<div class="terms"><div><b>Confidential.</b> Shared under your NDA with Eden. Do not forward or post.</div>'
                '<div><b>Submit through Eden.</b> Send every candidate to your Eden contact first. Never contact the client directly.</div>'
                '<div><b>Split terms</b> follow your signed split partner agreement.</div>'
                '<div><b>Before you send a candidate,</b> confirm with your Eden contact that the role is still open.</div></div>')
    if not rows:
        body.append('<div class="empty">No job orders are flagged for partners yet.</div>')
    for client, js in groups.items():
        body.append(f'<h2>{esc(client)}</h2><table><thead><tr><th style="width:48%">Role</th><th style="width:24%">Location</th><th>Eden contact</th><th>Opened</th></tr></thead><tbody>')
        for j in js:
            note = j.get('partner_note') or ''
            body.append('<tr><td class="role"><b>' + esc(j.get('role')) + '</b>' + ('<span class="hot">HOT</span>' if j.get('hot') else '') +
                        (f'<small>{esc(note)}</small>' if note else '') + '</td><td>' + esc(j.get('location') or 'Location to confirm') +
                        '</td><td>' + esc(lead(j)) + '</td><td class="num">' + esc(j.get('opened') or '') + '</td></tr>')
        body.append('</tbody></table>')
    body.append('<div class="foot"><span>Eden Partner Group · Confidential · Under NDA</span><span>edenpartnergroup.com</span></div>')
    return f'<!doctype html><html><head><meta charset="utf-8"><title>Eden available job orders</title><style>{css}</style></head><body>{"".join(body)}</body></html>', len(rows)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('jobs'); ap.add_argument('--out', default='out'); ap.add_argument('--draft')
    a = ap.parse_args()
    jobs = json.load(open(a.jobs))
    jobs = [dict(j.get('data', j), id=j.get('id', j.get('data', {}).get('id'))) for j in jobs]
    page, n = build(jobs, a.draft)
    os.makedirs(a.out, exist_ok=True)
    stamp = datetime.date.today().isoformat()
    h = os.path.join(a.out, f'eden-available-jos-{stamp}.html'); p = h[:-5] + '.pdf'
    open(h, 'w').write(page)
    subprocess.run([CHROME, '--headless', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={p}', 'file://' + os.path.abspath(h)], check=True, capture_output=True)
    print(f'{n} job orders -> {p}')
    print('REVIEW BEFORE IT GOES TO PARTNERS: Kev reads every role, client and name; partners must have a signed NDA and split agreement.')

if __name__ == '__main__':
    main()
