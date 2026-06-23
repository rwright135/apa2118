import { useState } from 'react'
import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function BreakdownCard({
  s,
  accentColor,
  label,
  sublabel,
}: {
  s: ScenarioSummary
  accentColor: string
  label: string
  sublabel: string
}) {
  const rows = [
    {
      label: 'Value in Today\'s Dollars',
      value: fmt(s.presentValueTotal),
      sub: 'All cash flows discounted — money now beats money later',
      icon: '⭐', highlight: true,
    },
    { label: 'Projected Retirement Balance', value: fmt(s.retirementBalanceAt65), sub: '401(k) contributions compounded to age 65',   icon: '🏦', highlight: false },
    { label: 'Total Gross Pay (nominal)',     value: fmt(s.totalGrossPay),         sub: 'Undiscounted — does not account for timing',  icon: '✈️', highlight: false },
    { label: 'Profit Sharing (nominal)',      value: fmt(s.totalProfitSharing),    sub: 'Semi-annual payouts, scales with pay rate',   icon: '📈', highlight: false },
    { label: 'Retention Bonus (nominal)',     value: fmt(s.totalRetention),        sub: 'Accrual + payout, probability-weighted',      icon: '💰', highlight: false },
  ]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="font-bold text-base" style={{ color: accentColor }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{sublabel}</div>
      </div>
      <div>
        {rows.map(({ label: rowLabel, value, sub, icon, highlight }) => (
          <div
            key={rowLabel}
            className="px-4 py-3 border-b last:border-b-0"
            style={{ borderColor: 'var(--border-subtle)', background: highlight ? 'var(--bg-elevated)' : undefined }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="mt-0.5 text-base shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div className="text-sm leading-tight" style={{ color: highlight ? 'var(--text-base)' : 'var(--text-muted)', fontWeight: highlight ? 600 : 400 }}>
                    {rowLabel}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub}</div>
                </div>
              </div>
              <div className="text-sm font-bold whitespace-nowrap" style={{ color: highlight ? accentColor : 'var(--text-base)' }}>
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeightingRow({ label, weight, color, pv }: { label: string; weight: number; color: string; pv: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>
          ×{(weight * 100).toFixed(0)}%
        </span>
      </div>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>{pv}</span>
    </div>
  )
}

export function ScenarioBreakdown({ results }: Props) {
  const [showWeighting, setShowWeighting] = useState(false)

  const scenarioA = results.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = results.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = results.scenarios.find(s => s.scenarioId === 'C')!
  const voteNo    = results.voteNoExpected
  const p         = results.inputs.voteNoOffer.probability

  const val = (s: ScenarioSummary) => s.presentValueTotal

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Scenario Breakdown
      </h2>

      {/* Two primary cards */}
      <BreakdownCard
        s={scenarioA}
        accentColor="var(--gold)"
        label="Vote Yes — Accept the TA"
        sublabel="Guaranteed: TA rates effective July 1, 2026"
      />
      <BreakdownCard
        s={voteNo}
        accentColor="var(--navy)"
        label="Vote No — Expected Value"
        sublabel={`Probability-weighted: ${Math.round(p * 100)}% chance of 2nd offer, ${Math.round((1 - p) * 100)}% no offer`}
      />

      {/* Vote No weighting detail — collapsible */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setShowWeighting(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          <span>How Vote No is calculated</span>
          <span style={{ color: 'var(--accent)' }}>{showWeighting ? '↑ Hide' : '↓ Show'}</span>
        </button>

        {showWeighting && (
          <div className="px-4 py-2" style={{ background: 'var(--bg-surface)' }}>
            <div className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              Vote No = (Scenario B × {Math.round(p * 100)}%) + (Scenario C × {Math.round((1 - p) * 100)}%)
            </div>
            <WeightingRow
              label="Scenario B — 2nd bridge offer arrives"
              weight={p}
              color="#a855f7"
              pv={fmt(val(scenarioB))}
            />
            <WeightingRow
              label="Scenario C — No offer, stay on CBA until JCBA"
              weight={1 - p}
              color="#ef4444"
              pv={fmt(val(scenarioC))}
            />
            <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>Weighted Vote No</span>
              <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>{fmt(val(voteNo))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
