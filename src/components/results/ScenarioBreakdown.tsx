import { useState } from 'react'
import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

// ── Stat row ──────────────────────────────────────────────────────────────────

function StatRow({
  label,
  sub,
  yesVal,
  noVal,
  highlight,
}: {
  label: string
  sub: string
  yesVal: number
  noVal: number
  highlight?: boolean
}) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td className="px-4 py-3 pr-6">
        <div className="text-sm leading-snug" style={{ color: highlight ? 'var(--text-base)' : 'var(--text-muted)', fontWeight: highlight ? 600 : 400 }}>
          {label}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub}</div>
      </td>
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <span className="text-sm font-semibold tabular-nums" style={{ color: highlight ? 'var(--gold)' : 'var(--text-base)' }}>
          {fmt(yesVal)}
        </span>
      </td>
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-base)' }}>
          {fmt(noVal)}
        </span>
      </td>
    </tr>
  )
}

function buildStats(yes: ScenarioSummary, no: ScenarioSummary) {
  return [
    {
      label: "Pre-JCBA Total (today's dollars)",
      sub: 'Present value of all cash flows in the decision window',
      yesVal: yes.preJcbaTotal,
      noVal: no.preJcbaTotal,
      highlight: true,
    },
    {
      label: 'Projected Retirement Balance',
      sub: '401(k) contributions compounded to age 65',
      yesVal: yes.retirementBalanceAt65,
      noVal: no.retirementBalanceAt65,
    },
    {
      label: 'Total Gross Pay',
      sub: 'Nominal — does not account for timing',
      yesVal: yes.totalGrossPay,
      noVal: no.totalGrossPay,
    },
    {
      label: 'Profit Sharing',
      sub: 'Semi-annual payouts, scales with pay rate',
      yesVal: yes.totalProfitSharing,
      noVal: no.totalProfitSharing,
    },
    {
      label: 'Retention Bonus',
      sub: 'Probability-weighted accrual and payout',
      yesVal: yes.totalRetention,
      noVal: no.totalRetention,
    },
  ]
}

// ── Single scenario breakdown ─────────────────────────────────────────────────

function SingleScenarioBreakdown({
  result,
  index,
  showLabel,
}: {
  result: ComparisonResult
  index: number
  showLabel: boolean
}) {
  const [showWeighting, setShowWeighting] = useState(false)

  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const voteNo    = result.voteNoExpected
  const vns       = result.voteNoScenario
  const p         = vns.probability

  const stats = buildStats(scenarioA, voteNo)

  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          Scenario {index + 1}{' '}
          <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>
            · {Math.round(p * 100)}% offer · {vns.arrivalMonths}mo · +{(vns.percentAboveTA * 100).toFixed(0)}% · JCBA {vns.jcbaDurationMonths}mo
          </span>
        </div>
      )}

      {/* Stats table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="px-4 py-2.5 text-left text-xs" style={{ color: 'var(--text-faint)' }} />
              <th className="px-4 py-2.5 text-right text-xs font-semibold" style={{ color: 'var(--gold)' }}>Vote Yes</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>Vote No</th>
            </tr>
          </thead>
          <tbody style={{ background: 'var(--bg-surface)' }}>
            {stats.map(s => (
              <StatRow key={s.label} {...s} />
            ))}
          </tbody>
        </table>
      </div>

      {/* How Vote No is calculated */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setShowWeighting(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          <span>How Vote No expected value is calculated</span>
          <span style={{ color: 'var(--accent)' }}>{showWeighting ? '↑ Hide' : '↓ Show'}</span>
        </button>
        {showWeighting && (
          <div className="px-4 py-3" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              Vote No = (Scenario B × {Math.round(p * 100)}%) + (Scenario C × {Math.round((1 - p) * 100)}%)
            </p>
            {[
              { label: `Scenario B — 2nd bridge offer (${Math.round(p * 100)}% weight)`, pv: scenarioB.preJcbaTotal },
              { label: `Scenario C — No offer, wait for JCBA (${Math.round((1 - p) * 100)}% weight)`, pv: scenarioC.preJcbaTotal },
            ].map(({ label, pv }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-base)' }}>{fmt(pv)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Weighted Vote No total</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-base)' }}>{fmt(voteNo.preJcbaTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function ScenarioBreakdown({ results }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Breakdown
      </h2>
      {results.map((result, i) => (
        <SingleScenarioBreakdown
          key={i}
          result={result}
          index={i}
          showLabel={results.length > 1}
        />
      ))}
    </div>
  )
}
