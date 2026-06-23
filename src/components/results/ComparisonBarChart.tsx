import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { ComparisonResult, ScenarioSummary } from '../../lib/types'

interface Props { results: ComparisonResult }

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

function totalValue(s: ScenarioSummary) {
  return s.presentValueTotal
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const value = payload[0].value as number
  const sub   = payload[0].payload?.sub as string | undefined
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="font-bold mb-0.5" style={{ color: 'var(--text-base)' }}>{label}</div>
      <div className="text-lg font-black" style={{ color: payload[0].fill }}>{fmtAxis(value)}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</div>}
    </div>
  )
}

export function ComparisonBarChart({ results }: Props) {
  const scenarioA = results.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = results.voteNoExpected
  const p         = results.inputs.voteNoOffer.probability

  const data = [
    {
      name: 'Vote Yes',
      value: totalValue(scenarioA),
      fill: '#c9a84c',
      sub: 'Accept the TA — value in today\'s dollars',
    },
    {
      name: 'Vote No',
      value: totalValue(voteNo),
      fill: '#1a2b4a',
      sub: `Probability-weighted · ${Math.round(p * 100)}% offer / ${Math.round((1 - p) * 100)}% no offer`,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} barSize={72}>
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtAxis} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.04)' }} />
        <ReferenceLine y={0} stroke="var(--border)" />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
