import { useState } from 'react'
import type { ComparisonResult, MonthlyRow } from '../../lib/types'

interface Props { results: ComparisonResult }

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmt(n: number) { return `$${Math.round(n).toLocaleString()}` }
function fmtRate(n: number) { return `$${n.toFixed(2)}` }

type ColumnKey = 'grossPay' | 'k401Contribution' | 'profitSharingCash' | 'retentionCashFlow' | 'presentValue' | 'cumulativePV'

type TabId = 'YES' | 'NO' | 'B' | 'C'

const TAB_STYLES: Record<TabId, { active: React.CSSProperties; inactive: React.CSSProperties; label: string }> = {
  YES: {
    label: 'Vote Yes',
    active:   { background: 'rgba(201,168,76,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)' },
    inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  },
  NO: {
    label: 'Vote No (blended)',
    active:   { background: 'rgba(26,43,74,0.15)', border: '1px solid var(--navy)', color: 'var(--navy)' },
    inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  },
  B: {
    label: 'Scenario B detail',
    active:   { background: 'rgba(168,85,247,0.12)', border: '1px solid #a855f7', color: '#a855f7' },
    inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-faint)' },
  },
  C: {
    label: 'Scenario C detail',
    active:   { background: 'rgba(239,68,68,0.12)', border: '1px solid var(--negative)', color: 'var(--negative)' },
    inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-faint)' },
  },
}

export function TransparentTable({ results }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('YES')

  const tabToScenario: Record<TabId, string> = { YES: 'A', NO: 'VOTE_NO_EXPECTED', B: 'B', C: 'C' }
  const scenarioId = tabToScenario[activeTab]

  const allSummaries = [...results.scenarios, results.voteNoExpected]
  const summary = allSummaries.find(s => s.scenarioId === scenarioId)
  if (!summary) return null

  const { rows, steadyStateIndex } = summary
  const displayRows = expanded ? rows : rows.slice(0, steadyStateIndex + 1)
  const hasMore = rows.length > steadyStateIndex + 1

  const columns: { key: ColumnKey; label: string }[] = [
    { key: 'grossPay', label: 'Gross Pay' },
    { key: 'k401Contribution', label: '401(k)' },
    { key: 'profitSharingCash', label: 'Profit Sharing' },
    { key: 'retentionCashFlow', label: 'Retention' },
    { key: 'presentValue', label: 'PV' },
    { key: 'cumulativePV', label: 'Cum. PV' },
  ]

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-semibold text-sm uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Month-by-Month Detail
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {rows.length} months total
          </span>
        </div>
        {/* Primary tabs: Vote Yes / Vote No */}
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
          {/* Detail tabs */}
          {(['B', 'C'] as const).map(id => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={activeTab === id ? TAB_STYLES[id].active : TAB_STYLES[id].inactive}
            >
              {TAB_STYLES[id].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <th
                className="text-left px-3 py-2 font-medium whitespace-nowrap sticky left-0"
                style={{ color: 'var(--text-faint)', background: 'var(--bg-surface)' }}
              >
                Month
              </th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Rate</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>Hrs</th>
              {columns.map(col => (
                <th key={col.key} className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row: MonthlyRow, i: number) => {
              const isFirstOfYear = row.month === 0 || i === 0
              const isSteadyStateStart = i === steadyStateIndex

              return (
                <>
                  {isSteadyStateStart && (
                    <tr key={`steady-${i}`} style={{ background: 'rgba(201,168,76,0.05)' }}>
                      <td
                        colSpan={9}
                        className="px-3 py-2 text-center text-xs font-medium"
                        style={{ color: 'var(--gold)' }}
                      >
                        ── Steady state reached — annual pattern repeats from here ──
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
                    <td
                      className="px-3 py-2 whitespace-nowrap font-medium sticky left-0"
                      style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)' }}
                    >
                      {MONTHS_SHORT[row.month]} {row.year}
                    </td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>
                      {fmtRate(row.hourlyRate)}
                    </td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--text-muted)' }}>
                      {row.totalHours}
                    </td>
                    {columns.map(col => {
                      const val = (row as unknown as Record<string, number>)[col.key]
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-2 text-right whitespace-nowrap"
                          style={{
                            color: col.key === 'cumulativePV'
                              ? 'var(--gold)'
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
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            {expanded
              ? `Collapse (hide ${rows.length - steadyStateIndex - 1} repeating months)`
              : `Show all ${rows.length - steadyStateIndex - 1} remaining months (annual pattern repeats)`
            }
          </button>
        </div>
      )}
    </div>
  )
}
