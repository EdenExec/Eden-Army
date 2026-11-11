# 1099 partner sheet: available job orders (Kev, 5 Nov 2026)

Kev: "Partners can see names, they'll sign NDAs. They could get a print out of all available job orders."

**What it is:** a one-page PDF (more pages if needed) listing every open JO flagged **1099** (`partner_share: true`) on the Team Hub board, grouped by client. Each row shows role, location, Eden contact (the lead recruiter), date opened, a HOT tag, and an optional `partner_note`. Terms box at the top: confidential under NDA, submit through Eden, never contact the client directly, split per the signed agreement.

**What never prints:** board notes, conditions, lead sheets, depth charts, candidate names, pay or fees, client contacts' names.

**How it runs**
1. After the JO sync, Casey exports the board: `ArtifactData query jobs where status == active` → JSON.
2. `python3 projects/team-hub/partner-board/build.py jobs.json --out <dir>` builds the PDF with Chrome headless, using the static Montserrat fonts from `workshop/submittal/fonts`.
3. The PDF goes to Kev to review. Before anything reaches a partner: Kev's yes as a QC item, plus a signed NDA and split agreement on file for that partner (Vesta: signed on their side 2 Nov, Kev to countersign; Mancino, Estrem, Steve Cross: to confirm).
4. Re-run whenever the 1099 flags change. Kev sends it, or approves Jenny's cover email.

Roster (Kev, 5 Nov): Mancino, Vesta, Estrem, maybe Steve Cross (Inlet Associates), and the partners about to join.
