import type { VoteNoScenario } from '../../lib/types'

export function Assumption({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="underline underline-offset-2 decoration-dotted"
      style={{ textDecorationColor: 'var(--text-muted)' }}
    >
      {children}
    </span>
  )
}

export function AssumptionsFooter({
  vns,
  investmentRate,
  retentionPayoutProbabilityB,
  retentionPayoutProbabilityC,
  underlineValues = true,
}: {
  vns: VoteNoScenario
  investmentRate: number
  retentionPayoutProbabilityB: number
  retentionPayoutProbabilityC: number
  /** User-adjustable inputs use dotted underlines; fixed benchmark scenarios do not. */
  underlineValues?: boolean
}) {
  const probability = `${Math.round(vns.probability * 100)}% 2nd Offer Probability in ${vns.arrivalMonths} months`
  const improvement = `${(vns.percentAboveTA * 100).toFixed(0)}% Higher`
  const jcba = `JCBA in ${vns.jcbaDurationMonths} months`
  const bPayout = `B Retention Payout ${Math.round(retentionPayoutProbabilityB * 100)}%`
  const cPayout = `C Retention Payout ${Math.round(retentionPayoutProbabilityC * 100)}%`
  const discount = `${Math.round(investmentRate * 100)}% Discount Rate`

  const renderValue = (value: string) =>
    underlineValues ? <Assumption>{value}</Assumption> : value

  return (
    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
      {underlineValues ? 'Assumptions:' : 'Scenario:'}{' '}
      {renderValue(probability)}
      {' | '}
      {renderValue(improvement)}
      {' | '}
      {renderValue(jcba)}
      {' | '}
      {renderValue(bPayout)}
      {' | '}
      {renderValue(cPayout)}
      {' | '}
      {renderValue(discount)}
    </span>
  )
}
