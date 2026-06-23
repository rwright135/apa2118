import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props {
  results: ComparisonResult
  viewMode: 'today' | 'age65'
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function ScenarioCard({ summary, viewMode, isBaseline }: {
  summary: Pick<ScenarioSummary, 'label' | 'presentValueTotal' | 'retirementBalanceAt65' | 'scenarioId'>
  viewMode: 'today' | 'age65'
  isBaseline?: boolean
}) {
  const value = viewMode === 'today' ? summary.presentValueTotal : summary.retirementBalanceAt65
  const label = viewMode === 'today' ? 'Total Present Value' : 'Est. Value at Age 65'

  const scenarioLabel =
    summary.scenarioId === 'A' ? 'Scenario A' :
    summary.scenarioId === 'VOTE_NO_EXPECTED' ? 'Expected Vote No' :
    summary.scenarioId === 'B' ? 'Scenario B' : 'Scenario C'

  return (
    <div className={`rounded-2xl p-5 border ${
      isBaseline
        ? 'bg-blue-600/10 border-blue-500/30'
        : 'bg-[#1a2235] border-white/5'
    }`}>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
        isBaseline ? 'text-blue-400' : 'text-gray-500'
      }`}>{scenarioLabel}</div>
      <div className="font-bold text-white text-base mb-3">{summary.label}</div>
      <div className={`text-3xl font-black ${isBaseline ? 'text-blue-400' : 'text-white'}`}>
        {fmt(value)}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

export function HeroCards({ results, viewMode }: Props) {
  const scenarioA = results.scenarios.find(s => s.scenarioId === 'A')!
  const expected = results.voteNoExpected

  const todayDiff = scenarioA.presentValueTotal - expected.presentValueTotal
  const age65Diff = scenarioA.retirementBalanceAt65 - expected.retirementBalanceAt65
  const diff = viewMode === 'today' ? todayDiff : age65Diff
  const aIsBetter = diff > 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <ScenarioCard summary={scenarioA} viewMode={viewMode} isBaseline />
        <ScenarioCard summary={expected} viewMode={viewMode} />
      </div>

      {/* Difference callout */}
      <div className={`rounded-xl p-4 border text-center ${
        aIsBetter
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className={`text-lg font-black ${aIsBetter ? 'text-green-400' : 'text-red-400'}`}>
          {aIsBetter ? '+' : ''}{fmt(diff)}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {aIsBetter
            ? "Vote Yes is worth more (in today's dollars)"
            : "Expected Vote No path is worth more (in today's dollars)"}
        </div>
      </div>
    </div>
  )
}
