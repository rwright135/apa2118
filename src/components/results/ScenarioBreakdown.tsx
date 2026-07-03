import { Fragment, useState } from 'react'
import type { ComparisonResult, ScenarioSummary } from '../../lib/types'
import { VOTE_NO_CSS, VOTE_YES_CSS } from '../../lib/resultColors'
import { getRetirementDate } from '../../lib/engine'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

/** Full-career (all months through retirement) nominal pay + profit sharing —
 *  NOT discounted, and does NOT include retention. This is intentionally a
 *  bigger number than "Pre-JCBA Total" since it spans your whole career. */
function fullCareerPay(s: ScenarioSummary): number {
  return s.rows.reduce((sum, r) => sum + r.grossPay + r.profitSharingCash, 0)
}

/** Everything that ends up invested and compounding to age 65: 401(k),
 *  the retention bonus once paid out, and brokerage savings from your raise. */
function totalRetirementSavings(s: ScenarioSummary): number {
  return s.retirementBalanceAt65 + s.retirementRetentionBalance + s.retirementBrokerageBalance
}

// ── Row definitions ───────────────────────────────────────────────────────────

interface StatDef {
  label: string
  sub: string
  getYes: (s: ScenarioSummary) => number
  getNo:  (s: ScenarioSummary) => number
  highlight?: boolean
}

function buildStats(jcbaMonth: number, retirementYear: number): StatDef[] {
  return [
    {
      label: `Pre-JCBA Total (~${jcbaMonth} months)`,
      sub: 'Present value, today\'s dollars — pay, profit sharing, retention, 401(k) & brokerage through JCBA ratification',
      getYes: s => s.preJcbaTotal,
      getNo:  s => s.preJcbaTotal,
      highlight: true,
    },
    {
      label: 'Full-Career Pay',
      sub: `Nominal (not discounted) — total pay + profit sharing through retirement in ${retirementYear}. Does not include the retention bonus, so this is bigger than the Pre-JCBA Total above.`,
      getYes: s => fullCareerPay(s),
      getNo:  s => fullCareerPay(s),
    },
    {
      label: 'Retention Bonus Payout',
      sub: 'Probability-weighted lump sum',
      getYes: s => s.totalRetention,
      getNo:  s => s.totalRetention,
    },
    {
      label: `Total Retirement Savings (Age 65 · ${retirementYear})`,
      sub: '401(k) + retention bonus + brokerage savings, all compounded to retirement — nominal value',
      getYes: s => totalRetirementSavings(s),
      getNo:  s => totalRetirementSavings(s),
    },
  ]
}

// ── Sub-breakdown for the combined retirement row ─────────────────────────────

function RetirementSavingsDetail({ yes, no }: { yes: ScenarioSummary; no: ScenarioSummary }) {
  const rows: { label: string; getYes: (s: ScenarioSummary) => number; getNo: (s: ScenarioSummary) => number }[] = [
    { label: '401(k)',              getYes: s => s.retirementBalanceAt65,      getNo: s => s.retirementBalanceAt65 },
    { label: 'Retention (invested)', getYes: s => s.retirementRetentionBalance, getNo: s => s.retirementRetentionBalance },
    { label: 'Brokerage (invested)', getYes: s => s.retirementBrokerageBalance, getNo: s => s.retirementBrokerageBalance },
  ]
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td colSpan={3} className="px-4 pb-3 pt-0">
        <div className="rounded-lg px-3 py-2 space-y-1.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between text-xs gap-4">
              <span style={{ color: 'var(--text-faint)' }}>{r.label}</span>
              <div className="flex gap-6 tabular-nums">
                <span style={{ color: VOTE_YES_CSS, width: '5.5rem', textAlign: 'right' }}>{fmt(r.getYes(yes))}</span>
                <span style={{ color: VOTE_NO_CSS, width: '5.5rem', textAlign: 'right' }}>{fmt(r.getNo(no))}</span>
              </div>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}

// ── Rows inside the shared table body ─────────────────────────────────────────

function ScenarioStatRows({ result }: { result: ComparisonResult }) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = result.voteNoExpected
  const jcbaMonth = result.voteNoScenario.jcbaDurationMonths
  const retirementYear = getRetirementDate(result.inputs.dateOfBirth).getFullYear()
  const stats = buildStats(jcbaMonth, retirementYear)

  return (
    <>
      {stats.map(stat => {
        const yesVal = stat.getYes(scenarioA)
        const noVal  = stat.getNo(voteNo)
        const isRetirementRow = stat.label.startsWith('Total Retirement Savings')
        return (
          <Fragment key={stat.label}>
            <tr
              style={{
                borderBottom: isRetirementRow ? undefined : '1px solid var(--border-subtle)',
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
                <div className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-faint)' }}>{stat.sub}</div>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap align-top">
                <span className="text-sm font-semibold tabular-nums" style={{ color: stat.highlight ? VOTE_YES_CSS : 'var(--text-base)' }}>
                  {fmt(yesVal)}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap align-top">
                <span className="text-sm font-semibold tabular-nums" style={{ color: VOTE_NO_CSS }}>
                  {fmt(noVal)}
                </span>
              </td>
            </tr>
            {isRetirementRow && <RetirementSavingsDetail yes={scenarioA} no={voteNo} />}
          </Fragment>
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

/** Full breakdown table — rendered ONLY for the user's own assumptions
 *  scenario (results[0]). Benchmark scenarios (Average / Worst Case) already
 *  get their own headline cards elsewhere; a duplicate table per scenario
 *  here was too much information. */
export function ScenarioBreakdown({ results }: Props) {
  const result = results[0]

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Your Full Breakdown
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
          These numbers tie directly to the Month-by-Month Detail table below — expand it to verify.
        </p>
      </div>

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
            <ScenarioStatRows result={result} />
          </tbody>
        </table>

        <ScenarioWeightingDetail result={result} />
      </div>
    </div>
  )
}
