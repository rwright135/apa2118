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

export function AssumptionsFooter({ vns }: { vns: VoteNoScenario }) {
  return (
    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
      Assumptions:{' '}
      <Assumption>
        {Math.round(vns.probability * 100)}% 2nd Offer Probability in {vns.arrivalMonths} months
      </Assumption>
      {' | '}
      <Assumption>{(vns.percentAboveTA * 100).toFixed(0)}% Higher</Assumption>
      {' | '}
      <Assumption>JCBA in {vns.jcbaDurationMonths} months</Assumption>
    </span>
  )
}

export const ASSUMPTIONS_FOOTNOTE = '* Underlined values are your assumptions.'
export const BENCHMARK_ASSUMPTIONS_FOOTNOTE = '* Underlined values are these assumptions.'
