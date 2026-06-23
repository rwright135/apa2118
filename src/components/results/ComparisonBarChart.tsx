import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ComparisonResult } from '../../lib/types'

interface Props { results: ComparisonResult; viewMode: 'today' | 'age65' }

// Brand-aligned colors
const COLORS: Record<string, string> = {
  A: '#c9a84c',   // gold — Vote Yes
  B: '#a855f7',   // purple — Vote No + offer
  C: '#ef4444',   // red — Vote No, no offer
  VOTE_NO_EXPECTED: '#f59e0b', // amber — expected
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
    <div
      className="rounded-xl px-3 py-2 text-sm shadow-xl"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="text-xs mb-0.5" style={{ color: 'var(--text-faint)' }}>{label}</div>
      <div className="font-bold" style={{ color: 'var(--text-base)' }}>{fmtAxis(value)}</div>
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
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtAxis} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.04)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={COLORS[entry.id] || '#c9a84c'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
