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

const SCENARIO_COLORS: Record<string, string> = {
  A: 'text-blue-400',
  B: 'text-purple-400',
  C: 'text-red-400',
  VOTE_NO_EXPECTED: 'text-amber-400',
}

function SummaryCard({ s, viewMode }: { s: ScenarioSummary; viewMode: 'today' | 'age65' }) {
  const rows = [
    {
      label: 'Projected Retirement Balance (age 65)',
      value: fmt(s.retirementBalanceAt65),
      sub: `PV today: ${fmt(s.retirementBalancePV)}`,
      icon: '🏦',
      highlight: false,
    },
    {
      label: 'Extra Interim Earnings (before JCBA)',
      value: fmt(s.interimEarningsPV),
      sub: 'Present value of pre-JCBA pay',
      icon: '💰',
      highlight: false,
    },
    {
      label: 'Extra Growth from 401(k) Timing',
      value: fmt(s.total401kCompoundingGain),
      sub: 'Compounding gain vs. no-contribution baseline',
      icon: '📈',
      highlight: false,
    },
    {
      label: 'Total Present Value',
      value: fmt(viewMode === 'today' ? s.presentValueTotal : s.retirementBalanceAt65),
      sub: viewMode === 'today' ? "All cash flows in today's dollars" : 'Estimated value at age 65',
      icon: '⭐',
      highlight: true,
    },
  ]

  const colorClass = SCENARIO_COLORS[s.scenarioId] || 'text-white'

  return (
    <div className="bg-[#1a2235] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className={`font-bold text-base ${colorClass}`}>{s.label}</div>
          <div className="text-xs text-gray-500">{s.description}</div>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map(({ label, value, sub, icon, highlight }) => (
          <div key={label} className={`px-4 py-3 ${highlight ? 'bg-white/[0.03]' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="mt-0.5 text-base shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div className={`text-sm ${highlight ? 'text-white font-semibold' : 'text-gray-300'} leading-tight`}>{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
                </div>
              </div>
              <div className={`font-bold text-sm whitespace-nowrap ${highlight ? colorClass : 'text-white'}`}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ScenarioBreakdown({ results, viewMode }: Props) {
  const all = [...results.scenarios, results.voteNoExpected]

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-white text-sm uppercase tracking-wide">Scenario Breakdown</h2>
      {all.map(s => (
        <SummaryCard key={s.scenarioId} s={s} viewMode={viewMode} />
      ))}
    </div>
  )
}
