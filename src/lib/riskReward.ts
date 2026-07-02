import type { ComparisonResult } from './types'

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

  const bNominalGap =
    (scenarioB.totalGrossPay + scenarioB.totalProfitSharing + scenarioB.totalRetention) -
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing + scenarioA.totalRetention)

  const bRetPayoutRow = scenarioB.rows.find(r => r.retentionCashFlow > 0)
  const bRetPayoutMonths = bRetPayoutRow?.monthIndex ?? (arrivalMonths + 2)

  const cWagesShortfall =
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing) -
    (scenarioC.totalGrossPay + scenarioC.totalProfitSharing)

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
  const cNetAfterRetention = cHeadlineLoss - cExpectedRetentionPayout

  return {
    jcba,
    arrivalMonths,
    percentAboveTA,
    retentionCurrentBalance,
    pB,
    pC,
    bNominalGap,
    bRetPayoutRow,
    bRetPayoutMonths,
    cWagesShortfall,
    cHeadlineLoss,
    cNetAfterRetention,
    cRetAccrued,
    cExpectedRetentionPayout,
  }
}
