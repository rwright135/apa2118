import { useState } from 'react'
import type { ComparisonResult, MonthlyRow } from '../../lib/types'

interface Props { results: ComparisonResult }

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmt(n: number) { return `$${Math.round(n).toLocaleString()}` }
function fmtRate(n: number) { return `$${n.toFixed(2)}` }

type ColumnKey = 'grossPay' | 'k401Contribution' | 'profitSharingCash' | 'retentionCashFlow' | 'presentValue' | 'cumulativePV'

export function TransparentTable({ results }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C'>('A')

  const scenarioMap: Record<'A'|'B'|'C', { label: string }> = {
    A: { label: 'Vote Yes' },
    B: { label: 'Vote No + Offer' },
    C: { label: 'Vote No, No Offer' },
  }

  const summary = results.scenarios.find(s => s.scenarioId === activeScenario)
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
    <div className="bg-[#1a2235] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white text-sm uppercase tracking-wide">Month-by-Month Detail</h2>
          <span className="text-xs text-gray-500">{rows.length} months total</span>
        </div>
        <div className="flex gap-1.5">
          {(['A','B','C'] as const).map(id => (
            <button
              key={id}
              onClick={() => setActiveScenario(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeScenario === id
                  ? id === 'A' ? 'bg-blue-600/30 border border-blue-500 text-blue-300'
                  : id === 'B' ? 'bg-purple-600/30 border border-purple-500 text-purple-300'
                  : 'bg-red-600/30 border border-red-500 text-red-300'
                  : 'bg-white/5 border border-white/10 text-gray-400'
              }`}
            >
              {scenarioMap[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-3 py-2 text-gray-500 font-medium whitespace-nowrap sticky left-0 bg-[#1a2235]">Month</th>
              <th className="text-right px-3 py-2 text-gray-500 font-medium whitespace-nowrap">Rate</th>
              <th className="text-right px-3 py-2 text-gray-500 font-medium whitespace-nowrap">Hrs</th>
              {columns.map(col => (
                <th key={col.key} className="text-right px-3 py-2 text-gray-500 font-medium whitespace-nowrap">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {displayRows.map((row: MonthlyRow, i: number) => {
              const isFirstOfYear = row.month === 0 || i === 0
              const isSteadyStateStart = i === steadyStateIndex

              return (
                <>
                  {isSteadyStateStart && (
                    <tr key={`steady-${i}`} className="bg-amber-500/5">
                      <td colSpan={9} className="px-3 py-2 text-center text-xs text-amber-400 font-medium">
                        ─ Steady state reached — annual pattern repeats from here ─
                      </td>
                    </tr>
                  )}
                  <tr
                    key={`${row.year}-${row.month}`}
                    className={`${isFirstOfYear ? 'border-t border-white/10' : ''} hover:bg-white/[0.03] transition-colors`}
                  >
                    <td className="px-3 py-2 text-gray-300 whitespace-nowrap sticky left-0 bg-[#1a2235] font-medium">
                      {MONTHS_SHORT[row.month]} {row.year}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400">{fmtRate(row.hourlyRate)}</td>
                    <td className="px-3 py-2 text-right text-gray-400">{row.totalHours}</td>
                    {columns.map(col => {
                      const val = (row as unknown as Record<string, number>)[col.key]
                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-2 text-right whitespace-nowrap ${
                            col.key === 'cumulativePV' ? 'font-semibold text-white' :
                            val > 0 ? 'text-gray-200' : 'text-gray-600'
                          }`}
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
        <div className="px-4 py-3 border-t border-white/5 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
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
