import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { ComparisonResult } from '../../lib/types'

interface Props { results: ComparisonResult[] }

const VOTE_YES_COLOR = '#c9a84c'
const VOTE_NO_COLOR = '#7ba3c9'

interface ChartDatum {
  name: string
  value: number
  fill: string
}

function fmtAxis(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload as ChartDatum | undefined
  return (
    <div className="rounded-xl px-3 py-2.5 text-sm shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      {label && <div className="font-semibold mb-1.5 text-xs uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{label}</div>}
      <div className="flex justify-between gap-6">
        <span style={{ color: entry?.fill ?? payload[0].fill }}>{entry?.name ?? payload[0].name}</span>
        <span className="font-bold tabular-nums" style={{ color: 'var(--text-base)' }}>{fmtAxis(payload[0].value as number)}</span>
      </div>
    </div>
  )
}

function buildChartData(results: ComparisonResult[]): ChartDatum[] {
  return results.flatMap((result, i) => {
    const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
    const voteNo = result.voteNoExpected
    const prefix = results.length > 1 ? `Scenario ${i + 1} · ` : ''

    return [
      { name: `${prefix}Vote Yes`, value: scenarioA.preJcbaTotal, fill: VOTE_YES_COLOR },
      { name: `${prefix}Vote No (exp.)`, value: voteNo.preJcbaTotal, fill: VOTE_NO_COLOR },
    ]
  })
}

export function ComparisonBarChart({ results }: Props) {
  const data = buildChartData(results)
  const categoryGap = results.length === 1 ? '62%' : '38%'

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: VOTE_YES_COLOR }} />
          Vote Yes
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-block w-3 h-2 rounded-sm" style={{ background: VOTE_NO_COLOR }} />
          Vote No (expected)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          barCategoryGap={categoryGap}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            tickFormatter={(value: string) => (results.length === 1 ? '' : value)}
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
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
