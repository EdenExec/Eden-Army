---
title: Hub Partners Tab
subtitle: How 1099 partners get in and what they see
org: epg
author: Scout for Kev Williams
date: 2026-11-19
---

## Result

The Partners tab serves two kinds of 1099 recruiter from one client-blind weekly JO list. Close partners sign in. Arm's-length partners use a personal PIN. Neither tier ever sees a client name, a fee, a phone number or an email. Status: draft for Kev; seed data in `scout-partners.json` (16 roles).

## Access tiers

| Tier | Who | How in | Sees |
|---|---|---|---|
| Close | 1099ers Kev works with daily | claude.ai login (Kev's yes already given for team logins), role `partner` in the Hub roles doc | Home, Training, Partners tab only |
| Arm's-length | Occasional partners | One unique PIN per person, issued by Kev | The weekly JO list and its lead-list links; nothing else |

- Close partners never see recruiting boards, tickets or President. `partner` is a fifth role beside president, admin, recruiter, intern.
- A PIN per person (not one shared PIN) lets Kev rotate or revoke one partner and see who opened the list.
- Roles and PINs are edited only in Kev's Settings panel.

## What a partner sees

- **Weekly JO list.** Reference code, title, market, sector, level, priority, one-line pitch, three must-haves, and the blind descriptor ("National general contractor, South Florida high-rise"). Same fields and reword rules as `projects/partners/open-roles/build.py`; the Hub reads that data, it does not fork it.
- **Never shown:** client or project names (BLOCKED_NAMES list), pay, fees, splits, Eden owners, candidates, rows marked review or closed.
- **Split terms:** every role carries "Kev to set". Until Kev fills it, the tab says "Eden's standard split terms apply", as the open-roles page does.
- **Submit:** partners quote the EPG code to their Eden contact. v1 has no submit form (nothing is sent from the Hub).

## The lead-list link

Each role may carry one link to a Google Sheet "Partner lead list" that opens without an Eden email. It is a derived copy, never the internal sheet.

| Rule | Why |
|---|---|
| Built from the internal sheet at the landed stage (`projects/leads/`), then Mobile, Mobile source, Crelate owner and status, Owner and Suggested owner columns are stripped | No phones (ZoomInfo or Crelate) on shared sheets |
| Titled and named by EPG code ("EPG-017 lead list"), never by client | Client-blind; internal titles carry the client |
| Columns kept: Tier, Name, Title, Company, Company type, City, State, Time Zone, LinkedIn, Fit note | Public-professional facts only |
| Discreet-client and "referral ask only" sheets are never published to partners | Matches the BPO SOP |
| Lives in its own Drive folder, not the Leads Buckets folder; never touches the Lead Log or Crelate bucket flow | The BPO / lead-log pipeline stays untouched |
| Dedupe against Crelate is done before publishing; partners cannot see Crelate status | Avoids exposing who is already in the book |

Partner-submitted names are not loaded into Crelate by the Hub; a recruiter does that after QC.

Open question: partners who work a lead list will reach the same people as Eden recruiters. Kev decides whether a partner "claims" a name (a plain claim sheet by EPG code is the simplest).

## The PIN, honestly

An artifact page is code the viewer's browser downloads. Anything the page can check, a determined viewer can read.

- **What a PIN protects:** against casual forwarding and guessing; it identifies the partner and can be rotated per person.
- **What it cannot protect:** if the JO list is in the page source, a PIN check in JavaScript is a speed bump, not a lock. View-source bypasses it.
- **A private artifact needs a claude.ai login.** Arm's-length partners have none, so the PIN gate cannot sit inside the private Hub. The Hub's PIN tab would only show the partner a link to the separate artifact below.

**Recommended (simplest safe): a separate "Eden Partner Roles" artifact**, link-shared, whose JO data is encrypted in the page with a key derived from the PIN (WebCrypto, AES-GCM). Without the PIN the source holds only ciphertext. Use an 8-character PIN (not 4 digits, which can be brute-forced offline in seconds). One encrypted blob per partner; Q re-issues the file weekly.

**Fallback (weaker, easy):** the same page with a hashed PIN check. Honest label: a courtesy gate.

**Why it is still acceptable:** the content is client-blind, with no pay, names or contact data. Worst case a PIN leaks a list of anonymous roles. The real protection is the content rules above, not the PIN.

## Kev must decide

1. **Sharing.** Changing the partner artifact to link-shared is Kev's action, not ours. Nothing is shared tonight.
2. **PIN delivery.** Who tells each partner their PIN, and how (not email from the Hub; no sending).
3. **Split terms.** Per-role or one standard split, and whether the number is ever shown.
4. **Who counts as close.** The list of close partners needing a login.
5. **Lead-list claims.** Whether partners claim names, and the rule if two partners touch the same person.
6. **Freshness.** The open-roles build is a draft as of 13 Nov, and `build.py` still reads from a scratchpad deck. Refresh and mark final before partners see anything.

## What is wired and what is not

- Wired: client-blind role data (seed JSON), blind-check rules.
- Placeholder: PINs, partner role, lead-list links (`lead_list_url` null until a sheet is built), split terms.
- Spend: none. No ZoomInfo credits used.
