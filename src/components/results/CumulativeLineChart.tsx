import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ComparisonResult } from '../../lib/types'
import { useResultChartColors } from './useResultChartColors'

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

/**
 * 4 lines, ordered left-to-right in the legend:
 *   1. Vote Yes            — solid gold
 *   2. Vote No (blended)   — solid blue/vote-no
 *   3. Vote No — 2nd Offer — dashed purple  (B: upper bound)
 *   4. Vote No — No Offer  — dashed red     (C: lower bound)
 *
 * Average and Worst Case benchmarks are removed — too many lines.
 */

const KEY_YES    = 'Vote Yes'
const KEY_NO     = 'Vote No (blended)'
const KEY_B      = 'Vote No — 2nd Offer'
const KEY_C      = 'Vote No — No Offer'

export function CumulativeLineChart({ results }: Props) {
  const { voteYes, voteNo, textMuted, textFaint, scenarioOffer } = useResultChartColors()

  const maxJcba = Math.max(...results.map(r => r.voteNoScenario.jcbaDurationMonths))
  const refResult = results[0]
  const refA = refResult.scenarios.find(s => s.scenarioId === 'A')!
  const maxLen = Math.min(maxJcba + 1, refA.rows.length)
  const step = Math.max(1, Math.floor(maxLen / 120))

  const chartData: Record<string, number | string>[] = []
  for (let i = 0; i < maxLen; i += step) {
    const rA = refA.rows[i]
    if (!rA) continue

    const sA  = refResult.scenarios.find(s => s.scenarioId === 'A')!
    const sB  = refResult.scenarios.find(s => s.scenarioId === 'B')!
    const sC  = refResult.scenarios.find(s => s.scenarioId === 'C')!
    const vno = refResult.voteNoExpected

    chartData.push({
      month:   `${rA.year}`,
      [KEY_YES]: Math.round(sA.rows[Math.min(i, sA.rows.length - 1)]?.cumulativePV ?? 0),
      [KEY_NO]:  Math.round(vno.rows[Math.min(i, vno.rows.length - 1)]?.cumulativePV ?? 0),
      [KEY_B]:   Math.round(sB.rows[Math.min(i, sB.rows.length - 1)]?.cumulativePV ?? 0),
      [KEY_C]:   Math.round(sC.rows[Math.min(i, sC.rows.length - 1)]?.cumulativePV ?? 0),
    })
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <XAxis dataKey="month" tick={{ fill: textMuted, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtAxis} tick={{ fill: textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: textFaint }} />

          {/* Solid lines — Vote Yes and blended Vote No */}
          <Line type="monotone" dataKey={KEY_YES} stroke={voteYes}      strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey={KEY_NO}  stroke={voteNo}       strokeWidth={2}   dot={false} />

          {/* Dashed lines — individual paths showing the spread */}
          <Line type="monotone" dataKey={KEY_B}   stroke={scenarioOffer} strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.85} />
          <Line type="monotone" dataKey={KEY_C}   stroke="var(--negative)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.85} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
