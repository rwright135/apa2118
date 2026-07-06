import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { ComparisonResult, MonthlyRow } from '../../lib/types'
import { VOTE_NO_CSS, VOTE_NO_DIM_CSS } from '../../lib/resultColors'

interface Props { results: ComparisonResult[] }

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
// Fixed width for the sticky "Month" column so longer sub-row labels (e.g. the
// blended tab's "Offer 50%" / "JCBA 50%" breakdown) truncate instead of
// growing the column and shifting every other column to the right.
const MONTH_COL_WIDTH = '8rem'
const MONTH_COL_STYLE: CSSProperties = { width: MONTH_COL_WIDTH, minWidth: MONTH_COL_WIDTH, maxWidth: MONTH_COL_WIDTH, overflow: 'hidden' }
function fmt(n: number)     { return `$${Math.round(n).toLocaleString()}` }
function fmtRate(n: number) { return `$${n.toFixed(2)}` }

/** Monthly RB accrual (rate × 85 hrs × 35%) or payout lump when applicable. */
function getRetentionTableCell(row: MonthlyRow): { amount: number; isPayout: boolean } {
  if (row.retentionCashFlow > 0.01) {
    return { amount: row.retentionCashFlow, isPayout: true }
  }
  if (row.retentionAccrualNote > 0.01) {
    return { amount: row.retentionAccrualNote, isPayout: false }
  }
  return { amount: 0, isPayout: false }
}

type ColumnKey = 'grossPay' | 'k401Contribution' | 'profitSharingCash' | 'retentionAccrual' | 'retentionTotal' | 'brokerageSavingsCash' | 'brokerageInterest' | 'cumulativeBrokerage' | 'nominalTotal' | 'presentValue' | 'cumulativePV'
type TabId = 'YES' | 'NO' | 'B' | 'C'

const TAB_STYLES: Record<TabId, { active: React.CSSProperties; inactive: React.CSSProperties; label: string }> = {
  YES: { label: 'Vote Yes',         active: { background: 'rgba(201,168,76,0.15)', border: '1px solid var(--gold)',     color: 'var(--gold)'     }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' } },
  NO:  { label: 'Vote No (blended)',active: { background: VOTE_NO_DIM_CSS, border: `1px solid ${VOTE_NO_CSS}`, color: VOTE_NO_CSS }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' } },
  B:   { label: 'Vote No (Offer)', active: { background: 'rgba(168,85,247,0.12)', border: '1px solid #a855f7',        color: '#a855f7'         }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-faint)'  } },
  C:   { label: 'Vote No (JCBA)',  active: { background: 'rgba(239,68,68,0.12)', border: '1px solid var(--negative)', color: 'var(--negative)' }, inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-faint)'  } },
}

// ── XLSX export ───────────────────────────────────────────────────────────────

function buildSheetRows(rows: MonthlyRow[], weight: number, component?: string) {
  // Mirrors the in-app table: Nominal / Row PV / Cumulative PV are built from
  // Gross Pay + 401(k) + Profit Share + RB Accrual-or-Payout (NOT Brokerage,
  // which is already counted inside Gross Pay). Row PV = Nominal discounted
  // by that month's factor; Cumulative PV is the running total from month 0.
  let cumulativeNominalPV = 0
  return rows.map(r => {
    const { amount: retentionAmount } = getRetentionTableCell(r)
    const nominalTotal = r.grossPay + r.k401Contribution + r.profitSharingCash + retentionAmount
    const rowPV = nominalTotal * r.discountFactor
    cumulativeNominalPV += rowPV
    return {
      ...(component ? { Component: component } : {}),
      Month:              `${MONTHS_SHORT[r.month]} ${r.year}`,
      Seat:               r.effectiveSeat,
      Longevity:          r.longevity,
      'Rate ($/hr)':      +r.hourlyRate.toFixed(2),
      Hours:              r.totalHours,
      'Gross Pay':        Math.round(r.grossPay * weight),
      '401(k) DC':        Math.round(r.k401Contribution * weight),
      'Profit Share':     Math.round(r.profitSharingCash * weight),
      'Retention Accrual': Math.round(r.retentionAccrualNote * weight),
      'Retention Total':  Math.round(r.retentionRunningBalance * weight),
      'Nominal':          Math.round(nominalTotal * weight),
      'Row PV':           Math.round(rowPV * weight),
      'Cumulative PV':    Math.round(cumulativeNominalPV * weight),
      'Brokerage Saved':  Math.round(r.brokerageSavingsCash * weight),
    }
  })
}

// The "Vote No (blended)" sheet interleaves all three rows per month — the
// blended summary, plus its Vote No (Offer) and Vote No (JCBA) probability-
// weighted components — so the full breakdown is visible without needing to
// cross-reference the separate per-scenario sheets.
function buildBlendedSheetRows(blendedRows: MonthlyRow[], bRows: MonthlyRow[], cRows: MonthlyRow[], p: number) {
  const blended = buildSheetRows(blendedRows, 1, 'Vote No (Blended)')
  const offer   = buildSheetRows(bRows, p, 'Vote No (Offer)')
  const jcba    = buildSheetRows(cRows, 1 - p, 'Vote No (JCBA)')
  const maxLen  = Math.max(blended.length, offer.length, jcba.length)
  const merged: typeof blended = []
  for (let i = 0; i < maxLen; i++) {
    if (blended[i]) merged.push(blended[i])
    if (offer[i])   merged.push(offer[i])
    if (jcba[i])    merged.push(jcba[i])
  }
  return merged
}

async function exportToXLSX(result: ComparisonResult) {
  const XLSX = await import('xlsx')
  const p = result.voteNoScenario.probability
  const jcba = result.voteNoScenario.jcbaDurationMonths

  const allSummaries = [...result.scenarios, result.voteNoExpected]

  const sheets: { name: string; rows: MonthlyRow[]; weight: number }[] = [
    { name: 'Vote Yes',          rows: allSummaries.find(s => s.scenarioId === 'A')!.rows,                  weight: 1 },
    { name: 'Vote No (blended)', rows: allSummaries.find(s => s.scenarioId === 'VOTE_NO_EXPECTED')!.rows,   weight: 1 },
    { name: 'Vote No (Offer)',   rows: allSummaries.find(s => s.scenarioId === 'B')!.rows,                  weight: p },
    { name: 'Vote No (JCBA)',    rows: allSummaries.find(s => s.scenarioId === 'C')!.rows,                  weight: 1 - p },
  ]

  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = sheets.map(({ name, rows, weight }) => {
    const preJcba = rows.filter(r => r.monthIndex < jcba)
    const all = rows
    const grossPay    = Math.round(preJcba.reduce((s, r) => s + r.grossPay, 0) * weight)
    const profitShare = Math.round(preJcba.reduce((s, r) => s + r.profitSharingCash, 0) * weight)
    const retention   = Math.round(all.reduce((s, r) => s + r.retentionCashFlow, 0) * weight)
    const brokerage   = Math.round(preJcba.reduce((s, r) => s + r.brokerageSavingsCash, 0) * weight)
    const preJcbaPV   = Math.round(preJcba.reduce((s, r) => s + r.presentValue + r.presentValue401k, 0) * weight)
    return { Scenario: name, 'Pre-JCBA Gross Pay': grossPay, 'Pre-JCBA Profit Share': profitShare,
             'Retention': retention, 'Pre-JCBA Brokerage Saved': brokerage, 'Pre-JCBA Total PV': preJcbaPV }
  })
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Summary')

  // One sheet per scenario. "Vote No (blended)" interleaves all three rows
  // per month (Blended, Offer, JCBA) so the full breakdown downloads together.
  const bRows = allSummaries.find(s => s.scenarioId === 'B')!.rows
  const cRows = allSummaries.find(s => s.scenarioId === 'C')!.rows
  for (const { name, rows, weight } of sheets) {
    const data = name === 'Vote No (blended)'
      ? buildBlendedSheetRows(rows, bRows, cRows, p)
      : buildSheetRows(rows, weight)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), name)
  }

  XLSX.writeFile(wb, 'APA2118_Month_by_Month.xlsx')
}

// ── Inner table for one ComparisonResult ──────────────────────────────────────

function ResultTable({ result }: { result: ComparisonResult }) {
  const [expanded, setExpanded]           = useState(false)
  const [activeTab, setActiveTab]         = useState<TabId>('YES')
  // Per-month expansion on the blended tab — each month's row keeps its own
  // caret so the Offer/JCBA breakdown can be expanded independently, month by
  // month, without collapsing the rest of the table.
  const [expandedBlendedMonths, setExpandedBlendedMonths] = useState<Set<number>>(new Set())
  const toggleBlendedMonth = (monthIndex: number) => {
    setExpandedBlendedMonths(prev => {
      const next = new Set(prev)
      if (next.has(monthIndex)) next.delete(monthIndex)
      else next.add(monthIndex)
      return next
    })
  }

  const tabToScenario: Record<TabId, string> = { YES: 'A', NO: 'VOTE_NO_EXPECTED', B: 'B', C: 'C' }
  const scenarioId = tabToScenario[activeTab]

  const allSummaries = [...result.scenarios, result.voteNoExpected]
  const summary = allSummaries.find(s => s.scenarioId === scenarioId)
  const scenarioBSummary = allSummaries.find(s => s.scenarioId === 'B')
  const scenarioCSummary = allSummaries.find(s => s.scenarioId === 'C')
  if (!summary || !scenarioBSummary || !scenarioCSummary) return null

  const jcbaMonth = result.voteNoScenario.jcbaDurationMonths
  const { rows, steadyStateIndex } = summary

  const p = result.voteNoScenario.probability
  // Probability weight this raw scenario carries in the blended Vote No.
  const scenarioWeight = activeTab === 'B' ? p : activeTab === 'C' ? 1 - p : 1
  const isScenarioTab  = activeTab === 'B' || activeTab === 'C'
  const isBlendedTab   = activeTab === 'NO'

  const preJcbaRows = rows.slice(0, jcbaMonth)
  const postJcbaRows = rows.slice(jcbaMonth)

  // Compute the post-JCBA multiplier for this scenario to show in the banner
  const penalty = result.inputs.advancedPostJCBA?.scenarioCPenalty ?? 0.15
  const vns = result.voteNoScenario
  const upliftPct = Math.round(0.20 * 100)
  const penaltyPct = Math.round(penalty * 100)
  const postJcbaLabel =
    activeTab === 'YES' ? `TA+${upliftPct}%`
    : activeTab === 'B' ? `Offer+${upliftPct}%`
    : activeTab === 'NO' ? 'Blended'
    : `TA+${Math.round(upliftPct * (1 - penalty))}%`

  const allTableRows = [...preJcbaRows, ...postJcbaRows]
  const retirementMonthIndex = rows.length - 1

  const displayRows = expanded
    ? allTableRows
    : (() => {
        const preSteady = preJcbaRows.slice(0, steadyStateIndex + 1)
        // In collapsed mode, show first 3 post-JCBA months so the uplift is visible
        return [...preSteady, ...postJcbaRows.slice(0, 3)]
      })()
  const hasMore = preJcbaRows.length > steadyStateIndex + 1 || postJcbaRows.length > 3
  const showsThroughRetirement =
    displayRows.length > 0 &&
    displayRows[displayRows.length - 1].monthIndex === retirementMonthIndex

  // Row PV / Cumulative PV are computed directly from the same Nominal total
  // shown in the Nominal column, discounted by that month's discount factor —
  function buildNominalPVMaps(monthRows: MonthlyRow[]) {
    const byMonth = new Map<number, number>()
    const cumulative = new Map<number, number>()
    let running = 0
    for (const r of monthRows) {
      const { amount: retentionAmount } = getRetentionTableCell(r)
      const nominalRowTotal = r.grossPay + r.k401Contribution + r.profitSharingCash + retentionAmount
      const rowPV = nominalRowTotal * r.discountFactor
      running += rowPV
      byMonth.set(r.monthIndex, rowPV)
      cumulative.set(r.monthIndex, running)
    }
    return { byMonth, cumulative }
  }

  const { byMonth: nominalRowPVByMonth, cumulative: cumulativeNominalPVByMonth } = buildNominalPVMaps(rows)
  // On the Vote No (blended) tab, each month is broken into its two
  // probability-weighted components (Offer × p, JCBA × (1-p)), so those need
  // their own PV maps computed from B's / C's own rows, not the blended rows.
  const bPVMaps = isBlendedTab ? buildNominalPVMaps(scenarioBSummary.rows) : null
  const cPVMaps = isBlendedTab ? buildNominalPVMaps(scenarioCSummary.rows) : null

  // Brokerage: each month the entire account compounds at investmentRate/12,
  // then the new monthly contribution is added. Track interest and balance.
  const monthlyRate = result.inputs.investmentRate / 12
  function buildBrokerageMaps(monthRows: MonthlyRow[]) {
    const interestByMonth   = new Map<number, number>()
    const cumulativeByMonth = new Map<number, number>()
    let balance = 0
    for (const r of monthRows) {
      const interest = balance * monthlyRate
      balance = balance + interest + r.brokerageSavingsCash
      interestByMonth.set(r.monthIndex, interest)
      cumulativeByMonth.set(r.monthIndex, balance)
    }
    return { interestByMonth, cumulativeByMonth }
  }

  const brokerageMaps      = buildBrokerageMaps(rows)
  const bBrokerageMaps     = isBlendedTab ? buildBrokerageMaps(scenarioBSummary.rows) : null
  const cBrokerageMaps     = isBlendedTab ? buildBrokerageMaps(scenarioCSummary.rows) : null

  function renderSeatBadge(seat: MonthlyRow['effectiveSeat']) {
    return (
      <span
        className="text-xs font-semibold px-1.5 py-0.5 rounded"
        style={
          seat === 'CA'
            ? { color: 'var(--gold)', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }
            : { color: 'var(--text-muted)', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }
        }
      >
        {seat}
      </span>
    )
  }

  const columns: { key: ColumnKey; label: string; gold?: boolean; voteYesOnly?: boolean }[] = [
    { key: 'grossPay',             label: 'Gross Pay' },
    { key: 'k401Contribution',     label: '401(k) DC' },
    { key: 'profitSharingCash',    label: 'Profit Share' },
    { key: 'retentionAccrual',     label: 'RB Accrual' },
    { key: 'retentionTotal',       label: 'RB Total' },
    { key: 'nominalTotal',         label: 'Nominal' },
    { key: 'presentValue',         label: 'Row PV' },
    { key: 'cumulativePV',         label: 'Cumulative PV', gold: true },
    { key: 'brokerageSavingsCash', label: 'Brokerage Savings' },
    { key: 'brokerageInterest',    label: 'Brokerage Interest' },
    { key: 'cumulativeBrokerage',  label: 'Cumulative Brokerage', gold: true },
  ]

  // Renders the dollar-value columns for a row at a given weight. Used once at
  // 100% (nominal) and, on raw scenario tabs, a second time at the scenario's
  // probability weight — as two separate rows rather than a silent toggle, so
  // it's always clear which numbers are nominal and which are weighted. On the
  // blended tab, pvMaps lets each component row (Offer / JCBA) use its own
  // Row PV / Cumulative PV instead of the active tab's default maps.
  function renderValueCells(
    row: MonthlyRow,
    rowWeight: number,
    variant: 'nominal' | 'weighted' = 'nominal',
    pvMaps: { byMonth: Map<number, number>; cumulative: Map<number, number> } = { byMonth: nominalRowPVByMonth, cumulative: cumulativeNominalPVByMonth },
    brMaps: { interestByMonth: Map<number, number>; cumulativeByMonth: Map<number, number> } = brokerageMaps
  ) {
    const padding = variant === 'weighted' ? 'px-3 py-1.5' : 'px-3 py-2'
    const italic  = variant === 'weighted'
    return columns.map(col => {
      if (col.key === 'retentionAccrual') {
        // Only the ongoing monthly accrual — never the lump-sum payout. Accrual
        // is already frozen (0) by the payout month (see engine freeze logic),
        // so this naturally shows "—" there. The payout amount itself flows
        // into Nominal / Row PV / Cumulative PV instead, not this column.
        const val = row.retentionAccrualNote * rowWeight
        return (
          <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
            style={{
              color: val > 0 ? 'var(--text-base)' : 'var(--text-faint)',
              fontStyle: italic ? 'italic' : undefined,
            }}
          >
            {val !== 0 ? `+${fmt(val)}` : '—'}
          </td>
        )
      }
      if (col.key === 'retentionTotal') {
        const val = row.retentionRunningBalance * rowWeight
        return (
          <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
            style={{ color: val > 0 ? 'var(--text-base)' : 'var(--text-faint)', fontStyle: italic ? 'italic' : undefined }}
          >
            {val !== 0 ? fmt(val) : '—'}
          </td>
        )
      }
      if (col.key === 'nominalTotal') {
        const { amount: retentionAmount } = getRetentionTableCell(row)
        const val = (row.grossPay + row.k401Contribution + row.profitSharingCash + retentionAmount) * rowWeight
        return (
          <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
            style={{ color: val > 0 ? 'var(--text-base)' : 'var(--text-faint)', fontWeight: italic ? 400 : 500, fontStyle: italic ? 'italic' : undefined }}
          >
            {val !== 0 ? fmt(val) : '—'}
          </td>
        )
      }
      if (col.key === 'presentValue') {
        const val = (pvMaps.byMonth.get(row.monthIndex) ?? 0) * rowWeight
        return (
          <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
            style={{ color: val > 0 ? 'var(--text-base)' : 'var(--text-faint)', fontStyle: italic ? 'italic' : undefined }}
          >
            {val !== 0 ? fmt(val) : '—'}
          </td>
        )
      }
      if (col.key === 'cumulativePV') {
        const val = (pvMaps.cumulative.get(row.monthIndex) ?? 0) * rowWeight
        return (
          <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
            style={{ color: 'var(--gold)', fontWeight: italic ? 400 : 600, fontStyle: italic ? 'italic' : undefined }}
          >
            {val !== 0 ? fmt(val) : '—'}
          </td>
        )
      }
      if (col.key === 'brokerageInterest') {
        const val = (brMaps.interestByMonth.get(row.monthIndex) ?? 0) * rowWeight
        return (
          <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
            style={{ color: val > 0 ? 'var(--text-base)' : 'var(--text-faint)', fontStyle: italic ? 'italic' : undefined }}
          >
            {val > 0.005 ? `+${fmt(val)}` : '—'}
          </td>
        )
      }
      if (col.key === 'cumulativeBrokerage') {
        const val = (brMaps.cumulativeByMonth.get(row.monthIndex) ?? 0) * rowWeight
        return (
          <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
            style={{ color: 'var(--gold)', fontWeight: italic ? 400 : 600, fontStyle: italic ? 'italic' : undefined }}
          >
            {val > 0.005 ? fmt(val) : '—'}
          </td>
        )
      }
      const raw = (row as unknown as Record<string, number>)[col.key]
      const val = raw * rowWeight
      return (
        <td key={col.key} className={`${padding} text-right whitespace-nowrap`}
          style={{
            color: val > 0 ? 'var(--text-base)' : 'var(--text-faint)',
            fontStyle: italic ? 'italic' : undefined,
          }}
        >
          {val !== 0 ? fmt(val) : '—'}
        </td>
      )
    })
  }

  return (
    <div>
      {/* Inner tabs */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="font-semibold text-sm uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
              Month-by-Month Detail
            </h2>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{rows.length} months total</span>
          </div>
          <button
            type="button"
            onClick={() => exportToXLSX(result)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-base)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
            title="Download all scenarios as Excel / Google Sheets file"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 2v7M4 6l3 3 3-3M2 11h10" />
            </svg>
            Download XLSX
          </button>
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

        {/* Probability weight note — only on raw scenario tabs */}
        {isScenarioTab && (
          <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Nominal scenario, plus its weighted contribution to Vote No (blended)
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Each month below shows the full (nominal) numbers if this outcome occurs. The italic row directly underneath
              shows that same month scaled by this scenario's <strong>{Math.round(scenarioWeight * 100)}%</strong> probability
              weighting. Its actual contribution to the Vote No (Blended) total.
            </div>
          </div>
        )}

        {/* Component breakdown note — only on the blended tab */}
        {isBlendedTab && (
          <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Each month blends two probability-weighted components
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              <span style={{ color: '#a855f7', fontWeight: 600 }}>Vote No (Offer)</span> at <strong>{Math.round(p * 100)}%</strong> probability,
              plus <span style={{ color: 'var(--negative)', fontWeight: 600 }}>Vote No (JCBA)</span> at <strong>{Math.round((1 - p) * 100)}%</strong> probability.
              {' '}Click the caret (▾) next to any month to expand its two components.
            </div>
          </div>
        )}
      </div>

      {/* Main table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="text-center px-2 py-2 font-medium whitespace-nowrap sticky left-0" style={{ color: 'var(--text-faint)', background: 'var(--bg-surface)', width: '2.75rem', minWidth: '2.75rem' }}>#</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap sticky" style={{ color: 'var(--text-faint)', background: 'var(--bg-surface)', left: '2.75rem', ...MONTH_COL_STYLE }}>Month</th>
              <th className="text-center px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Seat</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Longevity</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Rate</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Hrs</th>
              {columns.map(col => (
                <th key={col.key} className="text-right px-3 py-2 font-medium whitespace-nowrap"
                  style={{ color: col.gold ? 'var(--gold)' : 'var(--text-faint)' }}>
                  {col.key === 'presentValue' ? (
                    <span title="Nominal ÷ (1 + rate/12)^month — this month's Nominal total discounted back to today's dollars. At month 0, Row PV always equals Nominal exactly.">Row PV</span>
                  ) : col.key === 'cumulativePV' ? (
                    <span title="Running total of Row PV from month 0 through this month — the Nominal column discounted month-by-month and added up.">Cumulative PV</span>
                  ) : col.key === 'retentionAccrual' ? (
                    <span title="Monthly retention bonus accrual at 35% × hourly rate × 85 hrs (fixed, not actual hours worked). Freezes (shows 0) once the new agreement is ratified, through the ~60-day payout window. The lump-sum payout itself isn't shown in this column — see RB Total, Nominal, and Row PV.">RB Accrual</span>
                  ) : col.key === 'retentionTotal' ? (
                    <span title="Cumulative retention bonus balance accrued to date. Frozen (no further growth) once the new agreement is ratified; the frozen total is what gets paid out ~60 days later.">RB Total</span>
                  ) : col.key === 'nominalTotal' ? (
                    <span title="Nominal (non-discounted) total for this month: Gross Pay + 401(k) contribution + Profit Share + RB Accrual/Payout. Excludes Brokerage — see that column's note.">Nominal</span>
                  ) : col.key === 'brokerageSavingsCash' ? (
                    <span title="The portion of your monthly raise redirected to a taxable brokerage account. Already counted in Gross Pay — shown here for reference only and excluded from Nominal/Row PV/Cumulative PV.">Brokerage Savings</span>
                  ) : col.key === 'brokerageInterest' ? (
                    <span title="Interest earned this month on the cumulative brokerage balance: balance × (rate ÷ 12). Compounds monthly at your chosen investment rate.">Brokerage Interest</span>
                  ) : col.key === 'cumulativeBrokerage' ? (
                    <span title="Running brokerage account balance: prior balance × (1 + rate/12) + this month's contribution. Grows each month through both new savings and compounding interest.">Cumulative Brokerage</span>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row: MonthlyRow, i: number) => {
              const isFirstOfYear      = row.month === 0 || i === 0
              const isSteadyStateStart = i === steadyStateIndex
              const isJcbaBoundary =
                row.monthIndex >= jcbaMonth &&
                (i === 0 || displayRows[i - 1].monthIndex < jcbaMonth)
              const isUpgradeRow =
                i > 0 &&
                displayRows[i - 1].effectiveSeat === 'FO' &&
                row.effectiveSeat === 'CA'
              const rowB = isBlendedTab ? scenarioBSummary.rows[row.monthIndex] : null
              const rowC = isBlendedTab ? scenarioCSummary.rows[row.monthIndex] : null
              const isRowExpanded = isBlendedTab && expandedBlendedMonths.has(row.monthIndex)
              return (
                <>
                  {isSteadyStateStart && !isJcbaBoundary && (
                    <tr key={`steady-${i}`} style={{ background: 'rgba(201,168,76,0.05)' }}>
                      <td colSpan={17} className="px-3 py-2 text-center text-xs font-medium" style={{ color: 'var(--gold)' }}>
                        ── Steady state reached — annual pattern repeats from here ──
                      </td>
                    </tr>
                  )}
                  {isJcbaBoundary && (
                    <tr key={`jcba-${i}`} style={{ background: 'rgba(34,197,94,0.08)', borderTop: '2px solid rgba(34,197,94,0.4)' }}>
                      <td colSpan={17} className="px-3 py-2 text-center text-xs font-semibold" style={{ color: 'var(--positive)' }}>
                        JCBA Ratified (Month {jcbaMonth}) Post-JCBA Rate: {postJcbaLabel}
                      </td>
                    </tr>
                  )}
                  {isUpgradeRow && (
                    <tr key={`upgrade-${i}`} style={{ background: 'rgba(201,168,76,0.08)' }}>
                      <td colSpan={17} className="px-3 py-2 text-center text-xs font-medium" style={{ color: 'var(--gold)' }}>
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
                    <td className="px-2 py-2 text-center whitespace-nowrap sticky left-0" style={{ color: 'var(--text-faint)', background: 'var(--bg-surface)' }}>
                      {row.monthIndex}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap sticky" style={{ background: 'var(--bg-surface)', left: '2.75rem', ...MONTH_COL_STYLE }}>
                      <div className="flex items-center gap-1">
                        {isBlendedTab && rowB && rowC && (
                          <button
                            type="button"
                            onClick={() => toggleBlendedMonth(row.monthIndex)}
                            className="shrink-0 flex items-center justify-center transition-transform"
                            style={{
                              color: 'var(--text-faint)',
                              transform: isRowExpanded ? 'rotate(90deg)' : 'none',
                            }}
                            aria-label={isRowExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
                            title={isRowExpanded ? 'Collapse breakdown' : 'Expand into Vote No (Offer) / Vote No (JCBA) components'}
                          >
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 4l4 4-4 4" />
                            </svg>
                          </button>
                        )}
                        <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{MONTHS_SHORT[row.month]} {row.year}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">{renderSeatBadge(row.effectiveSeat)}</td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{row.longevity}</td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{fmtRate(row.hourlyRate)}</td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{row.totalHours}</td>
                    {renderValueCells(row, 1, 'nominal')}
                  </tr>
                  {isScenarioTab && (
                    <tr
                      key={`${row.year}-${row.month}-weighted`}
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      <td className="px-2 py-1.5 sticky left-0" style={{ background: 'var(--bg-elevated)' }} />
                      <td
                        className="px-3 py-1.5 whitespace-nowrap text-[11px] italic sticky"
                        style={{ color: 'var(--text-faint)', background: 'var(--bg-elevated)', left: '2.75rem', ...MONTH_COL_STYLE }}
                      >
                        ↳ × {Math.round(scenarioWeight * 100)}%
                      </td>
                      <td className="px-3 py-1.5 text-center" style={{ color: 'var(--text-faint)' }}>—</td>
                      <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>—</td>
                      <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>—</td>
                      <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>—</td>
                      {renderValueCells(row, scenarioWeight, 'weighted')}
                    </tr>
                  )}
                  {isBlendedTab && isRowExpanded && rowB && rowC && (
                    <>
                      <tr
                        key={`${row.year}-${row.month}-offer`}
                        style={{ background: 'var(--bg-elevated)' }}
                        className="transition-colors"
                      >
                        <td className="px-2 py-1.5 sticky left-0" style={{ background: 'var(--bg-elevated)' }} />
                        <td className="px-3 py-1.5 whitespace-nowrap sticky" style={{ background: 'var(--bg-elevated)', left: '2.75rem', ...MONTH_COL_STYLE }} title={`Vote No (Offer) \u00b7 ${Math.round(p * 100)}%`}>
                          <div
                            className="text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ color: '#a855f7', borderLeft: '2px solid #a855f7', paddingLeft: '5px' }}
                          >
                            Offer {Math.round(p * 100)}%
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">{renderSeatBadge(rowB.effectiveSeat)}</td>
                        <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{rowB.longevity}</td>
                        <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{fmtRate(rowB.hourlyRate)}</td>
                        <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{rowB.totalHours}</td>
                        {renderValueCells(rowB, p, 'weighted', bPVMaps!, bBrokerageMaps!)}
                      </tr>
                      <tr
                        key={`${row.year}-${row.month}-jcba`}
                        style={{ background: 'var(--bg-elevated)' }}
                        className="transition-colors"
                      >
                        <td className="px-2 py-1.5 sticky left-0" style={{ background: 'var(--bg-elevated)' }} />
                        <td className="px-3 py-1.5 whitespace-nowrap sticky" style={{ background: 'var(--bg-elevated)', left: '2.75rem', ...MONTH_COL_STYLE }} title={`Vote No (JCBA) \u00b7 ${Math.round((1 - p) * 100)}%`}>
                          <div
                            className="text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ color: 'var(--negative)', borderLeft: '2px solid var(--negative)', paddingLeft: '5px' }}
                          >
                            JCBA {Math.round((1 - p) * 100)}%
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-center whitespace-nowrap">{renderSeatBadge(rowC.effectiveSeat)}</td>
                        <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{rowC.longevity}</td>
                        <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{fmtRate(rowC.hourlyRate)}</td>
                        <td className="px-3 py-1.5 text-right" style={{ color: 'var(--text-faint)' }}>{rowC.totalHours}</td>
                        {renderValueCells(rowC, 1 - p, 'weighted', cPVMaps!, cBrokerageMaps!)}
                      </tr>
                    </>
                  )}
                  {showsThroughRetirement && i === displayRows.length - 1 && (
                    <tr key="retirement-banner" style={{ background: 'rgba(59,130,246,0.08)', borderTop: '2px solid rgba(59,130,246,0.4)' }}>
                      <td colSpan={17} className="px-3 py-2 text-center text-xs font-semibold" style={{ color: '#3b82f6' }}>
                        FAA Mandatory Retirement Age (Month {retirementMonthIndex})
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="px-4 py-3 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={() => setExpanded(!expanded)} className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            {expanded ? 'Collapse' : 'Show All (Until Retirement)'}
          </button>
        </div>
      )}

    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function TransparentTable({ results }: Props) {
  const result = results[0]
  if (!result) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <ResultTable result={result} />
    </div>
  )
}
