import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { ComparisonResult } from '../../lib/types'

interface Props { results: ComparisonResult[] }

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-sm shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      {label && <div className="font-semibold mb-1.5 text-xs uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{label}</div>}
      {payload.map((p: { name: string; value: number; fill: string; dataKey: string }) => (
        <div key={p.dataKey} className="flex justify-between gap-6">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-bold tabular-nums" style={{ color: 'var(--text-base)' }}>{fmtAxis(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function ComparisonBarChart({ results }: Props) {
  const data = results.map((result, i) => {
    const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
    const voteNo    = result.voteNoExpected
    return {
      name: results.length === 1 ? '' : `Scenario ${i + 1}`,
      yes: scenarioA.preJcbaTotal,
      no:  voteNo.preJcbaTotal,
    }
  })

  // Single scenario: wider gap so the pair isn't stretched wall-to-wall
  const categoryGap = results.length === 1 ? '62%' : '38%'

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: '#c9a84c' }} />
          Vote Yes
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: '#94a3b8' }} />
          Vote No (expected)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          barGap={0}
          barCategoryGap={categoryGap}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.04)' }} />
          <ReferenceLine y={0} stroke="var(--border)" />
          {/* Left bar of the pair — rounded on top-left only */}
          <Bar dataKey="yes" name="Vote Yes"        fill="#c9a84c" radius={[4, 0, 0, 0]} />
          {/* Right bar of the pair — rounded on top-right only */}
          <Bar dataKey="no"  name="Vote No (exp.)"  fill="#94a3b8" radius={[0, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
