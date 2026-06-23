import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ComparisonResult } from '../../lib/types'

interface Props {
  results: ComparisonResult
  viewMode: 'today' | 'age65'
}

const COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#a855f7',
  C: '#ef4444',
  VOTE_NO_EXPECTED: '#f59e0b',
}

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const value = payload[0].value as number
  return (
    <div className="bg-[#1a2235] border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white font-bold">{fmtAxis(value)}</div>
    </div>
  )
}

export function ComparisonBarChart({ results, viewMode }: Props) {
  const all = [...results.scenarios, results.voteNoExpected]

  const data = all.map(s => ({
    name: s.label,
    id: s.scenarioId,
    value: viewMode === 'today' ? s.presentValueTotal : s.retirementBalanceAt65,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtAxis}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={COLORS[entry.id] || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
