import type { ComparisonResult } from './types'
import { discountFactor } from './engine'

/**
 * Core risk/reward metrics shared by the results screen's headline cards and
 * the betting-odds framing: the upside if a 2nd offer arrives (B vs A) and the
 * downside if it doesn't (C vs A), net of the retention bonus.
 */
export function computeRiskRewardMetrics(result: ComparisonResult) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const { jcbaDurationMonths: jcba, arrivalMonths, percentAboveTA, probability } = result.voteNoScenario
  const { retentionPayoutProbabilityB: pB, retentionPayoutProbabilityC: pC, retentionCurrentBalance } = result.inputs
  const investmentRate = result.inputs.investmentRate

  const bPayDiff  = scenarioB.totalGrossPay     - scenarioA.totalGrossPay
  const bPSDiff   = scenarioB.totalProfitSharing - scenarioA.totalProfitSharing
  const b401kDiff = scenarioB.total401kContributions - scenarioA.total401kContributions
  // Nominal additional retention accrual: Scenario A freezes the balance at ratification
  // (day 1); Scenario B continues accruing at CBA rates until the offer arrives.
  // We use raw accrual notes rather than totalRetention so this stays consistent with
  // the other nominal rows (which don't apply pB probability weighting).
  let bRetDiff = 0
  for (const rowB of scenarioB.rows) {
    bRetDiff += rowB.retentionAccrualNote
  }
  const bNominalGap = bPayDiff + bPSDiff + b401kDiff + bRetDiff

  // Split the pay+PS difference into two phases for the breakdown:
  //   1. Waiting period (months 0 → arrivalMonths): B is on CBA, A is on TA — always a loss
  //   2. After offer (months arrivalMonths → jcba): B is on bridged TA (above A) — should be a gain
  const rowsA = scenarioA.rows
  let bPayPlusPS_waiting = 0
  let bPayPlusPS_afterOffer = 0
  for (const rowB of scenarioB.rows) {
    if (rowB.monthIndex >= jcba) break
    const rowA = rowsA[rowB.monthIndex]
    const diff = (rowB.grossPay + rowB.profitSharingCash) - (rowA.grossPay + rowA.profitSharingCash)
    if (rowB.monthIndex < arrivalMonths) {
      bPayPlusPS_waiting += diff
    } else {
      bPayPlusPS_afterOffer += diff
    }
  }

  const bRetPayoutRow = scenarioB.rows.find(r => r.retentionCashFlow > 0)
  const bRetPayoutMonths = bRetPayoutRow?.monthIndex ?? (arrivalMonths + 2)

  const cPayDiff =
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing + scenarioA.total401kContributions) -
    (scenarioC.totalGrossPay + scenarioC.totalProfitSharing + scenarioC.total401kContributions)
  const cWagesShortfall = cPayDiff // alias kept for backwards compatibility
  const cRetentionForegone = scenarioA.totalRetention
  const cHeadlineLoss = cWagesShortfall + cRetentionForegone

  const cRetPayoutRow = scenarioC.rows.find(r => r.retentionCashFlow > 0)
  const cRetPayoutMonths = cRetPayoutRow?.monthIndex ?? (jcba + 2)

  let cRetAccrued = retentionCurrentBalance
  for (const row of scenarioC.rows) {
    if (row.monthIndex >= cRetPayoutMonths) break
    cRetAccrued += row.retentionAccrualNote
  }

  const cExpectedRetentionPayout = cRetAccrued * pC
  // Present value of the expected retention payout, discounted from its payout date back to today
  const cExpectedRetentionPayoutPV = cExpectedRetentionPayout * discountFactor(investmentRate, cRetPayoutMonths)
  const cNetAfterRetention = cHeadlineLoss - cExpectedRetentionPayout

  return {
    probability,
    jcba,
    arrivalMonths,
    percentAboveTA,
    retentionCurrentBalance,
    investmentRate,
    pB,
    pC,
    // Scenario B vs A breakdown (all nominal)
    bPayDiff,
    bPSDiff,
    b401kDiff,
    bRetDiff,
    bNominalGap,
    bPayPlusPS_waiting,
    bPayPlusPS_afterOffer,
    bRetPayoutRow,
    bRetPayoutMonths,
    // Scenario C vs A breakdown (all nominal)
    cPayDiff,
    cWagesShortfall,
    cRetentionForegone,
    cHeadlineLoss,
    cNetAfterRetention,
    cRetAccrued,
    cExpectedRetentionPayout,
    cExpectedRetentionPayoutPV,
    cRetPayoutMonths,
  }
}
