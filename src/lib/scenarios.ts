import { buildMonthlyStream, buildScenarioSummary } from './engine'
import type { UserInputs, ScenarioSummary, ComparisonResult, MonthlyRow, ScenarioId } from './types'

export function buildAllScenarios(inputs: UserInputs): ComparisonResult {
  const rowsA = buildMonthlyStream(inputs, 'A')
  const rowsB = buildMonthlyStream(inputs, 'B')
  const rowsC = buildMonthlyStream(inputs, 'C')

  const summaryA = buildScenarioSummary(rowsA, 'A', 'Vote Yes', 'Accept the Tentative Agreement', inputs)
  const summaryB = buildScenarioSummary(rowsB, 'B', 'Vote No — 2nd Offer', 'Vote No and a bridge offer arrives', inputs)
  const summaryC = buildScenarioSummary(rowsC, 'C', 'Vote No — No Offer', 'Vote No and no bridge offer before JCBA', inputs)

  const applyAdvanced = (summary: ScenarioSummary, key: 'scenarioA' | 'scenarioB' | 'scenarioC'): ScenarioSummary => {
    if (!inputs.advancedPostJCBA.enabled) return summary
    const config = inputs.advancedPostJCBA[key]
    if (config.direction === 'SAME') return summary
    const multiplier = config.direction === 'HIGHER'
      ? 1 + config.magnitude * config.probability
      : 1 - config.magnitude * config.probability
    const jcbaMonth = inputs.jcbaDurationMonths
    const adjustedRows = summary.rows.map(row => {
      if (row.monthIndex < jcbaMonth) return row
      return {
        ...row,
        grossPay: row.grossPay * multiplier,
        presentValue: row.presentValue * multiplier,
        k401Contribution: row.k401Contribution * multiplier,
        presentValue401k: row.presentValue401k * multiplier,
      }
    })
    return buildScenarioSummary(adjustedRows, summary.scenarioId, summary.label, summary.description, inputs)
  }

  const finalA = applyAdvanced(summaryA, 'scenarioA')
  const finalB = applyAdvanced(summaryB, 'scenarioB')
  const finalC = applyAdvanced(summaryC, 'scenarioC')

  const p = inputs.voteNoOffer.probability
  const blendedRows: MonthlyRow[] = rowsB.map((rowB, i) => {
    const rowC = rowsC[i]
    return {
      ...rowB,
      scenarioId: 'VOTE_NO_EXPECTED' as ScenarioId,
      grossPay: rowB.grossPay * p + rowC.grossPay * (1 - p),
      k401Contribution: rowB.k401Contribution * p + rowC.k401Contribution * (1 - p),
      profitSharingCash: rowB.profitSharingCash * p + rowC.profitSharingCash * (1 - p),
      retentionCashFlow: rowB.retentionCashFlow * p + rowC.retentionCashFlow * (1 - p),
      presentValue: rowB.presentValue * p + rowC.presentValue * (1 - p),
      presentValue401k: rowB.presentValue401k * p + rowC.presentValue401k * (1 - p),
      cumulativePV: rowB.cumulativePV * p + rowC.cumulativePV * (1 - p),
      cumulativePV401k: rowB.cumulativePV401k * p + rowC.cumulativePV401k * (1 - p),
    }
  })

  const voteNoExpected = buildScenarioSummary(
    blendedRows,
    'VOTE_NO_EXPECTED',
    'Vote No (Expected)',
    `Probability-weighted: ${Math.round(p * 100)}% chance of 2nd offer`,
    inputs
  )

  return {
    scenarios: [finalA, finalB, finalC],
    voteNoExpected,
    baselineScenarioId: 'A',
    inputs,
    computedAt: new Date(),
  }
}
