import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function totalValue(s: ScenarioSummary) {
  return s.totalGrossPay + s.totalProfitSharing + s.totalRetention + s.total401kContributions
}

function Card({ summary, isYes }: { summary: ScenarioSummary; isYes: boolean }) {
  const value = totalValue(summary)

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
      <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Total career compensation</div>
    </div>
  )
}

export function HeroCards({ results }: Props) {
  const scenarioA = results.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = results.voteNoExpected
  const p         = results.inputs.voteNoOffer.probability

  const diff      = totalValue(scenarioA) - totalValue(voteNo)
  const aIsBetter = diff > 0

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Card summary={scenarioA} isYes />
        <Card summary={voteNo}    isYes={false} />
      </div>

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
          {aIsBetter ? 'Vote Yes pays more over your career' : 'Vote No expected value is higher'}{' '}
          <span style={{ color: 'var(--text-faint)' }}>
            ({Math.round(p * 100)}% 2nd offer + {Math.round((1 - p) * 100)}% no offer)
          </span>
        </div>
      </div>
    </div>
  )
}
