import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ComparisonResult } from '../../lib/types'

interface Props { results: ComparisonResult }

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl space-y-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {(payload as { name: string; value: number; color: string; strokeDasharray?: string }[]).map(p => (
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

  const scenarioA  = results.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB  = results.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC  = results.scenarios.find(s => s.scenarioId === 'C')!
  const voteNo     = results.voteNoExpected

  const jcbaMonth = results.inputs.jcbaDurationMonths
  // Only chart the pre-JCBA window — post-JCBA is identical across scenarios
  const maxLen = Math.min(jcbaMonth + 1, scenarioA.rows.length)
  const step   = Math.max(1, Math.floor(maxLen / 120))

  const chartData = []
  for (let i = 0; i < maxLen; i += step) {
    const rA  = scenarioA.rows[i]
    const rVN = voteNo.rows[Math.min(i, voteNo.rows.length - 1)]
    const rB  = scenarioB.rows[Math.min(i, scenarioB.rows.length - 1)]
    const rC  = scenarioC.rows[Math.min(i, scenarioC.rows.length - 1)]
    if (!rA) continue
    chartData.push({
      month:  `${rA.year}`,
      'Vote Yes':  Math.round(rA.cumulativePV),
      'Vote No':   Math.round(rVN?.cumulativePV ?? 0),
      'Scenario B (2nd offer)': Math.round(rB?.cumulativePV ?? 0),
      'Scenario C (no offer)':  Math.round(rC?.cumulativePV ?? 0),
    })
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtAxis} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />

          {/* Primary: two lines */}
          <Line type="monotone" dataKey="Vote Yes"  stroke="#c9a84c" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="Vote No"   stroke="#1a2b4a" strokeWidth={2.5} dot={false} />

          {/* Detail: B and C shown as lighter dashed reference lines */}
          {showDetail && (
            <>
              <Line type="monotone" dataKey="Scenario B (2nd offer)" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              <Line type="monotone" dataKey="Scenario C (no offer)"  stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Toggle detail */}
      <div className="mt-2 text-center">
        <button
          onClick={() => setShowDetail(v => !v)}
          className="text-xs font-medium transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          {showDetail ? 'Hide scenario detail' : 'Show how Vote No is weighted (Scenario B & C)'}
        </button>
      </div>
    </div>
  )
}
