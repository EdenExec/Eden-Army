# Payroll and fixed-cost forecast, Jan to Jun 2027 (Tally draft, UNCHECKED)

Status: first pass for Kev, 18 Nov 2026. Not through the numbers gate. Do not share outside Eden until Docket has checked it and Kev has confirmed the open inputs.
Model: `model.py` (inputs at the top; run with `python3 -I model.py`). Part of "project cash pulse": this feeds a payroll-runway section on the EPG Cash Pulse once confirmed.

## Monthly cash cost (rounded)

| Month | W-2 gross wages | Employer burden | Payroll cash | Offices, fixed bills, other | Floor (A) |
|---|---:|---:|---:|---:|---:|
| Jan | 47,017 | 5,642 | 52,659 | 15,259 | 67,918 |
| Feb | 47,017 | 4,702 | 51,718 | 15,259 | 66,977 |
| Mar | 47,017 | 4,702 | 51,718 | 28,299 | 80,017 |
| Apr | 47,017 | 4,702 | 51,718 | 19,299 | 71,017 |
| May | 47,017 | 4,702 | 51,718 | 19,299 | 71,017 |
| Jun | 47,017 | 4,702 | 51,718 | 29,299 | 81,017 |

March and June jump on the $10K quarterly LinkedIn payment; March also starts Boise rent; April doubles Vancouver rent.

## Layers on top of the floor (per month)
- B: remaining 1099 contractors. Evan and Bridger move to W-2 in January and Max left mid-Nov, so none are listed yet (2026 run-rate was about $11K/mo, before those changes). Joel Gaines and others still to be listed.
- C: sales hires on a $4,000/mo draw for a 90-day training period ($12,000 per hire, Kev 18 Nov). Three hires starting February is a PLACEHOLDER ($12K/mo for three months).
- D / E: owner distributions, pro rata for Kev and Nick: $10.0K/mo (low) or $16.7K/mo (high) in total.

Total monthly cash out: floor about $67K to $81K; with three draw hires about $67K to $92K; with owner distributions about $77K to $109K.

## What the roster assumes
- Vancouver W-2: Andrew 4,000, Evan 4,500, Noah 4,500. Boise: Bridger 4,500, Nick 10,000, Kev 10,000, Riley 4,000, Rex 4,000 (tentative). Sadie 20 hr/wk at $15-20 (about $1,300-1,733/mo; midpoint used).
- Vehicles $800 x 2 are treated as reimbursements, not wages. That holds only under the accountable plan with a mileage log; a flat $800 with no log is taxable wages and adds payroll tax.
- Employer burden 10% (12% in January for FUTA and SUI front-loading): placeholder for Gusto and Chris to confirm. Health insurance and other benefits are not included.
- Vancouver rent $1,000 plus the $4.95 card fee, $2,000 from April; internet $60 per office from January.
- Boise rent per Docket's lease read: possession 1 Jan 2027, rent from 1 Mar 2027, $3,039.83 a month in year 1 (Kev quoted about $3,100). $6,079.66 due at signing (first month plus deposit): when and whether it is paid is open.
- Other operating cost about $10.1K a month from QuickBooks Feb to Oct, to be replaced with the bank-rec baseline.
- Also fixed: investor interest $1,250 and C12 $1,150 a month.

## Not in the numbers yet (open)
- Nov and Dec spend, and Dec payroll run-rate (cash path below starts 1 Jan, so it is overstated).
- Opening cash. QuickBooks shows $238,674 but has not moved since 27 Oct. Baker $90K and Pence Kelly about $19K are not yet received.
- Owner tax account funding: federal Q4 estimate due 15 Jan, then 15 Apr.
- Revenue and Hub pipeline (starts, receivables). This is cost only.
- Health insurance, workers comp quotes (WA L&I, Idaho), Idaho and WA unemployment accounts, Gusto fees.
