# APA2118 Calculator — Tester 1 Guide

**Tool URL:** https://apa2118.vercel.app  
**Your scenarios:** Mid-Career FO (Scenario A) and FO Anniversary Crossing a TA Tier Change (Scenario B)  
**Total checks:** 4 — Pass 1 and Pass 2 for each scenario

You will complete four things:
1. Verify that the assumptions and formulas built into the tool are correct against the actual contract documents
2. Scenario A, Pass 1 — enter inputs, run with defaults, audit the XLSX
3. Scenario A, Pass 2 — change specific sliders, re-run, re-audit
4. Scenario B, Pass 1 and Pass 2 — repeat for a different pilot profile

**Your job is to find errors.** Assume nothing is correct until your own formulas confirm it. If you find a discrepancy — even a small one — write it down and report it. Do not assume you made a mistake. Record both numbers and let us sort it out.

---

## Task 1: Verify the Tool's Assumptions

Before testing any scenario, go through this section and cross-reference every value against the actual contract documents. Write notes on anything that does not match, seems off, or that you cannot verify.

### 1A. Pay Scale Tables

The tool uses these four pay scale tables. Verify each rate against the published contract.

**FO Hourly Rates**

| Year | CBA | DOS Jul–Dec 2026 | Jan 2027 | Jan 2028 |
|------|-----|-----------------|----------|----------|
| 1 | $57.67 | $107.28 | $115.20 | $118.54 |
| 2 | $103.07 | $142.16 | $156.49 | $161.02 |
| 3 | $110.73 | $152.74 | $171.99 | $176.98 |
| 4 | $116.99 | $161.37 | $188.40 | $193.86 |
| 5 | $123.56 | $170.43 | $199.61 | $205.40 |
| 6 | $129.24 | $178.26 | $208.13 | $214.16 |
| 7 | $135.13 | $186.39 | $211.13 | $217.26 |
| 8 | $139.19 | $191.99 | $213.01 | $219.18 |
| 9 | $144.80 | $199.72 | $214.30 | $220.50 |
| 10 | $148.39 | $204.68 | $215.67 | $221.93 |
| 11 | $151.35 | $208.76 | $216.68 | $222.96 |
| 12 | $155.61 | $214.63 | $218.14 | $224.46 |

**CA Hourly Rates**

| Year | CBA | DOS Jul–Dec 2026 | Jan 2027 | Jan 2028 |
|------|-----|-----------------|----------|----------|
| 1 | $163.29 | $225.23 | $253.78 | $261.14 |
| 2 | $171.42 | $236.44 | $259.19 | $266.70 |
| 3 | $178.27 | $245.89 | $267.79 | $275.55 |
| 4 | $185.36 | $255.67 | $284.92 | $293.17 |
| 5 | $192.76 | $265.88 | $304.22 | $313.04 |
| 6 | $198.54 | $273.85 | $306.25 | $315.13 |
| 7 | $204.49 | $282.05 | $308.28 | $317.22 |
| 8 | $210.60 | $290.48 | $312.68 | $321.74 |
| 9 | $215.85 | $297.73 | $318.76 | $327.99 |
| 10 | $221.24 | $305.15 | $324.82 | $334.23 |
| 11 | $225.65 | $311.24 | $327.71 | $337.21 |
| 12 | $232.00 | $320.00 | $345.00 | $355.00 |

Write notes: Do these rates match the contract documents exactly? Any incorrect values?

---

### 1B. Contract Parameters and Formulas

Verify each of these against the contract. Mark confirmed, incorrect, or unknown.

| Parameter | Value Used in Tool | Your Verification |
|-----------|-------------------|------------------|
| Contract start (DOS) | July 1, 2026 | |
| Jan 2027 TA tier effective date | January 1, 2027 | |
| Jan 2028 TA tier effective date | January 1, 2028 | |
| Flying line MMG | 70 hours/month | |
| Reserve MMG (CBA and TA) | 72 hours/month | |
| 401k rate on CBA | 10% of gross pay | |
| 401k rate on TA, Jul–Dec 2026 | 10% of gross pay | |
| 401k rate on TA, Jan 2027 onward | 15% of gross pay | |
| Retention accrual formula | CBA hourly rate × 85 hours × 35% | |
| Retention payout — Vote Yes | 60 days after July 1, 2026 = ~Oct 1, 2026 | |
| Retention payout — Vote No (Offer) | 60 days after offer arrival | |
| Retention payout — Vote No (JCBA) | 60 days after JCBA conclusion | |
| Longevity cap | Year 12 (no further increments) | |
| Longevity at FO-to-CA upgrade | Carries over (does not reset to year 1) | |
| Profit sharing payment months | June and November | |

**Flag anything you cannot confirm or that you believe is wrong before proceeding.**

---

### 1C. Spot Check the Tool's Language and Results Screen

Open the tool and run it with any inputs just to look around. You are not auditing math yet — you are reading the results screen and asking whether the language makes sense.

Check the following:

- On the Risk vs. Reward cards, does "if the second offer arrives" represent the gain over voting yes, or the total dollar amount? The framing should be clear.
- On the Worth the Risk card, does the explanation of how the retention bonus accrues and discounts make logical sense?
- On the Vegas Odds card, does the "Risking X to win Y" summary match the numbers shown in the risk cards above it?
- In the month-by-month table, does the 401k contribution column jump in January 2027 when you are on a Vote Yes tab? It should go from 10% to 15% of gross in that month.
- Does the tool correctly hide the XLSX download as needing a moment to load the first time you click it? This is expected — the spreadsheet library loads on demand.

Write any notes on confusing language, missing explanations, or numbers that seem inconsistent.

---

## Scenario A: Mid-Career Flying FO, No Upgrade

**What this tests:** Basic pay rate progression across all three TA tiers. Does the rate step up correctly in January 2027 and January 2028? Does the 401k jump to 15% at the right time? Does the retention bonus pay out correctly for Vote Yes?

---

### Entering the Inputs

Work through the wizard in order. Enter these values exactly:

- **Seat:** First Officer
- **Upgrade to CA:** No
- **Longevity as of July 1, 2026:** 6
- **Anniversary month:** July
- **Date of birth:** January 1, 1985
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $1,000
- **Retention bonus current balance:** $130,000
- **Investment/discount rate:** leave at default (8%)
- **Brokerage savings rate:** leave at default

On the Vote No scenario page, **write down every default slider value before touching anything.** You will need these for Pass 2.

---

### Pass 1 — Default Assumptions

After you reach the results screen, spend two minutes reading before downloading anything.

**Gut check — write down your answers:**
1. What is the "if the second offer arrives" gain shown on the first card?
2. What is the "if no offer arrives" loss on the second card?
3. Does the ratio of those two numbers make sense given what you know about how long pilots would be on CBA before a second offer?
4. On the Worth the Risk card, does it say the retention bonus pays out in approximately October 2026 for Vote Yes at $130,000? If it shows a different amount or month, note it.

Now click **Download XLSX** in the month-by-month table. Open in Excel or Google Sheets.

---

**XLSX Audit — Vote Yes Sheet**

Open the Vote Yes sheet. You will add formula columns next to the tool's calculated columns and then a difference column to catch any discrepancies.

**Column setup in your spreadsheet:**

Add a header row above row 2 if needed. Your added columns will be to the right of the tool's data.

---

**Check 1: Gross Pay**

The tool has columns for Rate (hourly) and Hours, then a Gross Pay column.

In a new column (label it "Gross Pay Check"):
```
= [Rate cell] * [Hours cell]
```
Drag this formula down the full sheet.

In the next column (label it "Gross Pay Diff"):
```
= [Gross Pay Check] - [Gross Pay from tool]
```
Drag down. Apply conditional formatting: highlight any cell that is not zero (or not within $0.50 to allow for rounding). Any highlighted cell is a discrepancy.

**Spot check these specific rows manually using the pay scale table:**
- July 2026: Should use FO year 6 DOS rate. Gross = FO year 6 DOS × 70.
- January 2027: Should use FO year 6 Jan 2027 rate. Anniversary is July, so no increment yet. Gross = FO year 6 Jan 2027 × 70.
- July 2027: Should use FO year 7 Jan 2027 rate. Anniversary fires in July 2027, incrementing from year 6 to 7. Gross = FO year 7 Jan 2027 × 70.
- January 2028: Should use FO year 7 Jan 2028 rate. Gross = FO year 7 Jan 2028 × 70.

Write down the rate the tool shows for each of these months. Look up the correct rate in the pay scale table. Do they match?

---

**Check 2: 401k Contribution**

In a new column (label it "401k Check"):
```
For rows July 2026 through December 2026:   = [Gross Pay] * 0.10
For rows January 2027 onward:               = [Gross Pay] * 0.15
```

In the next column (label it "401k Diff"):
```
= [401k Check] - [401k Contrib from tool]
```
Apply conditional formatting. Any non-zero is a discrepancy.

**Verify the step-up month specifically:** Find January 2027 in the sheet. The 401k rate should jump. If December 2026 shows 10% and January 2027 shows 15%, the tool is correct. If January 2027 still shows 10%, flag it.

---

**Check 3: Retention Bonus Accrual**

The RB Accrual column shows a monthly accrual amount for every row. For Vote Yes, the payout is fixed at $130,000 in October 2026. The accrual shown before that date is informational — it does not add to the payout.

For Vote Yes, the accrual formula uses the CBA rate (not the TA rate):
```
= [CBA rate for FO at this longevity year] * 85 * 0.35
```

In a new column (label it "RB Accrual Check"), enter the expected accrual for each pre-October 2026 row. There are only three rows (July, August, September 2026). The pilot is year 6 for all of them (anniversary is July, already reflected in starting longevity — next increment is July 2027). Look up FO year 6 CBA rate from the table and compute. Compare to the RB Accrual column.

Find October 2026. The Retention column (not RB Accrual) should show $130,000. The RB Accrual for that row should be $0 or blank (payout happened, accrual stops).

---

**Check 4: Cumulative PV**

The Cumulative PV column should be a running total of all Row PV values from the first row through the current row.

In a new column (label it "Cum PV Check"):
```
Row 2: = [Row PV for row 2]
Row 3: = [Cum PV Check row 2] + [Row PV for row 3]
(or use: = SUM($[Row PV]$2:[Row PV current row]))
```

In the next column (label it "Cum PV Diff"):
```
= [Cum PV Check] - [Cumulative PV from tool]
```
Any non-zero means the cumulative sum is diverging from the tool's value. Even a small, growing difference suggests a systematic error.

---

### Pass 2 — Aggressive Vote No Assumptions

Click **Edit Inputs** at the top of the results screen. Navigate to the Vote No scenario sliders and change:

- **Probability of second offer:** 80%
- **Second offer arrives in:** 6 months
- **Improvement above TA:** 5%
- **JCBA duration:** 18 months

Look at the results. Write down:
1. Did the Vote No Blended outcome shift meaningfully toward "Vote No looks better"? It should, because you just said the second offer is highly probable and arrives fast.
2. Is the "if the second offer arrives" gain now larger than it was in Pass 1? It should be, because a 5% improvement above TA is better than the default.
3. Is the "if no offer arrives" loss the same number as Pass 1? It should be — this scenario is unaffected by the second-offer settings.

Download the XLSX again. Open the **Vote No (Offer)** sheet.

Repeat all four formula checks (Gross Pay, 401k, RB Accrual, Cumulative PV) on this sheet.

**Additional check for Vote No (Offer):**

Find the month when the offer arrives (month 6 from July 2026 = January 2027). In that month and after, the rate should be the TA rate for that tier multiplied by 1.05 (because you set 5% above TA).

Build a check column:
```
Pre-offer rows: = CBA rate for FO year at that longevity × 70
Post-offer rows: = TA rate for FO at that longevity and tier × 1.05 × 70
```
The tier in January 2027 is the Jan 2027 tier. So the expected rate for January 2027 is: FO year 6 Jan 2027 rate × 1.05. Look up FO year 6 Jan 2027 from the table, multiply by 1.05, multiply by 70. Compare to the Gross Pay column.

---

---

## Scenario B: FO Anniversary Month Crosses the January 2027 TA Tier Change

**What this tests:** The pilot's annual longevity increment fires in November 2026 — two months before the TA tier changes to Jan 2027. The tool must correctly use the new (higher) longevity year when the Jan 2027 rates take effect. If the tool processes the tier change before the anniversary, it will use the wrong longevity year for all of January 2027 onward.

**This is the most technically specific check you will run.** The dollar difference between FO year 4 Jan 2027 ($188.40) and FO year 5 Jan 2027 ($199.61) is $11.21/hr × 70 hours × however many months = a meaningful cumulative error if it is wrong.

---

### Entering the Inputs

- **Seat:** First Officer
- **Upgrade to CA:** No
- **Longevity as of July 1, 2026:** 4
- **Anniversary month:** November
- **Date of birth:** May 1, 1990
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $1,000
- **Retention bonus current balance:** $110,000
- **Investment/discount rate:** default

Write down all Vote No slider defaults before Pass 1.

---

### Pass 1 — Default Assumptions

Read the results screen first. Then download the XLSX and open the Vote Yes sheet.

**Check 1: Rate progression — the critical path**

Find these months in the Rate column and write down exactly what the tool shows. Then look up the correct value in the pay scale table above.

| Month | Expected Longevity | Expected Tier | Correct Rate |
|-------|-------------------|---------------|-------------|
| July 2026 | 4 | DOS | FO year 4 DOS |
| October 2026 | 4 | DOS | FO year 4 DOS |
| November 2026 | 5 | DOS | FO year 5 DOS (anniversary fires) |
| December 2026 | 5 | DOS | FO year 5 DOS |
| January 2027 | 5 | Jan 2027 | FO year 5 Jan 2027 |
| November 2027 | 6 | Jan 2027 | FO year 6 Jan 2027 (second anniversary) |
| January 2028 | 6 | Jan 2028 | FO year 6 Jan 2028 |
| November 2028 | 7 | Jan 2028 | FO year 7 Jan 2028 |

**The failure you are looking for:** If January 2027 shows the FO year 4 Jan 2027 rate ($188.40) instead of the FO year 5 Jan 2027 rate ($199.61), the tool has a bug. It applied the tier change before recognizing the November anniversary.

Run all four standard checks (Gross Pay, 401k, RB Accrual, Cumulative PV) as described in Scenario A.

**RB Accrual note for this scenario:** The anniversary is November. That means the pilot starts at CBA year 4 rate in July 2026 and increments to CBA year 5 rate in November 2026. Your accrual formula column should reflect this:
```
July–October 2026: CBA rate for FO year 4 × 85 × 0.35
November 2026 – October 2027: CBA rate for FO year 5 × 85 × 0.35
November 2027 onward: CBA rate for FO year 6 × 85 × 0.35
```
For Vote Yes, the payout is $110,000 in October 2026, and accrual stops after that. Verify.

---

### Pass 2 — Long JCBA, Skeptical Pilot

Edit inputs and change:
- **Probability of second offer:** 30%
- **JCBA duration:** 36 months
- **Second offer arrival:** 20 months

Download the XLSX. Open the **Vote No (JCBA)** sheet. This pilot stays on CBA for 36 months before JCBA, then pays out ~2 months later.

Run all four checks on the Vote No (JCBA) sheet.

**Additional retention accrual audit:**

This pilot's retention balance grows for approximately 38 months (36 JCBA + 2 payout delay). Build a running balance column:

```
Starting value: $110,000
Each month: add CBA rate for current longevity × 85 × 0.35
```

Track the longevity increments in November of each year. Your running balance should accumulate across years:
- July 2026 – October 2026: FO year 4 accrual rate (4 months)
- November 2026 – October 2027: FO year 5 accrual rate (12 months)
- November 2027 – October 2028: FO year 6 accrual rate (12 months)
- November 2028 – October 2029: FO year 7 accrual rate (12 months, but JCBA ends month 36 = July 2029, payout ~Sept 2029)

Compute the expected total balance at payout. Multiply by the payout probability (check what the Vote No C slider is set to — default is 50%). Compare to what the Worth the Risk card shows as the expected retention payout.

---

## Reporting Back

Send a summary noting for each check:

1. **What you verified:** e.g., "Scenario A, Pass 1, Vote Yes, Gross Pay column"
2. **Result:** Confirmed correct / Found discrepancy
3. **If discrepancy:** Month, tool value, your formula result, difference
4. **Anything that felt wrong** even if your formula did not catch it — your contract knowledge counts

Be specific. "January 2027 shows $199.61 but I expected $188.40 based on year 4" is useful. "Something seemed off in January" is not.
