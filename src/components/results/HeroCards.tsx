import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult; viewMode: 'today' | 'age65' }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function Card({
  summary,
  viewMode,
  isYes,
}: {
  summary: Pick<ScenarioSummary, 'presentValueTotal' | 'retirementBalanceAt65'>
  viewMode: 'today' | 'age65'
  isYes: boolean
}) {
  const value    = viewMode === 'today' ? summary.presentValueTotal : summary.retirementBalanceAt65
  const sublabel = viewMode === 'today' ? 'Total Present Value' : 'Est. Value at Age 65'

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
      <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{sublabel}</div>
    </div>
  )
}

export function HeroCards({ results, viewMode }: Props) {
  const scenarioA  = results.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo     = results.voteNoExpected
  const p          = results.inputs.voteNoOffer.probability

  const diff = viewMode === 'today'
    ? scenarioA.presentValueTotal - voteNo.presentValueTotal
    : scenarioA.retirementBalanceAt65 - voteNo.retirementBalanceAt65
  const aIsBetter = diff > 0

  return (
    <div className="space-y-3">
      {/* Two primary cards */}
      <div className="flex gap-3">
        <Card summary={scenarioA} viewMode={viewMode} isYes />
        <Card summary={voteNo}    viewMode={viewMode} isYes={false} />
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
          {aIsBetter ? 'Vote Yes is worth more' : 'Vote No expected value is higher'}{' '}
          <span style={{ color: 'var(--text-faint)' }}>
            (Vote No = {Math.round(p * 100)}% chance of 2nd offer + {Math.round((1 - p) * 100)}% no offer)
          </span>
        </div>
      </div>
    </div>
  )
}
