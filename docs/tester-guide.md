# APA2118 Calculator — Tester Guide

**Version:** July 2026  
**Tool URL:** https://apa2118.vercel.app  
**Your job:** Find errors. Assume nothing is correct until you have verified it yourself.

This guide walks you through four test scenarios. Each one has a specific edge case to stress-test. You will run the tool twice per scenario — once with default settings, once with adjusted assumptions — then download the XLSX and audit the math with your own formulas.

**Do not trust numbers pre-calculated for you in this guide.** Every expected value below comes from the published pay scales and contract parameters. Build your own formulas and let the math speak. If you find a discrepancy, note the scenario number, the month, what the tool showed, and what your formula produced.

---

## Pay Scale Reference

Pull these directly from the published contract documents to verify you are working from the same source. The values below are what the tool uses internally.

### FO Hourly Rates

| Year | CBA | DOS (Jul–Dec 2026) | Jan 2027 | Jan 2028 |
|------|-----|-------------------|----------|----------|
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
| 12 (cap) | $155.61 | $214.63 | $218.14 | $224.46 |

### CA Hourly Rates

| Year | CBA | DOS (Jul–Dec 2026) | Jan 2027 | Jan 2028 |
|------|-----|-------------------|----------|----------|
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
| 12 (cap) | $232.00 | $320.00 | $345.00 | $355.00 |

### Key Contract Parameters

| Parameter | Value |
|-----------|-------|
| Contract start date | July 1, 2026 |
| Jan 2027 TA tier effective | January 1, 2027 |
| Jan 2028 TA tier effective | January 1, 2028 |
| Flying line MMG | 70 hours/month |
| Reserve MMG | 72 hours/month (CBA and TA) |
| 401k rate — CBA | 10% of gross |
| 401k rate — TA, Jul–Dec 2026 | 10% of gross |
| 401k rate — TA, Jan 2027 onward | 15% of gross |
| Retention accrual formula | CBA hourly rate × 85 hours × 35% |
| Retention payout — Vote Yes | 60 days after July 1, 2026 = October 1, 2026 |
| Retention payout — Vote No (Offer) | 60 days after offer arrival |
| Retention payout — Vote No (JCBA) | 60 days after JCBA conclusion |
| Longevity cap | Year 12 |
| Longevity carries over FO to CA | Yes |

---

## How to Use the Tool

1. Open https://apa2118.vercel.app
2. Click through the wizard entering the inputs listed for each scenario.
3. When you reach results, the first thing you see is the Risk vs. Reward summary. Spend a minute reading it before doing anything else.
4. Scroll down to the month-by-month table. Find the Vote Yes, Vote No (Offer), and Vote No (JCBA) tabs.
5. Click **Download XLSX**. Open in Excel or Google Sheets. Do your audit there.
6. When you are done with Pass 1, click **Edit Inputs** at the top of the results page and change the settings for Pass 2 — including the **investment/discount rate** (every Pass 2 below sets this to 11%) plus the Vote No scenario sliders. You do not have to re-enter everything from scratch.

---

---

# Scenario 1: Mid-Career Flying FO, No Upgrade

**What this tests:** Basic rate progression across all three TA tiers. Does the rate step up correctly in January 2027 and January 2028? Does the 401k jump from 10% to 15% at the right time?

---

## Entering the Inputs

Work through the wizard in order. Enter exactly the following:

- **Seat:** First Officer
- **Upgrade to CA:** No
- **Longevity as of July 1, 2026:** 6
- **Anniversary month:** July
- **Date of birth:** January 1, 1985
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $5,000 (or your best estimate — this is for realism, it won't affect rate verification)
- **Retention bonus current balance:** $75,000
- **Retirement/investment rate:** leave at default (8%)
- **Brokerage savings rate:** leave at default

On the Vote No scenario sliders, **leave everything at default** for Pass 1. Note what the defaults are before you change anything for Pass 2.

---

## Pass 1 — Default Assumptions

After you see results, before downloading anything, answer these questions from the results screen:

1. What is the headline "if no offer arrives" loss shown on the Risk vs. Reward card?
2. What is the "if the second offer arrives" gain?
3. Does the Vegas Odds moneyline make intuitive sense given those two numbers? Write down your gut reaction.
4. Does the retention bonus show as paying out in October 2026 at $75,000? Find this in the Worth the Risk card.

Now download the XLSX. Open it to the **Vote Yes** sheet.

**Build these formulas in a new column next to each existing column and verify they match row by row. Do not spot-check — run them down the full column.**

### Gross Pay verification
In a new column, for each row:
```
= Rate × Hours
```
The Rate column and Hours column are in the XLSX. The result must match the Gross Pay column exactly (or within $1 due to rounding).

**Spot check the following specific months and confirm the Rate column shows exactly these values:**
- July 2026: FO year 6 DOS tier (look it up in the pay scale table above)
- January 2027: FO year 6 Jan 2027 tier — note that the anniversary is July, so no longevity increment has fired yet
- July 2027: FO year 7 Jan 2027 tier — the anniversary fires and longevity increments here
- January 2028: FO year 7 Jan 2028 tier

If any rate is wrong, write down: the month, what it showed, what you expected, and which pay scale row you are reading from.

### 401k verification
In a new column:
```
= Gross Pay × 0.10    for rows July 2026 through December 2026
= Gross Pay × 0.15    for rows January 2027 onward
```
This must match the 401k Contrib column exactly.

### Retention bonus accrual verification
The tool shows a monthly RB Accrual value for every row before the payout month. For Vote Yes, the tool shows accrual for transparency but the payout is your fixed starting balance of $75,000.

In a new column, for each row before October 2026:
```
= CBA rate for FO year 6 × 85 × 0.35
```
This should match the RB Accrual column. Note the CBA rate (not the TA rate) is used for this formula regardless of which scenario you are on.

After October 2026, the accrual column should show zero (payout already happened). Verify the payout row shows $75,000 in the Retention column.

### Cumulative PV verification
Row PV for each month should equal:
```
= Nominal / (1 + rate/12)^monthIndex
```
At month 0 (July 2026), Row PV must equal Nominal exactly. Pass 1 uses 8%; Pass 2 uses 11%.

The Cumulative PV column should be a running sum of all Row PV values from row 1 through the current row. In a new column:
```
= SUM($[Row PV column]$2 : [Row PV column for current row])
```
The result must match the Cumulative PV column at every row.

---

## Pass 2 — Aggressive Vote No Assumptions

Click **Edit Inputs** at the top of the results screen. Navigate to the investment rate step and change:

- **Investment/discount rate:** change from default **8%** to **11%** (tap the **S&P Nominal** preset, or move the slider to 11%)

Then navigate to the Vote No scenario section and change the following:

- **Probability of second offer:** move slider to 80%
- **Second offer arrival:** move slider to 6 months
- **Improvement above TA:** move slider to 5%
- **JCBA duration:** move slider to 18 months

Look at the results again. Answer:

1. Has the Vote No Blended outcome now shifted significantly toward Vote No? It should, because you just told the tool the second offer is highly likely and arrives quickly.
2. Does the Risk vs. Reward "if the second offer arrives" number increase with a higher improvement percentage? It should.
3. Does the "if no offer arrives" loss stay the same? It should, because that scenario is independent of the second offer assumptions.
4. Are Row PV and Cumulative PV **lower** than Pass 1 at the same months? They should be — you raised the discount rate from 8% to 11%. Spot-check one row: `Row PV = Nominal / (1 + 0.11/12)^monthIndex`.
5. Switch to the Vote No (Offer) tab in the month-by-month table. Find the month when the offer arrives (month 6 = January 2027). Verify the hourly rate jumps at that point from CBA to something higher than the standard TA rate (because you set 5% above TA). The rate should be FO year 6 Jan 2027 rate × 1.05.

---

---

# Scenario 2: Senior CA Approaching the Longevity Cap

**What this tests:** Does longevity increment correctly into the cap? Does the rate freeze at year 12 and never go higher? This is important because a bug here overstates a senior pilot's pay for their entire remaining career.

---

## Entering the Inputs

- **Seat:** Captain
- **Longevity as of July 1, 2026:** 11
- **Anniversary month:** September
- **Date of birth:** January 1, 1970
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $8,000
- **Retention bonus current balance:** $200,000
- Leave all Vote No sliders at default for Pass 1.

---

## Pass 1 — Default Assumptions

Before downloading, note on the results screen:

1. The retention bonus is $200,000. Given this pilot gets it in October 2026, does the Worth the Risk card reflect the full $200,000 as a Vote Yes advantage? It should.
2. This is a senior CA. Are the headline dollar figures substantially larger than what you would expect for a junior FO? If not, something is wrong.

Download the XLSX, open the Vote Yes sheet.

### Rate progression verification

Find the Rate column. Manually locate these rows and write down what the tool shows. Then look up the correct value in the pay scale table above.

- July 2026: should be CA year 11 DOS
- August 2026: should still be CA year 11 DOS (anniversary is September, not yet)
- September 2026: should step up to CA year 12 DOS (anniversary fires, increments from 11 to 12)
- January 2027: should step up to CA year 12 Jan 2027 rate
- September 2027: this is the critical one — the anniversary fires again, but longevity is already at 12. The rate must NOT change. If it increases, the cap is broken.
- September 2028, September 2029: both must show identical rates to September 2027.

### Full column verification (same as Scenario 1)

Run the same Gross Pay, 401k, and Cumulative PV formula checks described in Scenario 1. These should be run for every scenario.

---

## Pass 2 — Long JCBA, Skeptical of Second Offer

- **Investment/discount rate:** change from default **8%** to **11%**
- **Probability of second offer:** 20%
- **JCBA duration:** 42 months
- **Second offer arrival:** 24 months

Now look at the month-by-month table for Vote No (JCBA). This pilot is on CBA rates for 42 months. Their retention bonus keeps accruing the whole time.

Open the XLSX. On the Vote No (JCBA) sheet, find the RB Accrual column. For this pilot:

```
Monthly accrual = CA CBA rate for current longevity year × 85 × 0.35
```

Note: the longevity is 11 at start, increments to 12 in September 2026, and stays at 12 forever after. So there are two distinct accrual rates in this scenario.

Build a formula that computes the expected monthly accrual for each row and compare it to the RB Accrual column. Verify the total balance at the payout row (approximately month 44, 60 days after month 42) by summing all accruals and adding the starting $200,000. Multiply by the payout probability (20%) to get the expected payout. Compare that to what the Worth the Risk card shows. Also confirm Row PV uses 11% discounting, not the 8% from Pass 1.

---

---

# Scenario 3: FO Upgrades to CA Right at the January 2027 TA Tier Change

**What this tests:** Two things change in the same month — the pilot's seat switches from FO to CA, and the TA tier steps up from DOS to Jan 2027. The tool must handle both simultaneously. This is a realistic timing for many pilots. A bug here could overstate or understate a pilot's pay for the rest of their career.

---

## Entering the Inputs

- **Seat:** First Officer
- **Upgrade to CA:** Yes, in **0.5 years** (this should place the upgrade in approximately January 2027)
- **Longevity as of July 1, 2026:** 8
- **Anniversary month:** April
- **Date of birth:** October 1, 1983
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Retention bonus current balance:** $80,000
- Leave Vote No sliders at default for Pass 1.

---

## Pass 1 — Default Assumptions

Before downloading, look at the results screen:

1. Scroll down to the month-by-month table, Vote Yes tab. Find January 2027. The Seat column should switch from FO to CA in that row. Write down the rate shown.
2. Look up in the pay scale table: CA year 8, Jan 2027 tier. That is what the rate should be.
3. If the rate shown is anything other than CA year 8 Jan 2027, write down what it shows instead and flag it as a potential bug.

Download the XLSX, Vote Yes sheet.

### The upgrade month verification

Locate the row for January 2027. Verify all of the following in that single row:

- Seat column shows CA (not FO)
- Longevity column shows 8 (not 1 — longevity carries over from FO)
- Rate column shows CA year 8, Jan 2027 rate
- Gross Pay = Rate × 70

If longevity shows 1, the tool reset longevity at upgrade — that is a bug.  
If the rate shows FO year 8 Jan 2027, the seat switch did not fire.  
If the rate shows CA year 8 DOS, the tier change did not fire.  
Any of these is a distinct, actionable bug.

### Post-upgrade longevity increment verification

The anniversary is April. The upgrade fires in January 2027. The next April after the upgrade is April 2027 — three months later. Verify that April 2027 shows CA year 9 Jan 2027 rate (longevity increments from 8 to 9, still on Jan 2027 tier, seat is CA).

### Full column verification

Run Gross Pay, 401k, and Cumulative PV formula checks across the full sheet.

---

## Pass 2 — Skeptical Pilot, Long Timeline

- **Investment/discount rate:** change from default **8%** to **11%**
- **Probability of second offer:** 35%
- **JCBA duration:** 30 months
- **Second offer arrival:** 20 months

On the Vote No (JCBA) sheet, this pilot is on FO CBA rates until the upgrade fires. But wait — does the upgrade still fire in the same month on the Vote No scenario? It should. The upgrade timing is independent of the vote outcome. Verify that the seat change still appears at the same month index across all three scenario tabs (Vote Yes, Vote No Offer, Vote No JCBA). Confirm Row PV and Cumulative PV reflect 11% discounting (`Nominal / (1 + 0.11/12)^monthIndex`).

---

---

# Scenario 4: Vote No — Long JCBA, Retention Accrual Across Multiple Longevity Years

**What this tests:** The retention bonus accrual math over a long period where the pilot's longevity increments multiple times. This is the hardest thing to verify by hand. The monthly accrual amount is not constant — it changes each time longevity increments, because the CBA rate for that year is higher. We want to confirm the tool is using the correct CBA rate (not the TA rate) and updating it as longevity steps up.

---

## Entering the Inputs

- **Seat:** First Officer
- **Upgrade:** No
- **Longevity as of July 1, 2026:** 5
- **Anniversary month:** June
- **Date of birth:** December 1, 1988
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Retention bonus current balance:** $60,000
- Leave default sliders first.

---

## Pass 1 — Default Assumptions

Look at the results screen before downloading.

1. Does the Worth the Risk card describe a retention bonus that will accrue to a larger number by the time of the payout? For Vote No, it should grow beyond $60,000. For Vote Yes, it should pay exactly $60,000 in October 2026.
2. Is the payout amount on the Worth the Risk card noticeably larger than $60,000? It should be, because 29 months of accrual at CBA rates adds meaningfully to the balance.

Download the XLSX. Open both the **Vote Yes** and **Vote No (JCBA)** sheets side by side.

### Vote Yes retention verification

On the Vote Yes sheet, find the RB Accrual column. Before October 2026, it should show monthly accrual amounts. In October 2026, the Retention column should show $60,000 and after that the RB Accrual column should be zero.

Build the accrual formula for the pre-payout rows:
```
= FO CBA rate for year 5 × 85 × 0.35
```
All rows before October 2026 should match this. There are only 3 rows (July, August, September 2026), so this is quick to check.

### Vote No (JCBA) retention accrual verification

This is the core test. On the Vote No (JCBA) sheet, the RB Accrual column should show a different amount depending on the pilot's current longevity year. The accrual rate uses the CBA rate, and the CBA rate changes each time the pilot increments a longevity year.

The anniversary is June. The contract starts July 1, 2026. The next June is June 2027.

Build a separate lookup table in a new tab of the spreadsheet:

| Longevity Year | FO CBA Rate | Monthly Accrual (rate × 85 × 0.35) |
|---|---|---|
| 5 | (look up in contract docs) | = your rate × 85 × 0.35 |
| 6 | (look up) | = your rate × 85 × 0.35 |
| 7 | (look up) | = your rate × 85 × 0.35 |
| 8 | (look up) | = your rate × 85 × 0.35 |

Do not use the values in this guide. Pull the rates from the contract document. Then add a formula column next to RB Accrual that does a VLOOKUP from your table using the Longevity column as the key. The result must match RB Accrual for every row.

Verify the longevity column itself increments in June each year and stays at 5 until June 2027, then 6 until June 2028, and so on.

### Running balance verification

Add a new column: starting from $60,000, add each month's RB Accrual to a running total. This should match what the retention tracker in the tool shows at each row. Verify at three checkpoints:
- End of year 1 (June 2027, just before the first increment)
- End of year 2 (June 2028)
- At the payout row (approximately 60 days after JCBA conclusion)

Multiply the final balance by the payout probability. That expected payout number should match what the Worth the Risk card shows on the results screen.

---

## Pass 2 — Aggressive Vote No, Long JCBA

- **Investment/discount rate:** change from default **8%** to **11%**
- **JCBA duration:** 36 months
- **Probability of second offer:** 25%
- **Second offer arrival:** 15 months
- **Payout probability if second offer (Vote No B):** move to 85%
- **Payout probability if no offer (Vote No C):** move to 40%

Re-download the XLSX. The Vote No (JCBA) sheet now has 36 months of pre-JCBA data instead of 29. Repeat the running balance verification with the longer timeline. The expected payout should now use the 40% probability (Vote No C payout slider). Confirm the Worth the Risk card reflects the updated expected payout. Also confirm Row PV values use 11% discounting (`Nominal / (1 + 0.11/12)^monthIndex`), not the 8% from Pass 1.

---

---

# Reporting Back

When you have finished your testing, send a summary with:

1. **Scenario number and pass (e.g., S1 Pass 1)**
2. **What you found:** exact month, what the tool showed, what your formula produced
3. **Your verdict:** confirmed correct, or suspected error
4. **Anything that felt off** even if you cannot pinpoint the exact formula issue — a number that seemed too high or too low based on your contract knowledge counts as a flag

If you find something that looks wrong, try to narrow it down before reporting. For example: "The rate in January 2027 is wrong" is less useful than "The rate in January 2027 on the Vote No (JCBA) tab shows $188.40, which is FO year 4 Jan 2027. But the pilot should be year 5 because the November 2026 anniversary already fired. Expected $199.61."

Thank you for your time on this.
