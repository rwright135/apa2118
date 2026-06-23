import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult; viewMode: 'today' | 'age65' }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

const SCENARIO_CSS_COLOR: Record<string, string> = {
  A: 'var(--gold)',
  B: '#a855f7',
  C: 'var(--negative)',
  VOTE_NO_EXPECTED: 'var(--warning)',
}

function SummaryCard({ s, viewMode }: { s: ScenarioSummary; viewMode: 'today' | 'age65' }) {
  const accentColor = SCENARIO_CSS_COLOR[s.scenarioId] || 'var(--text-base)'

  const rows = [
    {
      label: 'Projected Retirement Balance (age 65)',
      value: fmt(s.retirementBalanceAt65),
      sub: `PV today: ${fmt(s.retirementBalancePV)}`,
      icon: '🏦',
      highlight: false,
    },
    {
      label: 'Interim Earnings Before JCBA',
      value: fmt(s.interimEarningsPV),
      sub: 'Present value of pre-JCBA pay',
      icon: '💰',
      highlight: false,
    },
    {
      label: '401(k) Compounding Gain',
      value: fmt(s.total401kCompoundingGain),
      sub: 'Compounding gain vs. zero-contribution baseline',
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

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="font-bold text-base" style={{ color: accentColor }}>{s.label}</div>
        <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{s.description}</div>
      </div>
      <div>
        {rows.map(({ label, value, sub, icon, highlight }) => (
          <div
            key={label}
            className="px-4 py-3 border-b last:border-b-0"
            style={{
              borderColor: 'var(--border-subtle)',
              background: highlight ? 'var(--bg-elevated)' : undefined,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="mt-0.5 text-base shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div
                    className="text-sm leading-tight"
                    style={{
                      color: highlight ? 'var(--text-base)' : 'var(--text-muted)',
                      fontWeight: highlight ? 600 : 400,
                    }}
                  >
                    {label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub}</div>
                </div>
              </div>
              <div
                className="text-sm font-bold whitespace-nowrap"
                style={{ color: highlight ? accentColor : 'var(--text-base)' }}
              >
                {value}
              </div>
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
      <h2
        className="font-semibold text-sm uppercase tracking-wide"
        style={{ color: 'var(--text-muted)' }}
      >
        Scenario Breakdown
      </h2>
      {all.map(s => <SummaryCard key={s.scenarioId} s={s} viewMode={viewMode} />)}
    </div>
  )
}
