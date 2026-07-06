# APA2118 Calculator — Tester 3 Guide

**Tool URL:** https://apa2118.vercel.app  
**Your scenarios:** Senior CA Approaching the Longevity Cap (Scenario A) and Long JCBA Retention Accrual Across Multiple Longevity Years (Scenario B)  
**Total checks:** 4 — Pass 1 and Pass 2 for each scenario

You will complete four things:
1. Verify the assumptions and formulas built into the tool against the actual contract documents
2. Scenario A, Pass 1 — enter inputs, run with defaults, audit the XLSX
3. Scenario A, Pass 2 — change the investment/discount rate to 11% and adjust Vote No sliders, re-run, re-audit
4. Scenario B, Pass 1 and Pass 2 — repeat for a different pilot profile

Your scenarios are the most retention-heavy of the three testers. Scenario A tests whether the longevity cap works correctly for a senior CA. Scenario B puts the retention accrual formula under maximum stress — a long JCBA where the pilot increments through multiple longevity years before the payout fires.

**Your job is to find errors.** If you find a discrepancy, write down both numbers and report it. Do not assume you made a mistake.

---

## Task 1: Verify the Tool's Assumptions

Before testing any scenario, verify every value below against the actual contract documents. Write notes on anything that does not match, that you cannot confirm, or that you believe is wrong.

### 1A. Pay Scale Tables

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

Write notes: Do these rates match the contract documents exactly? Pay particular attention to the CA year 12 values — these are the rates your Scenario A pilot will live at for most of the pre-JCBA period.

---

### 1B. Contract Parameters and Formulas

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
| Longevity cap | Year 12 (no further increments after this) | |
| Longevity at FO-to-CA upgrade | Carries over | |
| Profit sharing payment months | June and November | |

**The retention accrual formula is the core of Scenario B.** The tool computes it as: CBA hourly rate × 85 hours × 35%. That is the CBA rate, not the TA rate, regardless of which scenario you are looking at. If the contract specifies a different number of hours or a different accrual percentage, every retention calculation in the tool is wrong. Confirm this before proceeding.

---

### 1C. Spot Check the Tool's Language and Results Screen

Open the tool and run it with any inputs. Read the results screen and write notes on the following:

- On the Worth the Risk card, does the retention bonus explanation accurately describe both the accrual (for Vote No) and the fixed payout (for Vote Yes)?
- Does the card show the retention payout discounted back to today's dollars at the investment rate? It should show both the nominal payout amount and a discounted present value.
- Does the Vegas Odds "Risking X to win Y" framing make sense? The "risk" is the amount you would be behind versus voting yes if no second offer arrives. The "reward" is the amount you would be ahead if a second offer arrives.
- In the month-by-month table, does the Retention Bonus Tracker section at the bottom of the page show a month-by-month accrual table? This is a separate expanded view distinct from the main table. Check that it appears and shows accrual building over time.
- Does the tool's language anywhere overstate certainty about the retention bonus payout? For Vote No scenarios, payout is not guaranteed. The tool uses a probability slider — verify this is clearly communicated on the results screen.

Write any notes on language, clarity, or numbers that do not seem right.

---

## Scenario A: Senior CA at the Longevity Cap

**What this tests:** A CA who hits year 12 (the longevity cap) one month after the contract starts. From that point on, the rate must not increase due to longevity — the only rate changes should be the TA tier steps in January 2027 and January 2028. If the tool continues incrementing past year 12, it is using fictional pay rates for the rest of this pilot's career.

This matters especially for senior pilots with large retention balances, because it affects both their gross pay and their monthly retention accrual amount.

---

### Entering the Inputs

- **Seat:** Captain
- **Longevity as of July 1, 2026:** 11
- **Anniversary month:** September
- **Date of birth:** January 1, 1970
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $2,000
- **Retention bonus current balance:** $250,000
- **Investment/discount rate:** default

Write down all Vote No slider defaults before Pass 1.

---

### Pass 1 — Default Assumptions

Read the results screen before downloading. Write down:
1. What is the "if the second offer arrives" gain? For a senior CA with high pay, this number should be substantial (or negative, meaning even with a second offer the delay on CBA doesn't pay off at this pay level).
2. Does the Worth the Risk card show the Vote Yes retention payout at $250,000 in October 2026?
3. Does the cumulative chart show a flat, steady trajectory — this pilot is at or near the pay scale ceiling, so there should not be large step-ups from longevity.

Download the XLSX. Open the Vote Yes sheet.

---

**XLSX Audit — The Cap Check**

Set up the diff column approach for all checks. Each check has a "Formula" column and a "Diff" column. Apply conditional formatting to the Diff column to highlight any non-zero cell.

---

**Check 1: Gross Pay — Verify the Cap Holds**

Build Gross Pay check:
```
= Rate × Hours (70 for flying line)
```
Diff column:
```
= Gross Pay Check - Gross Pay (tool)
```

Now manually verify the specific rows where the cap boundary crosses:

| Month | Expected Longevity | Expected Tier | Correct Rate |
|-------|-------------------|---------------|-------------|
| July 2026 | 11 | DOS | CA year 11 DOS |
| August 2026 | 11 | DOS | CA year 11 DOS |
| September 2026 | 12 | DOS | CA year 12 DOS (anniversary fires — increments to cap) |
| October 2026 | 12 | DOS | CA year 12 DOS |
| January 2027 | 12 | Jan 2027 | CA year 12 Jan 2027 |
| September 2027 | 12 | Jan 2027 | CA year 12 Jan 2027 — **must not change** |
| January 2028 | 12 | Jan 2028 | CA year 12 Jan 2028 |
| September 2028 | 12 | Jan 2028 | CA year 12 Jan 2028 — **must not change** |
| September 2029 | 12 | Jan 2028 | CA year 12 Jan 2028 — **must not change** |
| September 2030 | 12 | Jan 2028 | CA year 12 Jan 2028 — **must not change** |

Look up CA year 12 values in the pay scale table. Write down what the tool shows in September of 2027, 2028, 2029, 2030. If any of these years shows a rate higher than CA year 12 Jan 2028 ($355.00/hr), the cap is broken and a fictional year 13, 14, etc. is being used.

---

**Check 2: 401k Contribution**

```
Jul–Dec 2026: = Gross Pay × 0.10
Jan 2027 onward: = Gross Pay × 0.15
```
Diff column, conditional formatting.

A senior CA at year 12 earns $320.00/hr × 70 hrs = $22,400/month. The 401k should jump from $2,240/month to $3,360/month in January 2027. Spot-check December 2026 and January 2027 specifically.

---

**Check 3: Retention Bonus — Vote Yes**

Payout is $250,000 in October 2026. Verify the Retention column shows this. After October 2026, the RB Accrual column should be zero.

Before October 2026 (July, August, September 2026):

For July and August: pilot is CA year 11 on CBA. Accrual formula:
```
= CA year 11 CBA rate × 85 × 0.35
```

For September 2026: anniversary fires, pilot increments to year 12. If the payout fires first (October) and the September accrual is the last pre-payout entry, the accrual in September should use the new year 12 CBA rate:
```
= CA year 12 CBA rate × 85 × 0.35
```

Build a check column with the correct expected value for each of July, August, September 2026. Compare to the RB Accrual column.

---

**Check 4: Cumulative PV Running Sum**

```
= SUM($[Row PV]$[first row] : [Row PV current row])
```
Diff column, conditional formatting.

---

### Pass 2 — Vote No, Long Timeline, Low Confidence in Payout

Edit inputs and change:
- **Investment/discount rate:** change from default **8%** to **11%**
- **Probability of second offer:** 20%
- **JCBA duration:** 36 months
- **Second offer arrival:** 24 months
- **Payout probability if no offer:** 35%

This pilot is on CBA rates for 36 months before JCBA. Their retention accrues the whole time. With a high starting balance ($250,000) and a long accrual period, the retention amount on Vote No will be significantly larger than $250,000 by payout.

Download the XLSX. Open the **Vote No (JCBA)** sheet.

Run all four checks on this sheet.

**Additional retention audit:**

In Vote No scenarios, the retention keeps accruing. Build a running balance column:
```
Starting value: $250,000
Each month: add CBA rate for current longevity × 85 × 0.35
```

For this pilot: longevity is 11 in July and August 2026, then caps at 12 in September 2026. After that, every month uses the CA year 12 CBA rate ($232.00/hr) for accrual:
```
Monthly accrual from September 2026 onward: $232.00 × 85 × 0.35 = (compute this)
```
The total accrual runs for approximately 38 months (36 JCBA + 2 months to payout). Compute the expected final balance and compare to the Retention column in the payout row.

Multiply the final balance by 35% (the payout probability you set). Compare to what the Worth the Risk card shows as the expected retention payout. Confirm the card's discounted present-value figure reflects 11% discounting, not the 8% from Pass 1.

---

---

## Scenario B: Long JCBA — Retention Accrual Across Multiple Longevity Increments

**What this tests:** An FO on Vote No (No Offer) stays on CBA rates for a 36-month JCBA. During that time, their annual longevity increment fires three times, incrementing the CBA rate used in the accrual formula. The tool must update the accrual amount each time. If it locks in the year-1 CBA rate for all 36 months, the accrual is systematically understated. If it uses the TA rate instead of the CBA rate, it is overstated.

This scenario also tests the tool under a deliberately long timeline to surface any compounding errors.

---

### Entering the Inputs

- **Seat:** First Officer
- **Upgrade to CA:** No
- **Longevity as of July 1, 2026:** 5
- **Anniversary month:** June
- **Date of birth:** December 1, 1988
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $1,000
- **Retention bonus current balance:** $130,000
- **Investment/discount rate:** default

Write down all Vote No slider defaults before Pass 1.

---

### Pass 1 — Default Assumptions (29-month JCBA)

Read the results screen. Write down:
1. Does the Worth the Risk card describe the retention bonus growing beyond $130,000 for Vote No? It should, because the pilot accrues for ~31 months before payout.
2. Does the expected payout shown on the Worth the Risk card (at 50% probability) feel roughly correct? You can sanity-check: approximately 29 months of accrual at FO year 5-7 CBA rates of $123–$135/hr × 85 × 35% ≈ $3,600–$4,000/month. 29 months × $3,800 average ≈ $110,000 additional accrual. Plus $130,000 starting = approximately $240,000 total. At 50% probability, expected payout ≈ $120,000. Does the card show something in that range?
3. For Vote Yes, does the retention show exactly $130,000 in October 2026?

Download the XLSX. Open both the **Vote Yes** sheet and the **Vote No (JCBA)** sheet. You will audit both.

---

**XLSX Audit — Vote Yes Sheet (Quick)**

Run the four standard checks on Vote Yes. This is mostly a sanity baseline.

The retention payout for Vote Yes is $130,000 in October 2026. Before that, there are 3 months of accrual (July, August, September 2026). The pilot is FO year 5 the whole time (anniversary is June, already reflected in starting longevity — next increment is June 2027). Accrual for these three months:
```
= FO year 5 CBA rate × 85 × 0.35
```
Build a check column for RB Accrual and compare.

---

**XLSX Audit — Vote No (JCBA) Sheet — The Core Test**

This is the main event. Build the full retention accrual verification.

**Step 1: Build an accrual lookup table in a new tab.**

In a new sheet, build this table manually from the contract document (not from the values in this guide — use the contract):

| Longevity Year | FO CBA Rate ($/hr) | Monthly Accrual = Rate × 85 × 0.35 |
|---|---|---|
| 5 | (your lookup) | (your formula) |
| 6 | (your lookup) | (your formula) |
| 7 | (your lookup) | (your formula) |
| 8 | (your lookup) | (your formula) |

**Step 2: Build a VLOOKUP-based accrual check column on the Vote No (JCBA) sheet.**

Use the Longevity column in the XLSX as the key to look up the expected accrual from your table:
```
= VLOOKUP([Longevity column], [your lookup table range], 3, FALSE)
```

In the next column (Diff):
```
= VLOOKUP result - RB Accrual (tool)
```
Apply conditional formatting to highlight non-zero values. If any row shows a non-zero difference, the tool is using the wrong rate for that longevity year.

**Step 3: Verify longevity increments at the right months.**

The anniversary is June. The pilot starts at year 5 in July 2026. The increments should fire:
- June 2027: year 5 → year 6
- June 2028: year 6 → year 7
- June 2029: year 7 → year 8 (if JCBA is 29 months, this is approximately the payout month)

Check the Longevity column in the XLSX. Write down the month where each increment fires. If an increment fires in the wrong month, every accrual calculation from that point is using the wrong rate.

**Step 4: Build a running balance column.**

In a new column starting from row 2:
```
Row 2: = $130,000 + [RB Accrual Check for row 2]
Row 3: = [Running Balance row 2] + [RB Accrual Check for row 3]
```
Continue down through the payout row.

In the next column (Running Balance Diff):
```
= [Your running balance] - [Running Balance shown in Retention Bonus Tracker]
```

Note: The Retention Bonus Tracker is a separate table at the bottom of the results screen in the tool — it is not a column in the XLSX directly. You are building this to compute the expected payout and compare to the results screen.

The final balance at the payout row, multiplied by the payout probability (default 50%), should match what the Worth the Risk card shows as the expected retention payout.

---

**Run all four standard checks on the Vote No (JCBA) sheet.**

For Gross Pay: this pilot is on CBA rates the whole pre-JCBA period. Every row should use the CBA rate for the current longevity year, not a TA rate. Build:
```
= VLOOKUP([Longevity], [your CBA rate lookup], 2, FALSE) × 70
```
Compare to Gross Pay column. Any TA rate showing up on this sheet before JCBA concludes is a bug.

For 401k: should be 10% throughout on Vote No (JCBA). No 15% step-up. The 401k rate only increases if the pilot is on the TA — Vote No with no deal stays on CBA at 10%.

---

### Pass 2 — Long JCBA, Aggressive Retention Accrual

Edit inputs and change:
- **Investment/discount rate:** change from default **8%** to **11%**
- **JCBA duration:** 42 months (maximum practical scenario)
- **Probability of second offer:** 20%
- **Payout probability if no offer:** 55%

Re-download the XLSX. The Vote No (JCBA) sheet now covers 42 months plus 2 payout months. With four full longevity increments potentially firing (June 2027, 2028, 2029, 2030), the accrual compound over time.

Repeat the accrual lookup check and running balance check for the full 44-row span. Verify:
- The longevity column increments in June of each year through June 2030 if the timeline is long enough
- The accrual amount updates each time
- The final balance times 55% matches the Worth the Risk card
- Row PV uses 11% discounting in Pass 2 (`Nominal / (1 + 0.11/12)^monthIndex`), not 8%

Also check: Does the tool's Worth the Risk card update when you change the "payout probability if no offer" slider? It should. If the card shows the same payout regardless of the slider, the slider is not connected to the calculation.

---

## Reporting Back

For each check, send:
1. **Scenario, pass, and sheet** (e.g., "Scenario B Pass 1, Vote No JCBA")
2. **What you verified**
3. **Result:** Confirmed correct / Found discrepancy
4. **If discrepancy:** Month, tool value, your formula result, and the difference
5. **Gut-check flags** — anything that does not match your contract knowledge even if you cannot isolate the formula

Your most important job is the retention accrual verification in Scenario B. If the tool is using the wrong rate (TA instead of CBA) or not updating when longevity increments, that affects every Vote No scenario for every pilot in the membership. Be thorough.
