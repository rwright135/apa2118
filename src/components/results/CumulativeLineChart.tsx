import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import type { ComparisonResult } from '../../lib/types'
import { useResultChartColors } from './useResultChartColors'
import { POST_JCBA_UPLIFT } from '../../lib/scenarios'

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
 * 3 lines showing full career cumulative PV through retirement:
 *   1. Vote Yes            — solid gold   (TA × 1.20 post-JCBA)
 *   2. Vote No (Offer)     — dashed purple (bridge × 1.20 post-JCBA)
 *   3. Vote No (JCBA)      — dashed red   (TA × (1.20 × (1−penalty)) post-JCBA)
 *
 * The post-JCBA uplift means lines diverge after the JCBA month — Vote Yes
 * and Vote No (Offer) separate from Vote No (JCBA), which carries the penalty.
 */

const KEY_YES = 'Vote Yes'
const KEY_B   = 'Vote No (Offer)'
const KEY_C   = 'Vote No (JCBA)'

export function CumulativeLineChart({ results }: Props) {
  const { voteYes, textMuted, textFaint, scenarioOffer } = useResultChartColors()

  const refResult = results[0]
  const refA = refResult.scenarios.find(s => s.scenarioId === 'A')!
  // Show full career — all rows including post-JCBA so the divergence is visible
  const maxLen = refA.rows.length
  const step = Math.max(1, Math.floor(maxLen / 120))
  const jcbaMonth = refResult.voteNoScenario.jcbaDurationMonths

  const chartData: Record<string, number | string>[] = []
  // Track the JCBA boundary to draw a reference annotation
  let jcbaDataIndex = -1
  for (let i = 0; i < maxLen; i += step) {
    const rA = refA.rows[i]
    if (!rA) continue
    if (jcbaDataIndex < 0 && rA.monthIndex >= jcbaMonth) jcbaDataIndex = chartData.length

    const sA  = refResult.scenarios.find(s => s.scenarioId === 'A')!
    const sB  = refResult.scenarios.find(s => s.scenarioId === 'B')!
    const sC  = refResult.scenarios.find(s => s.scenarioId === 'C')!

    chartData.push({
      month:   `${rA.year}`,
      [KEY_YES]: Math.round(sA.rows[Math.min(i, sA.rows.length - 1)]?.cumulativePV ?? 0),
      [KEY_B]:   Math.round(sB.rows[Math.min(i, sB.rows.length - 1)]?.cumulativePV ?? 0),
      [KEY_C]:   Math.round(sC.rows[Math.min(i, sC.rows.length - 1)]?.cumulativePV ?? 0),
    })
  }

  const penalty = refResult.inputs.advancedPostJCBA?.scenarioCPenalty ?? 0.15
  const upliftPct = Math.round(POST_JCBA_UPLIFT * 100)
  const penaltyPct = Math.round(penalty * 100)
  const cJcbaRelativePct = Math.round((1 + POST_JCBA_UPLIFT) * (1 - penalty) * 100)
  const bJcbaRelativePct = Math.round((1 + refResult.voteNoScenario.percentAboveTA) * (1 + POST_JCBA_UPLIFT) * 100)
  // Label for the JCBA divider — use the year of that month
  const jcbaRow = refA.rows[jcbaMonth]
  const jcbaYear = jcbaRow?.year ?? ''

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <XAxis dataKey="month" tick={{ fill: textMuted, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtAxis} tick={{ fill: textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: textFaint }} />

          {jcbaDataIndex >= 0 && (
            <ReferenceLine
              x={chartData[jcbaDataIndex]?.month as string}
              stroke="var(--border)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              label={{ value: `JCBA ~${jcbaYear}`, position: 'insideTopRight', fontSize: 9, fill: textFaint }}
            />
          )}

          <Line type="monotone" dataKey={KEY_YES} stroke={voteYes} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey={KEY_B} stroke={scenarioOffer} strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.85} />
          <Line type="monotone" dataKey={KEY_C} stroke="var(--negative)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.85} />
        </LineChart>
      </ResponsiveContainer>

      {/* Post-JCBA assumption summary */}
      <div className="grid grid-cols-3 gap-2 text-[10px]" style={{ color: 'var(--text-faint)' }}>
        <div className="rounded-lg px-2 py-1.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="font-semibold" style={{ color: 'var(--gold)' }}>Vote Yes — JCBA</div>
          <div>TA rates +{upliftPct}% = {100 + upliftPct}% of TA</div>
        </div>
        <div className="rounded-lg px-2 py-1.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="font-semibold" style={{ color: scenarioOffer }}>Vote No (Offer) — JCBA</div>
          <div>Bridge rates +{upliftPct}% = ~{bJcbaRelativePct}% of TA</div>
        </div>
        <div className="rounded-lg px-2 py-1.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="font-semibold" style={{ color: 'var(--negative)' }}>Vote No (JCBA) — JCBA</div>
          <div>TA +{upliftPct}% −{penaltyPct}% penalty = {cJcbaRelativePct}% of TA</div>
        </div>
      </div>
    </div>
  )
}
