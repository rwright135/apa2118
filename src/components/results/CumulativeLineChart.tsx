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
 * Chart lines — 5 total:
 *
 * Your scenario (3 solid lines):
 *   • Vote Yes
 *   • Vote No — 2nd Offer (upper bound of voting no)
 *   • Vote No — No Offer  (lower bound of voting no)
 *
 * Benchmarks (1 dashed line each, blended Vote No):
 *   • Average
 *   • Worst Case
 *
 * Average and Worst Case are fixed scenarios with set assumptions.
 * They each show a single blended Vote No line — no B/C split.
 */

const BENCHMARK_LABELS: Record<number, string> = {
  1: 'Vote No (Avg)',
  2: 'Vote No (Worst)',
}

export function CumulativeLineChart({ results }: Props) {
  const { voteYes, voteNo, textMuted, textFaint, scenarioOffer, scenarioAverage, scenarioWorst } = useResultChartColors()

  // Use the longest JCBA window across all scenarios to set chart length
  const maxJcba = Math.max(...results.map(r => r.voteNoScenario.jcbaDurationMonths))
  const refResult = results[0]
  const refA = refResult.scenarios.find(s => s.scenarioId === 'A')!
  const maxLen = Math.min(maxJcba + 1, refA.rows.length)
  const step = Math.max(1, Math.floor(maxLen / 120))

  // Build chart data: one data key per line
  const KEY_YES   = 'Vote Yes'
  const KEY_B     = 'Vote No — 2nd Offer'
  const KEY_C     = 'Vote No — No Offer'

  const chartData: Record<string, number | string>[] = []
  for (let i = 0; i < maxLen; i += step) {
    const rA = refA.rows[i]
    if (!rA) continue
    const point: Record<string, number | string> = { month: `${rA.year}` }

    // Your scenario: 3 lines
    const sA = refResult.scenarios.find(s => s.scenarioId === 'A')!
    const sB = refResult.scenarios.find(s => s.scenarioId === 'B')!
    const sC = refResult.scenarios.find(s => s.scenarioId === 'C')!
    point[KEY_YES] = Math.round(sA.rows[Math.min(i, sA.rows.length - 1)]?.cumulativePV ?? 0)
    point[KEY_B]   = Math.round(sB.rows[Math.min(i, sB.rows.length - 1)]?.cumulativePV ?? 0)
    point[KEY_C]   = Math.round(sC.rows[Math.min(i, sC.rows.length - 1)]?.cumulativePV ?? 0)

    // Benchmarks: 1 blended Vote No line each
    results.slice(1).forEach((result, j) => {
      const key = BENCHMARK_LABELS[j + 1] ?? `Vote No (Scen ${j + 2})`
      const vn  = result.voteNoExpected
      point[key] = Math.round(vn.rows[Math.min(i, vn.rows.length - 1)]?.cumulativePV ?? 0)
    })

    chartData.push(point)
  }

  const benchmarkKeys = results.slice(1).map((_, j) => BENCHMARK_LABELS[j + 1] ?? `Vote No (Scen ${j + 2})`)
  const benchmarkColors = [scenarioAverage, scenarioWorst]

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <XAxis dataKey="month" tick={{ fill: textMuted, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtAxis} tick={{ fill: textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: textFaint }} />

          {/* Your scenario — 3 solid lines */}
          <Line type="monotone" dataKey={KEY_YES} stroke={voteYes}      strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey={KEY_B}   stroke={scenarioOffer} strokeWidth={2}   dot={false} />
          <Line type="monotone" dataKey={KEY_C}   stroke={voteNo}       strokeWidth={2}   dot={false} />

          {/* Benchmarks — 1 dashed line each */}
          {benchmarkKeys.map((key, j) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={benchmarkColors[j] ?? scenarioAverage}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              opacity={0.75}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
