"""January 2027 payroll and fixed-cost cash forecast (Tally draft, unchecked).
Inputs are Kev's, 18 Nov 2026, plus Docket's Boise lease terms. Every placeholder is named in ASSUMPTIONS.
Run: python3 -I projects/finance/payroll-forecast/model.py"""
import json

MONTHS = ["2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06"]

# --- Kev's roster (gross per month) ---
VANCOUVER = {"Andrew": 4000, "Evan": 4500, "Noah": 4500}
BOISE = {"Bridger": 4500, "Nick": 10000, "Kev": 10000, "Riley": 4000, "Rex (tentative)": 4000}
SADIE_HOURS_WK = 20
SADIE_RATE = (15, 20)
SADIE_MONTHLY = lambda r: SADIE_HOURS_WK * 52 / 12 * r
VEHICLE_REIMB = 800 * 2            # Nick and Kev; non-wage ONLY under the accountable plan with a mileage log

# --- Assumptions (placeholders to confirm) ---
BURDEN = {m: 0.10 for m in MONTHS}; BURDEN["2027-01"] = 0.12   # FICA 7.65% + FUTA/SUI/PFML/workers comp; Jan front-loads FUTA/SUI
OTHER_OPEX = 10134    # QuickBooks Feb-Oct 2026 non-payroll, non-rent, non-interest, non-contractor, less LinkedIn and ZoomInfo, / 9 months. Replace with bank-rec baseline.
INVESTOR_INTEREST = 1250
C12 = 1150
LINKEDIN_Q = {"2027-03": 10000, "2027-06": 10000}              # $10K quarterly, last paid 15 Jun 2026 (next 15 Dec 2026)
VAN_RENT = {m: (1004.95 if m < "2027-04" else 2004.95) for m in MONTHS}   # $1K + $4.95 card fee; $2K from April
INTERNET = 60 + 60
BOISE_RENT = {m: (0 if m < "2027-03" else 3039.83) for m in MONTHS}       # Docket: possession 1 Jan, rent from 1 Mar 2027, Y1 $3,039.83
CONTRACTORS_YTD_RUNRATE = round(99083.59 / 9)                              # QB contract labor, 9 months with expenses
SALES_DRAWS = {"hires": 3, "draw": 3000, "start": "2027-02"}               # PLACEHOLDER; Kev said "a few"
DISTR_LOW, DISTR_HIGH = 5000, 8333                                          # per owner per month; pro rata, so x2 at Eden

OPENING_CASH = 238674     # QuickBooks 11 Nov, unverified: books have not moved since 27 Oct
KNOWN_INFLOWS = {"2026-11/12": 90000 + 19000}   # Baker ~$90K next week; Pence Kelly balance ~$19K (Kev's figures)

def run():
    rows = []
    for m in MONTHS:
        sal = sum(VANCOUVER.values()) + sum(BOISE.values()) + SADIE_MONTHLY(sum(SADIE_RATE) / 2)
        sal_lo = sum(VANCOUVER.values()) + sum(BOISE.values()) + SADIE_MONTHLY(SADIE_RATE[0])
        sal_hi = sum(VANCOUVER.values()) + sum(BOISE.values()) + SADIE_MONTHLY(SADIE_RATE[1])
        tax = sal * BURDEN[m]
        payroll_cash = sal + tax
        fixed = (VEHICLE_REIMB + VAN_RENT[m] + BOISE_RENT[m] + INTERNET + INVESTOR_INTEREST + C12
                 + LINKEDIN_Q.get(m, 0) + OTHER_OPEX)
        floor = payroll_cash + fixed
        draws = SALES_DRAWS["hires"] * SALES_DRAWS["draw"] if m >= SALES_DRAWS["start"] else 0
        rows.append(dict(month=m, gross_wages=round(sal), gross_wages_lo=round(sal_lo), gross_wages_hi=round(sal_hi),
                         employer_burden=round(tax), payroll_cash=round(payroll_cash), fixed_and_other=round(fixed),
                         floor=round(floor), contractors=CONTRACTORS_YTD_RUNRATE, sales_draws=draws,
                         distr_low=2 * DISTR_LOW, distr_high=2 * DISTR_HIGH))
    return rows

def cases(rows):
    out = {}
    out["A. Floor: W-2 payroll + burden + offices + fixed bills + other opex"] = [r["floor"] for r in rows]
    out["B. A + 1099 contractors at 2026 run-rate"] = [r["floor"] + r["contractors"] for r in rows]
    out["C. B + 3 sales draws (placeholder)"] = [r["floor"] + r["contractors"] + r["sales_draws"] for r in rows]
    out["D. C + owner distributions, low (pro rata)"] = [r["floor"] + r["contractors"] + r["sales_draws"] + r["distr_low"] for r in rows]
    out["E. C + owner distributions, high (pro rata)"] = [r["floor"] + r["contractors"] + r["sales_draws"] + r["distr_high"] for r in rows]
    return out

if __name__ == "__main__":
    rows = run(); cs = cases(rows)
    start = OPENING_CASH + sum(KNOWN_INFLOWS.values())
    print(json.dumps(rows, indent=1))
    for k, v in cs.items():
        bal = start; path = []
        for x in v: bal -= x; path.append(round(bal))
        print(k, "| monthly:", [round(x) for x in v], "| total:", round(sum(v)), "| cash path (no new billing):", path)
    print("starting cash incl known inflows:", start)
