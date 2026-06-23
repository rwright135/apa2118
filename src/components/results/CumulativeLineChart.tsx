import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ComparisonResult } from '../../lib/types'

interface Props { results: ComparisonResult }

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

const COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#a855f7',
  C: '#ef4444',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2235] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl space-y-1">
      <div className="text-gray-400 font-medium">{label}</div>
      {(payload as { name: string; value: number; color: string }[]).map(p => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-bold">{fmtAxis(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function CumulativeLineChart({ results }: Props) {
  const scenarioA = results.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = results.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = results.scenarios.find(s => s.scenarioId === 'C')!

  const maxLen = scenarioA.rows.length
  const step = Math.max(1, Math.floor(maxLen / 120))

  const chartData = []
  for (let i = 0; i < maxLen; i += step) {
    const rowA = scenarioA.rows[i]
    const rowB = scenarioB.rows[Math.min(i, scenarioB.rows.length - 1)]
    const rowC = scenarioC.rows[Math.min(i, scenarioC.rows.length - 1)]
    if (!rowA) continue
    chartData.push({
      month: `${rowA.year}`,
      A: Math.round(rowA.cumulativePV),
      B: Math.round(rowB?.cumulativePV ?? 0),
      C: Math.round(rowC?.cumulativePV ?? 0),
    })
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tickFormatter={fmtAxis} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
        <Line type="monotone" dataKey="A" stroke={COLORS.A} strokeWidth={2} dot={false} name="Vote Yes (A)" />
        <Line type="monotone" dataKey="B" stroke={COLORS.B} strokeWidth={2} dot={false} name="Vote No + Offer (B)" />
        <Line type="monotone" dataKey="C" stroke={COLORS.C} strokeWidth={2} dot={false} name="Vote No (C)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
