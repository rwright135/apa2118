# APA2118 Calculator — Tester 2 Guide

**Tool URL:** https://apa2118.vercel.app  
**Your scenarios:** Junior FO with CA Upgrade (Scenario A) and FO Upgrades to CA Right at the January 2027 Tier Change (Scenario B)  
**Total checks:** 4 — Pass 1 and Pass 2 for each scenario

You will complete four things:
1. Verify the assumptions and formulas built into the tool against the actual contract documents
2. Scenario A, Pass 1 — enter inputs, run with defaults, audit the XLSX
3. Scenario A, Pass 2 — change specific sliders, re-run, re-audit
4. Scenario B, Pass 1 and Pass 2 — repeat for a different pilot profile

Your scenarios both involve an FO upgrading to Captain mid-career. The tool must correctly switch pay scales at the upgrade month AND carry the pilot's longevity years over from FO to CA without resetting to year 1. Scenario B adds the complication that the upgrade fires in the exact same month as a TA tier change.

**Your job is to find errors.** If you find a discrepancy, write down both numbers and report it. Do not assume you made a mistake.

---

## Task 1: Verify the Tool's Assumptions

Before testing any scenario, verify every value below against the actual contract documents. Write notes on anything that does not match or that you cannot confirm.

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

Write notes: Do these match the contract documents exactly?

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
| Longevity cap | Year 12 | |
| Longevity at FO-to-CA upgrade | Carries over — does NOT reset to year 1 | |
| Profit sharing payment months | June and November | |

**The longevity carry-over rule is especially important for your scenarios.** If the contract says longevity resets to year 1 at upgrade, every CA rate in both your scenarios is wrong. Confirm this with the contract before proceeding.

---

### 1C. Spot Check the Tool's Language and Results Screen

Open the tool and run it with any inputs. You are reading and assessing, not auditing math yet.

- On the Risk vs. Reward cards, is the framing clear? Does "if the second offer arrives" read as a gain vs. voting yes, or is it confusingly worded?
- Does the upgrade show up in the month-by-month table? There should be a banner row that says something like "Upgraded to Captain — Captain pay rates apply from here." Find it and confirm it appears in approximately the right month.
- On the Worth the Risk card, does the retention bonus explanation make sense for a Vote No scenario?
- Does the Vegas Odds card "Risking X to win Y" match the two Risk vs. Reward numbers above it?
- In the month-by-month table, does the 401k jump to 15% in January 2027 on the Vote Yes tab?

Write any notes on language, layout, or numbers that seem off.

---

## Scenario A: Junior FO with Upgrade to CA in Year 2

**What this tests:** A junior pilot upgrades two years into the contract. The tool must switch from FO to CA rates in the correct month and carry the longevity years over. An anniversary in October means the pilot increments longevity in October of each year — we want to confirm this happens correctly both before and after the upgrade.

---

### Entering the Inputs

- **Seat:** First Officer
- **Upgrade to CA:** Yes, in **2 years**
- **Longevity as of July 1, 2026:** 3
- **Anniversary month:** October
- **Date of birth:** March 1, 1995
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $1,000
- **Retention bonus current balance:** $110,000
- **Investment/discount rate:** default

Write down all Vote No slider defaults before Pass 1.

---

### Pass 1 — Default Assumptions

Read the results screen before downloading. Write down:
1. Does the upgrade show up in the cumulative cash flow chart? Is there a visible inflection point where earnings accelerate at approximately the 24-month mark?
2. Is the Risk vs. Reward gain for "if the second offer arrives" positive or negative? Given this pilot upgrades and earns strong CA rates, does the number feel in the right ballpark?
3. On the Worth the Risk card, the retention bonus pays out in October 2026 for Vote Yes. Does it show $110,000?

Download the XLSX. Open the **Vote Yes** sheet.

---

**XLSX Audit**

Set up the diff column approach for all four checks. In each case: add a "Check" column with your formula, then a "Diff" column = Check minus the tool value. Apply conditional formatting to the Diff column to highlight any cell that is non-zero (or outside ±$1 for rounding). You are looking for non-zero rows.

---

**Check 1: Gross Pay and the Upgrade Month**

Build the Gross Pay check column:
```
= Rate × Hours
```
Run it down the full sheet.

Build the Diff column:
```
= Gross Pay Check - Gross Pay (tool)
```
Apply conditional formatting.

Now find the upgrade month (approximately July 2028, month 24 from July 2026). Find the row where the Seat column changes from FO to CA. Write down:
- What month does the upgrade fire?
- What longevity year does the tool show in that row?
- What rate does the tool show?

Expected: The pilot's anniversary is October. By July 2028, they have incremented in October 2026 (year 4), October 2027 (year 5). They have not yet reached October 2028, so longevity at upgrade should be year 5. The CA rate should be CA year 5 at the Jan 2028 tier (because July 2028 is after January 2028).

Look up CA year 5 Jan 2028 in the pay scale table. Does it match?

**If the longevity shows year 1 at the upgrade, that is a bug — longevity reset incorrectly.**  
**If the longevity shows year 3 (the starting FO longevity), the anniversary increments were not tracked.**  
**If the rate is an FO rate instead of CA, the seat switch did not fire.**

---

**Check 2: Pre-upgrade longevity increments**

Find October 2026 (month 4 from July 2026). The rate should step up because the anniversary fires. Write down the rate shown and compare to FO year 4 DOS (the tier is still DOS in October 2026).

Find October 2027. The rate should step up again. The tier is now Jan 2027. Write down the rate and compare to FO year 5 Jan 2027.

Find October 2028. The pilot is now CA (upgraded in July 2028). The next anniversary is October 2028. The rate should step up from CA year 5 to CA year 6 at the Jan 2028 tier. Write down the rate and compare to CA year 6 Jan 2028.

---

**Check 3: 401k Contribution**

```
Pre-Jan 2027: = Gross Pay × 0.10
Jan 2027 onward: = Gross Pay × 0.15
```
Diff column, apply conditional formatting.

Note: The 15% rate applies from January 2027 regardless of whether the pilot has upgraded yet. The upgrade is FO to CA seat change; the 401k step-up is a TA contract date. Verify both changes appear at their correct respective months.

---

**Check 4: Retention Bonus**

For Vote Yes, payout fires in October 2026 at $110,000. Verify the Retention column shows this.

Before October 2026, the RB Accrual column should show the monthly accrual. For FO year 3 (the starting longevity), the accrual is FO year 3 CBA rate × 85 × 0.35. In October 2026, the longevity increments to year 4 — but the payout already happened, so accrual stops regardless. Verify accrual is zero after October 2026.

---

**Check 5: Cumulative PV running sum**

```
= SUM($[Row PV column]$[first data row] : [Row PV column for current row])
```
Diff column, apply conditional formatting.

---

### Pass 2 — Pilot Believes Second Offer Is Likely, Short Timeline

Edit inputs and change:
- **Probability of second offer:** 75%
- **Second offer arrives in:** 8 months
- **Improvement above TA:** 4%
- **JCBA duration:** 20 months

The offer arrives at month 8 (approximately March 2027). After that, the pilot is on an uplifted TA rate until JCBA at month 20.

Download the XLSX again. Open the **Vote No (Offer)** sheet.

Run all five checks on this sheet.

**Additional check:** Find the offer arrival month (approximately March 2027). Before this month, the rate should be FO CBA rates. At this month and after, the rate should be TA rates × 1.04. In March 2027, the tier is Jan 2027. Check: FO year 4 Jan 2027 × 1.04 (the pilot incremented to year 4 in October 2026, and has not yet hit October 2027). Does the Gross Pay match Rate × Hours × 70?

Also verify that the upgrade still fires at approximately month 24 on this sheet. The upgrade timing should be the same across all scenario tabs.

---

---

## Scenario B: FO Upgrades to CA in the Exact Month of the January 2027 TA Tier Change

**What this tests:** January 2027 is a double event — the TA tier steps up AND this pilot's upgrade fires. The tool must handle both simultaneously: switch the seat from FO to CA AND look up the Jan 2027 tier rate. There are three distinct failure modes here, each producing a different wrong number. If this were a real pilot, a bug here would misstate their pay for the rest of their career.

---

### Entering the Inputs

- **Seat:** First Officer
- **Upgrade to CA:** Yes, in **0.5 years** (this places the upgrade at approximately January 2027)
- **Longevity as of July 1, 2026:** 8
- **Anniversary month:** April
- **Date of birth:** October 1, 1983
- **Line type:** Flying
- **Extra hours above MMG:** 0
- **Profit sharing last year:** $1,000
- **Retention bonus current balance:** $150,000
- **Investment/discount rate:** default

Write down all Vote No slider defaults.

---

### Pass 1 — Default Assumptions

Read the results screen. Write down:
1. The "if the second offer arrives" figure. Does this seem reasonable for a pilot who will be earning strong CA rates for most of the pre-JCBA window?
2. The retention payout for Vote Yes is $150,000 in October 2026. Does the Worth the Risk card confirm this?
3. Find January 2027 in the month-by-month table before downloading. What seat does it show? What rate?

Download the XLSX. Open the Vote Yes sheet.

---

**The Critical Check — January 2027**

Find the row for January 2027. Write down all of the following from that single row:

| Field | Tool Shows | Expected Value |
|-------|------------|---------------|
| Month | January 2027 | January 2027 |
| Seat | ? | CA |
| Longevity | ? | 8 |
| Rate | ? | CA year 8 Jan 2027 rate |
| Hours | ? | 70 |
| Gross Pay | ? | CA year 8 Jan 2027 rate × 70 |

Look up CA year 8 Jan 2027 from the pay scale table. That is the correct rate.

**Three specific failures to check for:**

1. If Seat shows FO and Rate shows FO year 8 Jan 2027 ($213.01): the upgrade did not fire. The tier change happened but the seat switch was missed.
2. If Seat shows CA and Rate shows CA year 8 DOS ($290.48): the upgrade fired but the tier change was not applied. The tool is using the DOS tier rate instead of Jan 2027.
3. If Seat shows CA, Longevity shows 1, and Rate shows CA year 1 Jan 2027 ($253.78): the upgrade fired and tier change applied, but longevity was incorrectly reset to year 1.

The correct result: Seat = CA, Longevity = 8, Rate = CA year 8 Jan 2027.

---

**Check: Post-Upgrade Longevity Increments**

The anniversary is April. The upgrade fires in January 2027. The next April after the upgrade is April 2027 (three months later). Find April 2027 in the sheet.

- Seat should still be CA
- Longevity should increment from 8 to 9
- Rate should be CA year 9 Jan 2027

Find April 2028. Longevity increments to 10. Rate should be CA year 10 Jan 2028 (the Jan 2028 tier takes effect in January 2028, so by April 2028 we are on that tier).

Write down what the tool shows and compare to the pay scale table.

---

**Run all four standard checks on the Vote Yes sheet** (Gross Pay diff column, 401k diff column, RB Accrual check, Cumulative PV running sum).

For the 401k check: December 2026 should still be 10% (FO CBA). January 2027 switches to both CA and 15%. Verify the 401k column reflects 15% of the CA gross pay from January 2027 onward.

---

### Pass 2 — Skeptical Pilot, Long JCBA

Edit inputs and change:
- **Probability of second offer:** 25%
- **JCBA duration:** 32 months
- **Second offer arrival:** 22 months

Download the XLSX. Open the **Vote No (JCBA)** sheet.

On this sheet, the pilot is on CBA rates until JCBA concludes at month 32. The upgrade to CA still fires at month 6 (January 2027) — the upgrade is tied to time, not to the vote outcome.

**Verify on the Vote No (JCBA) sheet:**
- The seat still switches from FO to CA in January 2027
- But the rate in January 2027 should be CA year 8 at the **CBA rate** (not TA), because Scenario C stays on CBA
- CA year 8 CBA rate is $210.60/hr

Write down the rate shown in January 2027 on the Vote No (JCBA) sheet. Compare to CA year 8 CBA ($210.60). If the tool is using a TA rate on a Vote No (JCBA) sheet before JCBA concludes, that is a bug.

Run all four standard checks on this sheet. The 401k should stay at 10% throughout the pre-JCBA period on this sheet (CBA rates, no step-up).

---

## Reporting Back

For each check, send:
1. **Scenario, pass, and sheet** (e.g., "Scenario B Pass 1, Vote Yes")
2. **What you verified** (e.g., "January 2027 rate and seat")
3. **Result:** Confirmed correct / Found discrepancy
4. **If discrepancy:** The month, tool value, your expected value, the difference
5. **Any gut-check flags** based on your contract knowledge

Specific is always better than general.
