import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ComparisonResult } from '../../lib/types'
import { useResultChartColors } from './useResultChartColors'

interface Props { results: ComparisonResult[] }

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

const SCENARIO_DETAIL_COLORS = ['#a855f7', '#ef4444']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl space-y-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {(payload as { name: string; value: number; color: string }[]).map(p => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold" style={{ color: 'var(--text-base)' }}>{fmtAxis(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function CumulativeLineChart({ results }: Props) {
  const [showDetail, setShowDetail] = useState(false)
  const { voteYes, voteNo } = useResultChartColors()

  // Use the longest JCBA window across all scenarios to set chart length
  const maxJcba = Math.max(...results.map(r => r.voteNoScenario.jcbaDurationMonths))
  const refResult = results[0]
  const refA = refResult.scenarios.find(s => s.scenarioId === 'A')!
  const maxLen = Math.min(maxJcba + 1, refA.rows.length)
  const step = Math.max(1, Math.floor(maxLen / 120))

  // Build chart data keyed by month index
  const chartData: Record<string, number | string>[] = []
  for (let i = 0; i < maxLen; i += step) {
    const rA = refA.rows[i]
    if (!rA) continue
    const point: Record<string, number | string> = { month: `${rA.year}` }

    results.forEach((result, ri) => {
      const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
      const voteNo    = result.voteNoExpected
      const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
      const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!

      const rResultA  = scenarioA.rows[Math.min(i, scenarioA.rows.length - 1)]
      const rVN       = voteNo.rows[Math.min(i, voteNo.rows.length - 1)]
      const rB        = scenarioB.rows[Math.min(i, scenarioB.rows.length - 1)]
      const rC        = scenarioC.rows[Math.min(i, scenarioC.rows.length - 1)]

      const suffix = results.length > 1 ? ` (S${ri + 1})` : ''
      point[`Vote Yes${suffix}`]  = Math.round(rResultA?.cumulativePV ?? 0)
      point[`Vote No${suffix}`]   = Math.round(rVN?.cumulativePV ?? 0)
      if (showDetail) {
        point[`Scen B${suffix}`]  = Math.round(rB?.cumulativePV ?? 0)
        point[`Scen C${suffix}`]  = Math.round(rC?.cumulativePV ?? 0)
      }
    })

    chartData.push(point)
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtAxis} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />

          {results.map((_, ri) => {
            const suffix = results.length > 1 ? ` (S${ri + 1})` : ''
            return [
              <Line key={`yes-${ri}`} type="monotone" dataKey={`Vote Yes${suffix}`} stroke={voteYes} strokeWidth={2.5} dot={false} />,
              <Line key={`no-${ri}`}  type="monotone" dataKey={`Vote No${suffix}`}  stroke={voteNo}   strokeWidth={2.5} dot={false} />,
              ...(showDetail ? [
                <Line key={`b-${ri}`} type="monotone" dataKey={`Scen B${suffix}`} stroke={SCENARIO_DETAIL_COLORS[0]} strokeWidth={1.5} strokeDasharray="4 3" dot={false} opacity={0.6} />,
                <Line key={`c-${ri}`} type="monotone" dataKey={`Scen C${suffix}`} stroke={SCENARIO_DETAIL_COLORS[1]} strokeWidth={1.5} strokeDasharray="4 3" dot={false} opacity={0.6} />,
              ] : []),
            ]
          })}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-2 text-center">
        <button
          onClick={() => setShowDetail(v => !v)}
          className="text-xs font-medium transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          {showDetail ? 'Hide scenario detail' : 'Show how Vote No is weighted (Outcome B & C)'}
        </button>
      </div>
    </div>
  )
}
