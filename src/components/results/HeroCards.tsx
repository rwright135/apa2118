import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult; viewMode: 'today' | 'age65' }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function ScenarioCard({
  summary,
  viewMode,
  isBaseline,
}: {
  summary: Pick<ScenarioSummary, 'label' | 'presentValueTotal' | 'retirementBalanceAt65' | 'scenarioId'>
  viewMode: 'today' | 'age65'
  isBaseline?: boolean
}) {
  const value = viewMode === 'today' ? summary.presentValueTotal : summary.retirementBalanceAt65
  const sublabel = viewMode === 'today' ? 'Total Present Value' : 'Est. Value at Age 65'
  const chip =
    summary.scenarioId === 'A' ? 'Scenario A' :
    summary.scenarioId === 'VOTE_NO_EXPECTED' ? 'Expected Vote No' :
    summary.scenarioId === 'B' ? 'Scenario B' : 'Scenario C'

  return (
    <div
      className="rounded-2xl p-5"
      style={
        isBaseline
          ? { background: 'var(--chip-bg)', border: '2px solid var(--gold)' }
          : { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }
      }
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-1"
        style={{ color: isBaseline ? 'var(--gold)' : 'var(--text-faint)' }}
      >
        {chip}
      </div>
      <div className="font-bold text-base mb-3" style={{ color: 'var(--text-base)' }}>
        {summary.label}
      </div>
      <div className="text-3xl font-black" style={{ color: isBaseline ? 'var(--gold)' : 'var(--text-base)' }}>
        {fmt(value)}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{sublabel}</div>
    </div>
  )
}

export function HeroCards({ results, viewMode }: Props) {
  const scenarioA = results.scenarios.find(s => s.scenarioId === 'A')!
  const expected = results.voteNoExpected

  const diff = viewMode === 'today'
    ? scenarioA.presentValueTotal - expected.presentValueTotal
    : scenarioA.retirementBalanceAt65 - expected.retirementBalanceAt65
  const aIsBetter = diff > 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <ScenarioCard summary={scenarioA} viewMode={viewMode} isBaseline />
        <ScenarioCard summary={expected} viewMode={viewMode} />
      </div>

      <div
        className="rounded-xl p-4 text-center"
        style={
          aIsBetter
            ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }
            : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }
        }
      >
        <div
          className="text-xl font-black"
          style={{ color: aIsBetter ? 'var(--positive)' : 'var(--negative)' }}
        >
          {aIsBetter ? '+' : ''}{fmt(diff)}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {aIsBetter
            ? "Vote Yes is worth more in today's dollars"
            : "Expected Vote No path is worth more in today's dollars"}
        </div>
      </div>
    </div>
  )
}
