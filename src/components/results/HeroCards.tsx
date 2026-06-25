import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function pvTotal(s: ScenarioSummary) {
  return s.preJcbaTotal
}

const SCENARIO_COLORS = ['#a855f7', '#22c55e', '#f59e0b']
const SCENARIO_LABELS = ['Scenario 1', 'Scenario 2', 'Scenario 3']

function ScenarioColumn({
  result,
  index,
}: {
  result: ComparisonResult
  index: number
}) {
  const scenarioA  = result.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo     = result.voteNoExpected
  const vns        = result.voteNoScenario
  const color      = SCENARIO_COLORS[index]
  const label      = SCENARIO_LABELS[index]

  const aVal  = pvTotal(scenarioA)
  const noVal = pvTotal(voteNo)
  const diff  = aVal - noVal
  const aWins = diff > 0

  return (
    <div className="flex flex-col gap-3 min-w-[280px] flex-1">
      {/* Scenario header */}
      <div
        className="rounded-xl px-3 py-2 text-center"
        style={{ background: 'var(--bg-elevated)', border: `1.5px solid ${color}` }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color }}>
          {label}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {Math.round(vns.probability * 100)}% offer · {vns.arrivalMonths}mo · +{(vns.percentAboveTA * 100).toFixed(0)}% · JCBA {vns.jcbaDurationMonths}mo
        </div>
      </div>

      {/* Vote Yes card */}
      <div
        className="rounded-2xl p-4 flex-1"
        style={{ background: 'var(--chip-bg)', border: '2px solid var(--gold)' }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
          Vote Yes
        </div>
        <div className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          Accept the TA
        </div>
        <div className="text-2xl font-black" style={{ color: 'var(--gold)' }}>
          {fmt(aVal)}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
          Pre-JCBA window (today's dollars)
        </div>
      </div>

      {/* Vote No card */}
      <div
        className="rounded-2xl p-4 flex-1"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>
          Vote No
        </div>
        <div className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          Probability-weighted expected value
        </div>
        <div className="text-2xl font-black" style={{ color: 'var(--text-base)' }}>
          {fmt(noVal)}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
          Pre-JCBA window (today's dollars)
        </div>
      </div>

      {/* Difference callout */}
      <div
        className="rounded-xl p-3 text-center"
        style={
          aWins
            ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }
            : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }
        }
      >
        <div className="text-base font-black" style={{ color: aWins ? 'var(--positive)' : 'var(--negative)' }}>
          {aWins ? '+' : ''}{fmt(diff)}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {aWins ? 'Vote Yes leads' : 'Vote No expected value leads'}
        </div>
      </div>
    </div>
  )
}

export function HeroCards({ results }: Props) {
  const r = results[0].inputs.investmentRate

  return (
    <div className="space-y-4">
      {/* Scrollable columns */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2" style={{ minWidth: results.length === 1 ? '100%' : `${results.length * 296}px` }}>
          {results.map((result, i) => (
            <ScenarioColumn key={i} result={result} index={i} />
          ))}
        </div>
      </div>

      {/* Shared context callout */}
      <div
        className="rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <span style={{ color: 'var(--text-base)', fontWeight: 600 }}>Only the pre-JCBA window counts. </span>
        After the JCBA concludes, all paths converge to the same rates — so those years cancel out.
        {' '}<span style={{ color: 'var(--text-faint)' }}>· {Math.round(r * 100)}% discount rate</span>
      </div>
    </div>
  )
}
