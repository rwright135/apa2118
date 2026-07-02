import { useState } from 'react'
import type { ComparisonResult, ScenarioSummary } from '../../lib/types'
import { SCENARIO_LABELS, VOTE_NO_CSS, VOTE_YES_CSS } from '../../lib/resultColors'

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
    sub:   "Probability-weighted payout",
    getYes: s => s.totalRetention,
    getNo:  s => s.totalRetention,
  },
  {
    label: "Retention at Retirement",
    sub:   "Payout invested & compounded to age 65",
    getYes: s => s.retirementRetentionBalance,
    getNo:  s => s.retirementRetentionBalance,
  },
]

// ── Per-scenario rows inside the shared table body ────────────────────────────

function ScenarioStatRows({
  result,
  index,
  showHeader,
}: {
  result: ComparisonResult
  index:  number
  showHeader: boolean
}) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = result.voteNoExpected
  const vns       = result.voteNoScenario
  const p         = vns.probability

  return (
    <>
      {showHeader && (
        <tr style={{ background: 'var(--bg-elevated)' }}>
          <td
            colSpan={3}
            className="px-4 py-2 text-xs font-semibold"
            style={{ color: 'var(--text-muted)', borderTop: index > 0 ? '2px solid var(--border)' : undefined }}
          >
            {SCENARIO_LABELS[index] ?? `Scenario ${index + 1}`}
            <span className="ml-2 font-normal" style={{ color: 'var(--text-faint)' }}>
              {Math.round(p * 100)}% offer · {vns.arrivalMonths}mo arrival · +{(vns.percentAboveTA * 100).toFixed(0)}% above TA · JCBA {vns.jcbaDurationMonths}mo
            </span>
          </td>
        </tr>
      )}

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
              <span className="text-sm font-semibold tabular-nums" style={{ color: stat.highlight ? VOTE_YES_CSS : 'var(--text-base)' }}>
                {fmt(yesVal)}
              </span>
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <span className="text-sm font-semibold tabular-nums" style={{ color: VOTE_NO_CSS }}>
                {fmt(noVal)}
              </span>
            </td>
          </tr>
        )
      })}
    </>
  )
}

function ScenarioWeightingDetail({ result }: { result: ComparisonResult }) {
  const [open, setOpen] = useState(true)

  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const voteNo    = result.voteNoExpected
  const p         = result.voteNoScenario.probability

  return (
    <div className="border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            How Vote No expected value is calculated
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="var(--text-faint)"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              flexShrink: 0,
            }}
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-2" style={{ background: 'var(--bg-elevated)' }}>
          <p className="text-xs leading-relaxed px-1" style={{ color: 'var(--text-faint)' }}>
            Vote No = (Vote No (Offer) × {Math.round(p * 100)}%) + (Vote No (JCBA) × {Math.round((1 - p) * 100)}%)
          </p>
          {[
            { label: 'Vote No (Offer) — 2nd bridge offer arrives', weight: p, pv: scenarioB.preJcbaTotal },
            { label: 'Vote No (JCBA) — No offer, stay on CBA until JCBA', weight: 1 - p, pv: scenarioC.preJcbaTotal },
          ].map(({ label, weight, pv }) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 rounded-lg px-3 py-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="min-w-0 text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                {label}
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>
                  ×{Math.round(weight * 100)}%
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: 'var(--text-base)' }}>
                {fmt(pv)}
              </span>
            </div>
          ))}
          <div
            className="flex items-center justify-between gap-4 rounded-lg px-3 py-2"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Weighted Vote No total
            </span>
            <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--text-base)' }}>
              {fmt(voteNo.preJcbaTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

function BreakdownBlock({
  result,
  index,
  showHeader,
}: {
  result: ComparisonResult
  index: number
  showHeader: boolean
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <table className="w-full table-fixed" style={{ background: 'var(--bg-surface)' }}>
        <colgroup>
          <col />
          <col style={{ width: '7.5rem' }} />
          <col style={{ width: '7.5rem' }} />
        </colgroup>
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: 'var(--text-faint)' }} />
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: VOTE_YES_CSS }}>
              Vote Yes
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: VOTE_NO_CSS }}>
              Vote No
            </th>
          </tr>
        </thead>
        <tbody>
          <ScenarioStatRows result={result} index={index} showHeader={showHeader} />
        </tbody>
      </table>

      <ScenarioWeightingDetail result={result} />
    </div>
  )
}

export function ScenarioBreakdown({ results }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Breakdown
      </h2>

      {results.length === 1 ? (
        <BreakdownBlock result={results[0]} index={0} showHeader={false} />
      ) : (
        results.map((result, i) => (
          <BreakdownBlock key={i} result={result} index={i} showHeader />
        ))
      )}
    </div>
  )
}
