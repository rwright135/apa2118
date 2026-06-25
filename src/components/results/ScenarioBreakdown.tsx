import { useState } from 'react'
import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

// ── Row definitions ───────────────────────────────────────────────────────────

interface StatDef {
  label: string
  sub: string
  getYes: (s: ScenarioSummary) => number
  getNo:  (s: ScenarioSummary) => number
  highlight?: boolean
}

const STATS: StatDef[] = [
  {
    label: "Pre-JCBA Total",
    sub:   "Present value · decision window only",
    getYes: s => s.preJcbaTotal,
    getNo:  s => s.preJcbaTotal,
    highlight: true,
  },
  {
    label: "Projected Retirement Balance",
    sub:   "401(k) compounded to age 65",
    getYes: s => s.retirementBalanceAt65,
    getNo:  s => s.retirementBalanceAt65,
  },
  {
    label: "Total Gross Pay",
    sub:   "Nominal — does not account for timing",
    getYes: s => s.totalGrossPay,
    getNo:  s => s.totalGrossPay,
  },
  {
    label: "Profit Sharing",
    sub:   "Semi-annual · scales with pay rate",
    getYes: s => s.totalProfitSharing,
    getNo:  s => s.totalProfitSharing,
  },
  {
    label: "Retention Bonus",
    sub:   "Probability-weighted",
    getYes: s => s.totalRetention,
    getNo:  s => s.totalRetention,
  },
]

// ── Per-scenario rows inside the shared table body ────────────────────────────

function ScenarioRows({
  result,
  index,
  showHeader,
}: {
  result: ComparisonResult
  index:  number
  showHeader: boolean
}) {
  const [open, setOpen] = useState(false)

  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const voteNo    = result.voteNoExpected
  const vns       = result.voteNoScenario
  const p         = vns.probability

  return (
    <>
      {/* Scenario section header */}
      {showHeader && (
        <tr style={{ background: 'var(--bg-elevated)' }}>
          <td
            colSpan={3}
            className="px-4 py-2 text-xs font-semibold"
            style={{ color: 'var(--text-muted)', borderTop: index > 0 ? '2px solid var(--border)' : undefined }}
          >
            Scenario {index + 1}
            <span className="ml-2 font-normal" style={{ color: 'var(--text-faint)' }}>
              {Math.round(p * 100)}% offer · {vns.arrivalMonths}mo arrival · +{(vns.percentAboveTA * 100).toFixed(0)}% above TA · JCBA {vns.jcbaDurationMonths}mo
            </span>
          </td>
        </tr>
      )}

      {/* Stat rows */}
      {STATS.map(stat => {
        const yesVal = stat.getYes(scenarioA)
        const noVal  = stat.getNo(voteNo)
        return (
          <tr
            key={stat.label}
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              background: stat.highlight ? 'var(--bg-elevated)' : undefined,
            }}
          >
            <td className="px-4 py-3">
              <div
                className="text-sm leading-snug"
                style={{ color: stat.highlight ? 'var(--text-base)' : 'var(--text-muted)', fontWeight: stat.highlight ? 600 : 400 }}
              >
                {stat.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{stat.sub}</div>
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <span className="text-sm font-semibold tabular-nums" style={{ color: stat.highlight ? 'var(--gold)' : 'var(--text-base)' }}>
                {fmt(yesVal)}
              </span>
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-base)' }}>
                {fmt(noVal)}
              </span>
            </td>
          </tr>
        )
      })}

      {/* How Vote No is weighted — toggle row */}
      <tr
        style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        onClick={() => setOpen(v => !v)}
      >
        <td colSpan={3} className="px-4 py-2.5">
          <span className="text-xs" style={{ color: 'var(--accent)' }}>
            {open ? '↑ Hide' : '↓ How Vote No expected value is calculated'}
          </span>
        </td>
      </tr>

      {/* Expanded weighting detail */}
      {open && (
        <>
          <tr style={{ background: 'var(--bg-elevated)' }}>
            <td colSpan={3} className="px-4 pt-3 pb-1">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                Vote No = (Outcome B × {Math.round(p * 100)}%) + (Outcome C × {Math.round((1 - p) * 100)}%)
              </p>
            </td>
          </tr>
          {[
            { label: 'Outcome B — 2nd bridge offer arrives', weight: p,       pv: scenarioB.preJcbaTotal },
            { label: 'Outcome C — No offer, stay on CBA until JCBA',   weight: 1 - p, pv: scenarioC.preJcbaTotal },
          ].map(({ label, weight, pv }) => (
            <tr key={label} style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {label}
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: 'var(--bg-surface)', color: 'var(--text-faint)' }}>
                  ×{Math.round(weight * 100)}%
                </span>
              </td>
              <td />
              <td className="px-4 py-2 text-right text-sm font-semibold tabular-nums" style={{ color: 'var(--text-base)' }}>
                {fmt(pv)}
              </td>
            </tr>
          ))}
          <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
            <td className="px-4 py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Weighted Vote No total
            </td>
            <td />
            <td className="px-4 py-2 text-right text-sm font-bold tabular-nums" style={{ color: 'var(--text-base)' }}>
              {fmt(voteNo.preJcbaTotal)}
            </td>
          </tr>
        </>
      )}
    </>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function ScenarioBreakdown({ results }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Breakdown
      </h2>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <table className="w-full" style={{ background: 'var(--bg-surface)' }}>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: 'var(--text-faint)' }} />
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
                Vote Yes
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                Vote No
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, i) => (
              <ScenarioRows
                key={i}
                result={result}
                index={i}
                showHeader={results.length > 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
