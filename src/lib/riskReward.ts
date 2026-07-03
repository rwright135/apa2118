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
  const { jcbaDurationMonths: jcba, arrivalMonths, percentAboveTA } = result.voteNoScenario
  const { retentionPayoutProbabilityB: pB, retentionPayoutProbabilityC: pC, retentionCurrentBalance } = result.inputs
  const investmentRate = result.inputs.investmentRate

  const bPayDiff  = scenarioB.totalGrossPay     - scenarioA.totalGrossPay
  const bPSDiff   = scenarioB.totalProfitSharing - scenarioA.totalProfitSharing
  const bRetDiff  = scenarioB.totalRetention     - scenarioA.totalRetention
  const bNominalGap = bPayDiff + bPSDiff + bRetDiff

  const bRetPayoutRow = scenarioB.rows.find(r => r.retentionCashFlow > 0)
  const bRetPayoutMonths = bRetPayoutRow?.monthIndex ?? (arrivalMonths + 2)

  const cPayDiff =
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing) -
    (scenarioC.totalGrossPay + scenarioC.totalProfitSharing)
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
    bRetDiff,
    bNominalGap,
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
