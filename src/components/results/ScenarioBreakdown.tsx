import { useState } from 'react'
import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

const SCENARIO_COLORS = ['#a855f7', '#22c55e', '#f59e0b']
const SCENARIO_LABELS = ['Scenario 1', 'Scenario 2', 'Scenario 3']

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
      label: 'Pre-JCBA Value (Today\'s Dollars)',
      value: fmt(s.preJcbaTotal),
      sub: 'PV of all cash flows in the decision window only',
      icon: '⭐', highlight: true,
    },
    { label: 'Projected Retirement Balance', value: fmt(s.retirementBalanceAt65), sub: '401(k) contributions compounded to age 65',   icon: '🏦', highlight: false },
    { label: 'Total Gross Pay (nominal)',     value: fmt(s.totalGrossPay),         sub: 'Undiscounted — does not account for timing',  icon: '✈️', highlight: false },
    { label: 'Profit Sharing (nominal)',      value: fmt(s.totalProfitSharing),    sub: 'Semi-annual payouts, scales with pay rate',   icon: '📈', highlight: false },
    { label: 'Retention Bonus (nominal)',     value: fmt(s.totalRetention),        sub: 'Accrual + payout, probability-weighted',      icon: '💰', highlight: false },
  ]

  return (
    <div className="rounded-2xl overflow-hidden flex-1 min-w-[260px]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="font-bold text-sm" style={{ color: accentColor }}>{label}</div>
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

function SingleScenarioBreakdown({ result, index, showLabel }: { result: ComparisonResult; index: number; showLabel: boolean }) {
  const [showWeighting, setShowWeighting] = useState(false)

  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const voteNo    = result.voteNoExpected
  const vns       = result.voteNoScenario
  const p         = vns.probability
  const color     = SCENARIO_COLORS[index]

  return (
    <div className="space-y-4">
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="font-bold text-sm" style={{ color }}>{SCENARIO_LABELS[index]}</span>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {Math.round(p * 100)}% offer · {vns.arrivalMonths}mo · +{(vns.percentAboveTA * 100).toFixed(0)}% · JCBA {vns.jcbaDurationMonths}mo
          </span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-1">
        <BreakdownCard
          s={scenarioA}
          accentColor="var(--gold)"
          label="Vote Yes — Accept the TA"
          sublabel="Guaranteed: TA rates effective July 1, 2026"
        />
        <BreakdownCard
          s={voteNo}
          accentColor={color}
          label="Vote No — Expected Value"
          sublabel={`${Math.round(p * 100)}% 2nd offer · ${Math.round((1 - p) * 100)}% no offer · JCBA ${vns.jcbaDurationMonths}mo`}
        />
      </div>

      {/* Weighting detail */}
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
              pv={fmt(scenarioB.preJcbaTotal)}
            />
            <WeightingRow
              label="Scenario C — No offer, stay on CBA until JCBA"
              weight={1 - p}
              color="#ef4444"
              pv={fmt(scenarioC.preJcbaTotal)}
            />
            <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>Weighted Vote No</span>
              <span className="text-sm font-bold" style={{ color }}>{fmt(voteNo.preJcbaTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ScenarioBreakdown({ results }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Scenario Breakdown
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
