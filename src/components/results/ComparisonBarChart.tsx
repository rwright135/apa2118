import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts'
import type { ComparisonResult } from '../../lib/types'

interface Props { results: ComparisonResult[] }

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

const SCENARIO_COLORS = ['#a855f7', '#22c55e', '#f59e0b']
const SCENARIO_LABELS = ['Scen 1', 'Scen 2', 'Scen 3']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="font-bold mb-1" style={{ color: 'var(--text-base)' }}>{label}</div>
      {payload.map((p: { name: string; value: number; fill: string }) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-bold" style={{ color: 'var(--text-base)' }}>{fmtAxis(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function ComparisonBarChart({ results }: Props) {
  const data = results.flatMap((result, i) => {
    const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
    const voteNo    = result.voteNoExpected
    const label     = results.length === 1 ? '' : `S${i + 1}`
    return [
      {
        name: results.length === 1 ? 'Vote Yes' : `Vote Yes (${label})`,
        value: scenarioA.preJcbaTotal,
        fill: '#c9a84c',
        group: i,
      },
      {
        name: results.length === 1 ? 'Vote No' : `Vote No (${label})`,
        value: voteNo.preJcbaTotal,
        fill: SCENARIO_COLORS[i],
        group: i,
      },
    ]
  })

  const barSize = results.length === 1 ? 72 : Math.max(32, Math.floor(300 / (results.length * 2 + 1)))

  return (
    <div>
      {results.length > 1 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {results.map((_, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: SCENARIO_COLORS[i] }} />
              {SCENARIO_LABELS[i]}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#c9a84c' }} />
            Vote Yes
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} barSize={barSize} barCategoryGap="20%">
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtAxis} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.04)' }} />
          {results.length > 1 && <Legend wrapperStyle={{ display: 'none' }} />}
          <ReferenceLine y={0} stroke="var(--border)" />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
