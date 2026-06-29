import { buildMonthlyStream, buildScenarioSummary } from './engine'
import type { UserInputs, ScenarioSummary, ComparisonResult, MonthlyRow, ScenarioId, VoteNoScenario } from './types'

/**
 * Fixed uplift applied to post-JCBA rates for any scenario that had a deal to
 * negotiate from (Vote Yes = Scenario A; 2nd-offer = Scenario B).
 * Represents the benefit of starting JCBA negotiations from a higher base.
 */
export const POST_JCBA_UPLIFT = 0.20

export function buildAllScenarios(inputs: UserInputs, scenarioOverride?: VoteNoScenario): ComparisonResult {
  const vns = scenarioOverride ?? inputs.voteNoScenarios[0]
  const jcba = vns.jcbaDurationMonths
  const penalty = inputs.advancedPostJCBA?.scenarioCPenalty ?? 0.15

  const rowsA = buildMonthlyStream(inputs, 'A', vns)
  const rowsB = buildMonthlyStream(inputs, 'B', vns)
  const rowsC = buildMonthlyStream(inputs, 'C', vns)

  const summaryA = buildScenarioSummary(rowsA, 'A', 'Vote Yes', 'Accept the Tentative Agreement', inputs, jcba)
  const summaryB = buildScenarioSummary(rowsB, 'B', 'Vote No — 2nd Offer', 'Vote No and a bridge offer arrives', inputs, jcba)
  const summaryC = buildScenarioSummary(rowsC, 'C', 'Vote No — No Offer', 'Vote No and no bridge offer before JCBA', inputs, jcba)

  /**
   * Apply a post-JCBA pay multiplier to all months at or after the JCBA window.
   * The multipliers reflect the negotiating-position advantage of having a deal:
   *   A: TA rates × 1.20  (negotiated from the current bridge offer)
   *   B: bridge rates × 1.20  (bridge rates already above TA, expressed vs. base TA_JAN2028)
   *   C: A's JCBA rate × (1 − penalty)  (negotiated from CBA/DOS+5 — worse outcome)
   */
  const applyPostJcba = (summary: ScenarioSummary, multiplier: number): ScenarioSummary => {
    const adjustedRows = summary.rows.map(row => {
      if (row.monthIndex < jcba) return row
      return {
        ...row,
        grossPay:         row.grossPay         * multiplier,
        presentValue:     row.presentValue     * multiplier,
        k401Contribution: row.k401Contribution * multiplier,
        presentValue401k: row.presentValue401k * multiplier,
      }
    })
    return buildScenarioSummary(adjustedRows, summary.scenarioId, summary.label, summary.description, inputs, jcba)
  }

  // Scenario A: negotiated from TA → JCBA = TA × 1.20
  const multiplierA = 1 + POST_JCBA_UPLIFT
  // Scenario B: negotiated from bridge offer → JCBA = TA × (1 + %aboveTA) × 1.20
  const multiplierB = (1 + vns.percentAboveTA) * (1 + POST_JCBA_UPLIFT)
  // Scenario C: negotiated from CBA/DOS+5 → JCBA = A's rate × (1 − penalty)
  const multiplierC = (1 + POST_JCBA_UPLIFT) * (1 - penalty)

  const finalA = applyPostJcba(summaryA, multiplierA)
  const finalB = applyPostJcba(summaryB, multiplierB)
  const finalC = applyPostJcba(summaryC, multiplierC)

  // Blend using adjusted rows so the expected value properly reflects post-JCBA uplift
  const p = vns.probability
  const blendedRows: MonthlyRow[] = finalB.rows.map((rowB, i) => {
    const rowC = finalC.rows[i]
    return {
      ...rowB,
      scenarioId: 'VOTE_NO_EXPECTED' as ScenarioId,
      grossPay:         rowB.grossPay         * p + rowC.grossPay         * (1 - p),
      k401Contribution: rowB.k401Contribution * p + rowC.k401Contribution * (1 - p),
      profitSharingCash: rowB.profitSharingCash * p + rowC.profitSharingCash * (1 - p),
      retentionCashFlow: rowB.retentionCashFlow * p + rowC.retentionCashFlow * (1 - p),
      presentValue:     rowB.presentValue     * p + rowC.presentValue     * (1 - p),
      presentValue401k: rowB.presentValue401k * p + rowC.presentValue401k * (1 - p),
      cumulativePV:     rowB.cumulativePV     * p + rowC.cumulativePV     * (1 - p),
      cumulativePV401k: rowB.cumulativePV401k * p + rowC.cumulativePV401k * (1 - p),
    }
  })

  const voteNoExpected = buildScenarioSummary(
    blendedRows,
    'VOTE_NO_EXPECTED',
    'Vote No (Expected)',
    `Probability-weighted: ${Math.round(p * 100)}% chance of 2nd offer`,
    inputs,
    jcba
  )

  return {
    scenarios: [finalA, finalB, finalC],
    voteNoExpected,
    baselineScenarioId: 'A',
    inputs,
    voteNoScenario: vns,
    computedAt: new Date(),
  }
}
