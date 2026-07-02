import { useState } from 'react'
import type { ComparisonResult, MonthlyRow } from '../../lib/types'
import { SCENARIO_LABELS, VOTE_NO_CSS, VOTE_NO_DIM_CSS } from '../../lib/resultColors'
import { useResultChartColors } from './useResultChartColors'

interface Props { results: ComparisonResult[] }

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmt(n: number)     { return `$${Math.round(n).toLocaleString()}` }
function fmtRate(n: number) { return `$${n.toFixed(2)}` }
function fmtPct(n: number)  { return `${(n * 100).toFixed(0)}%` }

type ColumnKey = 'grossPay' | 'k401Contribution' | 'profitSharingCash' | 'retentionCashFlow' | 'brokerageSavingsCash' | 'presentValue' | 'cumulativePV'
type TabId = 'YES' | 'NO' | 'B' | 'C'

const SCENARIO_COLORS_FALLBACK = ['#c9a84c', '#3b82f6', '#ef4444']

const TAB_STYLES: Record<TabId, { active: React.CSSProperties; inactive: React.CSSProperties; label: string }> = {
  YES: { label: 'Vote Yes',         active: { background: 'rgba(201,168,76,0.15)', border: '1px solid var(--gold)',     color: 'var(--gold)'     }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' } },
  NO:  { label: 'Vote No (blended)',active: { background: VOTE_NO_DIM_CSS, border: `1px solid ${VOTE_NO_CSS}`, color: VOTE_NO_CSS }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' } },
  B:   { label: 'Vote No (Offer)', active: { background: 'rgba(168,85,247,0.12)', border: '1px solid #a855f7',        color: '#a855f7'         }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-faint)'  } },
  C:   { label: 'Vote No (JCBA)',  active: { background: 'rgba(239,68,68,0.12)', border: '1px solid var(--negative)', color: 'var(--negative)' }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-faint)'  } },
}

// ── Retention bonus detail sub-table ─────────────────────────────────────────

interface RetentionDetailRow {
  month: string
  accrual: number
  runningBalance: number
  probability: number
  cashFlow: number
  pvCashFlow: number
  atRetirement: number
  isPayout: boolean
}

function buildRetentionDetail(rows: MonthlyRow[], startingBalance: number, probability: number): RetentionDetailRow[] {
  const result: RetentionDetailRow[] = []
  let running = startingBalance
  for (const row of rows) {
    const hasMeaningfulActivity = row.retentionAccrualNote > 0.01 || row.retentionCashFlow > 0.01
    if (!hasMeaningfulActivity) continue
    running += row.retentionAccrualNote
    result.push({
      month:          `${MONTHS_SHORT[row.month]} ${row.year}`,
      accrual:        row.retentionAccrualNote,
      runningBalance: running,
      probability,
      cashFlow:       row.retentionCashFlow,
      pvCashFlow:     row.retentionCashFlow > 0 ? row.retentionCashFlow * row.discountFactor : 0,
      atRetirement:   row.retentionAtRetirement,
      isPayout:       row.retentionCashFlow > 0.01,
    })
  }
  return result
}

function RetentionDetail({ rows, startingBalance, probability, isVoteYes }: {
  rows: MonthlyRow[]
  startingBalance: number
  probability: number
  isVoteYes: boolean
}) {
  const [retExpanded, setRetExpanded] = useState(false)
  const detail = buildRetentionDetail(rows, startingBalance, probability)
  if (!detail.length) return null
  const previewRows = isVoteYes ? detail : detail.slice(0, retExpanded ? detail.length : 4)
  const hasMore     = !isVoteYes && detail.length > 4
  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
        style={{ background: 'var(--bg-elevated)' }}
        onClick={() => !isVoteYes && setRetExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            💰 Retention Bonus Tracker
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--chip-bg)', color: 'var(--chip-text)', border: '1px solid var(--chip-border)' }}>
            {fmtPct(probability)} payout certainty
          </span>
        </div>
        {!isVoteYes && (
          <span className="text-xs" style={{ color: 'var(--accent)' }}>
            {retExpanded ? '↑ Collapse' : `↓ Show all ${detail.length} months`}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="text-left  px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Month</th>
              {!isVoteYes && <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Monthly Accrual</th>}
              {!isVoteYes && <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Running Balance</th>}
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>× Probability</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Cash Flow</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--gold)' }}>PV Today</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--gold)' }}>💼 At Retirement</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((r, i) => (
              <tr
                key={r.month}
                style={{
                  background: r.isPayout ? 'rgba(34,197,94,0.06)' : i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                  borderTop: r.isPayout ? '1px solid rgba(34,197,94,0.2)' : undefined,
                }}
              >
                <td className="px-3 py-2 font-medium whitespace-nowrap" style={{ color: r.isPayout ? 'var(--positive)' : 'var(--text-muted)' }}>
                  {r.month}{r.isPayout ? ' ✓ Payout' : ''}
                </td>
                {!isVoteYes && (
                  <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: r.accrual > 0 ? 'var(--text-base)' : 'var(--text-faint)' }}>
                    {r.accrual > 0 ? `+${fmt(r.accrual)}` : '—'}
                  </td>
                )}
                {!isVoteYes && (
                  <td className="px-3 py-2 text-right whitespace-nowrap font-medium" style={{ color: 'var(--text-base)' }}>
                    {fmt(r.runningBalance)}
                  </td>
                )}
                <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>{fmtPct(r.probability)}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap font-semibold" style={{ color: r.cashFlow > 0 ? 'var(--positive)' : 'var(--text-faint)' }}>
                  {r.cashFlow > 0 ? fmt(r.cashFlow) : '—'}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap font-bold" style={{ color: r.pvCashFlow > 0 ? 'var(--gold)' : 'var(--text-faint)' }}>
                  {r.pvCashFlow > 0 ? fmt(r.pvCashFlow) : '—'}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap font-bold" style={{ color: r.atRetirement > 0 ? 'var(--gold)' : 'var(--text-faint)' }}>
                  {r.atRetirement > 0 ? fmt(r.atRetirement) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && !retExpanded && (
        <div className="px-3 py-2 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => setRetExpanded(true)}>
            Show {detail.length - 4} more months of accrual
          </button>
        </div>
      )}
    </div>
  )
}

// ── Inner table for one ComparisonResult ──────────────────────────────────────

function ResultTable({ result }: { result: ComparisonResult }) {
  const [expanded, setExpanded]           = useState(false)
  const [activeTab, setActiveTab]         = useState<TabId>('YES')
  const [applyWeight, setApplyWeight]     = useState(true)

  const tabToScenario: Record<TabId, string> = { YES: 'A', NO: 'VOTE_NO_EXPECTED', B: 'B', C: 'C' }
  const scenarioId = tabToScenario[activeTab]

  const allSummaries = [...result.scenarios, result.voteNoExpected]
  const summary = allSummaries.find(s => s.scenarioId === scenarioId)
  if (!summary) return null

  const jcbaMonth = result.voteNoScenario.jcbaDurationMonths
  const { rows, steadyStateIndex } = summary

  // Same definitions used in the "Your Full Breakdown" card — kept in sync so
  // the two are directly comparable when this table is expanded.
  const fullCareerPayNominal = rows.reduce((sum, r) => sum + r.grossPay + r.profitSharingCash, 0)
  const totalRetirementSavingsNominal =
    summary.retirementBalanceAt65 + summary.retirementRetentionBalance + summary.retirementBrokerageBalance

  const p = result.voteNoScenario.probability
  // Weight to apply when "show probability-weighted" is on
  const scenarioWeight = activeTab === 'B' ? p : activeTab === 'C' ? 1 - p : 1
  const isScenarioTab  = activeTab === 'B' || activeTab === 'C'
  const weight = (isScenarioTab && applyWeight) ? scenarioWeight : 1

  const preJcbaRows = rows.slice(0, jcbaMonth)
  // Retention for Scenario C pays ~60 days after JCBA; include those post-JCBA months in the table.
  const postJcbaRetentionRows = rows.filter(
    r => r.monthIndex >= jcbaMonth && (r.retentionCashFlow > 0 || r.retentionAccrualNote > 0.01)
  )
  const allTableRows = postJcbaRetentionRows.length > 0
    ? [...preJcbaRows, ...postJcbaRetentionRows]
    : preJcbaRows

  const displayRows = expanded
    ? allTableRows
    : (() => {
        const preSteady = preJcbaRows.slice(0, steadyStateIndex + 1)
        return postJcbaRetentionRows.length > 0
          ? [...preSteady, ...postJcbaRetentionRows]
          : preSteady
      })()
  const hasMore      = preJcbaRows.length > steadyStateIndex + 1
  const isVoteYes    = activeTab === 'YES'

  const prob = isVoteYes ? 1
    : activeTab === 'B' ? result.inputs.retentionPayoutProbabilityB
    : result.inputs.retentionPayoutProbabilityC

  const columns: { key: ColumnKey; label: string; gold?: boolean; voteYesOnly?: boolean }[] = [
    { key: 'grossPay',             label: 'Gross Pay' },
    { key: 'k401Contribution',     label: '401(k) contrib' },
    { key: 'profitSharingCash',    label: 'Profit Share' },
    { key: 'retentionCashFlow',    label: 'Retention' },
    { key: 'brokerageSavingsCash', label: 'Brokerage', gold: true, voteYesOnly: false },
    { key: 'presentValue',         label: 'PV', gold: true },
    { key: 'cumulativePV',         label: 'Cum. Total PV', gold: true },
  ]

  return (
    <div>
      {/* Inner tabs */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{rows.length} months total</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['YES', 'NO'] as const).map(id => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={activeTab === id ? TAB_STYLES[id].active : TAB_STYLES[id].inactive}
            >
              {TAB_STYLES[id].label}
            </button>
          ))}
          <span className="w-px self-stretch" style={{ background: 'var(--border)', margin: '0 2px' }} />
          {(['B', 'C'] as const).map(id => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={activeTab === id ? TAB_STYLES[id].active : TAB_STYLES[id].inactive}
            >
              {TAB_STYLES[id].label}
            </button>
          ))}
        </div>

        {/* Probability weight note + toggle — only on raw scenario tabs */}
        {isScenarioTab && (
          <div className="mt-3 flex items-start justify-between gap-3 rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="min-w-0">
              <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Raw scenario — no probability weighting applied
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                These are the full numbers if this outcome occurs.
                This scenario has a <strong>{Math.round(scenarioWeight * 100)}%</strong> probability weighting in the blended Vote No.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApplyWeight(v => !v)}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                applyWeight
                  ? { background: 'rgba(201,168,76,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)' }
                  : { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
              }
            >
              <span
                className="w-7 h-4 rounded-full relative transition-colors"
                style={{ background: applyWeight ? 'var(--gold)' : 'var(--border)' }}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                  style={{ background: 'white', left: applyWeight ? '14px' : '2px' }}
                />
              </span>
              Apply {Math.round(scenarioWeight * 100)}% weight
            </button>
          </div>
        )}
      </div>

      {/* Main table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap sticky left-0" style={{ color: 'var(--text-faint)', background: 'var(--bg-surface)' }}>Month</th>
              <th className="text-center px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Seat</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Longevity</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Rate</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Hrs</th>
              {columns.map(col => (
                <th key={col.key} className="text-right px-3 py-2 font-medium whitespace-nowrap"
                  style={{ color: col.gold ? 'var(--gold)' : 'var(--text-faint)' }}>
                  {col.key === 'brokerageSavingsCash' ? (
                    <span title="Fraction of your raise saved to a brokerage account, compounded to retirement">💼 {col.label}</span>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row: MonthlyRow, i: number) => {
              const isFirstOfYear      = row.month === 0 || i === 0
              const isSteadyStateStart = i === steadyStateIndex
              const isFirstPostJcbaRetention =
                row.monthIndex >= jcbaMonth &&
                (row.retentionCashFlow > 0 || row.retentionAccrualNote > 0.01) &&
                (i === 0 || displayRows[i - 1].monthIndex < jcbaMonth)
              const isUpgradeRow =
                i > 0 &&
                displayRows[i - 1].effectiveSeat === 'FO' &&
                row.effectiveSeat === 'CA'
              return (
                <>
                  {isSteadyStateStart && (
                    <tr key={`steady-${i}`} style={{ background: 'rgba(201,168,76,0.05)' }}>
                      <td colSpan={12} className="px-3 py-2 text-center text-xs font-medium" style={{ color: 'var(--gold)' }}>
                        ── Steady state reached — annual pattern repeats from here ──
                      </td>
                    </tr>
                  )}
                  {isFirstPostJcbaRetention && (
                    <tr key={`post-jcba-${i}`} style={{ background: 'rgba(34,197,94,0.05)' }}>
                      <td colSpan={12} className="px-3 py-2 text-center text-xs font-medium" style={{ color: 'var(--positive)' }}>
                        ── Post-JCBA retention accrual & payout (60 days after JCBA ratification) ──
                      </td>
                    </tr>
                  )}
                  {isUpgradeRow && (
                    <tr key={`upgrade-${i}`} style={{ background: 'rgba(201,168,76,0.08)' }}>
                      <td colSpan={12} className="px-3 py-2 text-center text-xs font-medium" style={{ color: 'var(--gold)' }}>
                        ── Upgraded to Captain — Captain pay rates apply from here ──
                      </td>
                    </tr>
                  )}
                  <tr
                    key={`${row.year}-${row.month}`}
                    style={isFirstOfYear ? { borderTop: '1px solid var(--border)' } : undefined}
                    className="transition-colors"
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
                  >
                    <td className="px-3 py-2 whitespace-nowrap font-medium sticky left-0" style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
                      {MONTHS_SHORT[row.month]} {row.year}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={
                          row.effectiveSeat === 'CA'
                            ? { color: 'var(--gold)', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }
                            : { color: 'var(--text-muted)', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }
                        }
                      >
                        {row.effectiveSeat}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{row.longevity}</td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{fmtRate(row.hourlyRate)}</td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{row.totalHours}</td>
                    {columns.map(col => {
                      const raw = (row as unknown as Record<string, number>)[col.key]
                      const val = raw * weight
                      return (
                        <td key={col.key} className="px-3 py-2 text-right whitespace-nowrap"
                          style={{
                            color: col.gold
                              ? (col.key === 'cumulativePV' ? 'var(--gold)' : 'var(--text-base)')
                              : val > 0 ? 'var(--text-base)' : 'var(--text-faint)',
                            fontWeight: col.key === 'cumulativePV' ? 600 : 400,
                          }}
                        >
                          {val !== 0 ? fmt(val) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="px-4 py-3 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={() => setExpanded(!expanded)} className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            {expanded
              ? 'Collapse (show only pre-steady-state months)'
              : `Show all ${preJcbaRows.length - steadyStateIndex - 1} remaining pre-JCBA months`}
          </button>
        </div>
      )}
      <div className="px-4 py-2 text-center text-xs" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        Table stops at JCBA month {jcbaMonth} — all scenarios converge to identical rates after this point
        {postJcbaRetentionRows.length > 0 && activeTab === 'C' && (
          <> · Retention accrual & payout rows after JCBA are shown for Scenario C</>
        )}
      </div>

      {/* Summary row: ties table totals to the "Your Full Breakdown" card above */}
      <div
        className="px-4 py-3 flex flex-wrap gap-x-8 gap-y-3"
        style={{ background: 'var(--bg-elevated)', borderTop: '2px solid var(--border)' }}
      >
        <div>
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-faint)' }}>
            Pre-JCBA Total PV
            <span className="ml-1.5 text-xs" style={{ color: 'var(--text-faint)', opacity: 0.7 }}>
              (pay + PS + retention + 401k + brokerage){applyWeight && isScenarioTab ? ` × ${Math.round(scenarioWeight * 100)}%` : ''}
            </span>
          </div>
          <div className="text-sm font-black tabular-nums" style={{ color: 'var(--gold)' }}>
            {fmt(summary.preJcbaTotal * weight)}
          </div>
        </div>
        <div>
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-faint)' }}>
            Full-career pay + profit sharing (nominal){applyWeight && isScenarioTab ? ` × ${Math.round(scenarioWeight * 100)}%` : ''}
          </div>
          <div className="text-sm font-black tabular-nums" style={{ color: 'var(--text-base)' }}>
            {fmt(fullCareerPayNominal * weight)}
          </div>
        </div>
        <div>
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-faint)' }}>
            Total retirement savings @ 65{applyWeight && isScenarioTab ? ` × ${Math.round(scenarioWeight * 100)}%` : ''}
            <span className="ml-1.5 text-xs" style={{ color: 'var(--text-faint)', opacity: 0.7 }}>
              (401k + retention + brokerage)
            </span>
          </div>
          <div className="text-sm font-black tabular-nums" style={{ color: 'var(--gold)' }}>
            {fmt(totalRetirementSavingsNominal * weight)}
          </div>
        </div>
        <div className="ml-auto text-xs self-center" style={{ color: 'var(--text-faint)', opacity: 0.7 }}>
          {applyWeight && isScenarioTab ? `Weighted contribution to Vote No (blended) ↑` : 'Matches Your Full Breakdown above ↑'}
        </div>
      </div>

      <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <RetentionDetail
          rows={rows}
          startingBalance={result.inputs.retentionCurrentBalance}
          probability={prob}
          isVoteYes={isVoteYes}
        />
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function TransparentTable({ results }: Props) {
  const [activeScenario, setActiveScenario] = useState(0)
  const multiScenario = results.length > 1
  const activeResult  = results[activeScenario] ?? results[0]
  const { voteYes, scenarioAverage, scenarioWorst } = useResultChartColors()
  const scenarioColors = [voteYes, scenarioAverage, scenarioWorst]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="font-semibold text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Month-by-Month Detail
        </h2>

        {/* Top-level scenario tabs — only shown when multiple scenarios */}
        {multiScenario && (
          <div className="flex gap-1.5 flex-wrap mb-0">
            {results.map((result, i) => {
              const vns   = result.voteNoScenario
              const color = scenarioColors[i] ?? SCENARIO_COLORS_FALLBACK[i]
              const isActive = i === activeScenario
              return (
                <button
                  key={i}
                  onClick={() => setActiveScenario(i)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left"
                  style={
                    isActive
                      ? { background: `${color}18`, border: `1.5px solid ${color}`, color }
                      : { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  <div>{SCENARIO_LABELS[i]}</div>
                  <div className="text-xs font-normal mt-0.5" style={{ color: isActive ? color : 'var(--text-faint)', opacity: 0.85 }}>
                    {Math.round(vns.probability * 100)}% · {vns.arrivalMonths}mo · +{(vns.percentAboveTA * 100).toFixed(0)}% · JCBA {vns.jcbaDurationMonths}mo
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <ResultTable result={activeResult} />
    </div>
  )
}
