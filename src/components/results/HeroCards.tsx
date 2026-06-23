import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

// PV = all cash flows discounted to today at the user's investment rate.
// This is the correct comparison metric — it accounts for the time value
// of money, so getting $100K now beats getting $165K in 2 years uncertain.
function pvTotal(s: ScenarioSummary) {
  return s.presentValueTotal
}

function Card({ summary, isYes }: { summary: ScenarioSummary; isYes: boolean }) {
  const value = pvTotal(summary)

  return (
    <div
      className="rounded-2xl p-5 flex-1"
      style={
        isYes
          ? { background: 'var(--chip-bg)', border: '2px solid var(--gold)' }
          : { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }
      }
    >
      <div
        className="text-xs font-bold uppercase tracking-widest mb-1"
        style={{ color: isYes ? 'var(--gold)' : 'var(--text-faint)' }}
      >
        {isYes ? 'Vote Yes' : 'Vote No'}
      </div>
      <div className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        {isYes ? 'Accept the TA' : 'Probability-weighted expected value'}
      </div>
      <div className="text-3xl font-black" style={{ color: isYes ? 'var(--gold)' : 'var(--text-base)' }}>
        {fmt(value)}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
        What it's worth in today's dollars
      </div>
    </div>
  )
}

export function HeroCards({ results }: Props) {
  const scenarioA = results.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = results.voteNoExpected
  const p         = results.inputs.voteNoOffer.probability
  const r         = results.inputs.investmentRate

  const diff      = pvTotal(scenarioA) - pvTotal(voteNo)
  const aIsBetter = diff > 0

  return (
    <div className="space-y-3">
      {/* Two primary cards */}
      <div className="flex gap-3">
        <Card summary={scenarioA} isYes />
        <Card summary={voteNo}    isYes={false} />
      </div>

      {/* Difference callout */}
      <div
        className="rounded-xl p-4 text-center"
        style={
          aIsBetter
            ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }
            : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }
        }
      >
        <div className="text-xl font-black" style={{ color: aIsBetter ? 'var(--positive)' : 'var(--negative)' }}>
          {aIsBetter ? '+' : ''}{fmt(diff)}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {aIsBetter ? 'Vote Yes is worth more in today\'s dollars' : 'Expected Vote No value is higher in today\'s dollars'}{' '}
          <span style={{ color: 'var(--text-faint)' }}>
            · {Math.round(r * 100)}% rate · {Math.round(p * 100)}% offer / {Math.round((1 - p) * 100)}% no offer
          </span>
        </div>
      </div>

      {/* Why TVM matters here — inline explainer */}
      <div
        className="rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <span style={{ color: 'var(--text-base)', fontWeight: 600 }}>Why "today's dollars"? </span>
        Getting a 70% raise starting now is worth more than the same raise starting in 2 years, even if the later number looks bigger on paper.
        The retention bonus also accrues more under Vote No, but that extra accrual is uncertain, delayed, and worth less today than money in hand.
        This number accounts for all of that.
      </div>
    </div>
  )
}
