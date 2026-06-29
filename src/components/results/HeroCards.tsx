import { useEffect, useRef, useState } from 'react'
import type { ComparisonResult, VoteNoScenario } from '../../lib/types'
import { VOTE_NO_CSS, VOTE_YES_CSS } from '../../lib/resultColors'

const VOTE_YES_COLOR = VOTE_YES_CSS
const VOTE_NO_COLOR = VOTE_NO_CSS

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function fmtAssumptionsFooter(vns: VoteNoScenario) {
  return `${Math.round(vns.probability * 100)}% 2nd Offer Probability in ${vns.arrivalMonths}mons | ${(vns.percentAboveTA * 100).toFixed(0)}% Higher | JCBA in ${vns.jcbaDurationMonths}mons`
}

const BOTTOM_LINE_HELP = (
  'These are Pre-JCBA decision window numbers: the present value of all earnings during this period in today\'s dollars. '
  + 'After the JCBA concludes, all paths converge to the same rates, therefore cancelling out those years for a more simplified estimate.'
)

function BottomLineHelp() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="About this bottom line comparison"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="w-5 h-5 rounded-full text-xs font-bold leading-none transition-colors"
        style={{
          color: 'var(--text-faint)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        ?
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-20 w-64 rounded-xl px-3 py-2.5 text-xs leading-relaxed shadow-lg"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          {BOTTOM_LINE_HELP}
        </div>
      )}
    </div>
  )
}

// ── Risk/reward breakdown ──────────────────────────────────────────────────────

interface RiskCardProps {
  dotColor: string
  title: string
  value: React.ReactNode
  valueColor: string
  body: React.ReactNode
  accentBg?: string
  accentBorder?: string
}

function RiskCard({ dotColor, title, value, valueColor, body, accentBg, accentBorder }: RiskCardProps) {
  const [open, setOpen] = useState(false)
  const bg = accentBg ?? 'var(--bg-surface)'
  const border = accentBorder ?? '1px solid var(--border-subtle)'
  return (
    <div className="rounded-xl overflow-hidden min-w-0" style={{ background: bg, border }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 text-left"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
          <span className="text-xs font-semibold uppercase tracking-wide leading-snug break-words" style={{ color: 'var(--text-faint)' }}>
            {title}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-1.5 pl-3.5">
          <span className="text-sm font-black tabular-nums leading-tight text-right" style={{ color: valueColor }}>{value}</span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="var(--text-faint)" strokeWidth="1.8" strokeLinecap="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
          >
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0">
          <div className="border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{body}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function RiskRewardBreakdown({ result }: { result: ComparisonResult }) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const { jcbaDurationMonths: jcba, arrivalMonths, percentAboveTA } = result.voteNoScenario
  const { retentionPayoutProbabilityB: pB, retentionPayoutProbabilityC: pC, retentionCurrentBalance } = result.inputs

  // ── Best case: Outcome B (offer arrives) ─────────────────────────────────────
  const bPVGap = scenarioB.preJcbaTotal - scenarioA.preJcbaTotal   // + = Vote No wins

  const bRetPayoutRow = scenarioB.rows.find(r => r.retentionCashFlow > 0)
  const bRetPayoutMonths = bRetPayoutRow?.monthIndex ?? (arrivalMonths + 2)

  // ── Worst case: Outcome C (no offer, stay on CBA) ────────────────────────────
  // Nominal wages + PS you give up compared to accepting the TA today
  const cWagesShortfall =
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing) -
    (scenarioC.totalGrossPay + scenarioC.totalProfitSharing)   // + = Vote No earns less

  // Vote Yes pays current retention balance at ratification; Scenario C delays it
  const cRetentionForegone = scenarioA.totalRetention
  const cHeadlineLoss = cWagesShortfall + cRetentionForegone

  // Full PV gap worst case (includes retention in both; + = Vote Yes leads even after retention)
  const cPVGap = scenarioA.preJcbaTotal - scenarioC.preJcbaTotal

  // ── Retention bonus growth & recovery (Scenario C) ───────────────────────────
  // Find the payout row to get exact timing and discount factor
  const cRetPayoutRow = scenarioC.rows.find(r => r.retentionCashFlow > 0)
  const cRetPayoutMonths = cRetPayoutRow?.monthIndex ?? (jcba + 2)

  // Nominal accrued balance at payout — sum of starting balance + monthly accruals
  let cRetAccrued = retentionCurrentBalance
  for (const row of scenarioC.rows) {
    if (row.monthIndex >= cRetPayoutMonths) break
    cRetAccrued += row.retentionAccrualNote
  }

  // PV of the probability-weighted payout (retentionCashFlow already × pC in engine)
  const cRetPV = cRetPayoutRow
    ? cRetPayoutRow.retentionCashFlow * cRetPayoutRow.discountFactor
    : 0

  return (
    <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="px-4 pt-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" style={{ background: 'var(--bg-elevated)' }}>

          <RiskCard
            dotColor={bPVGap >= 0 ? 'var(--positive)' : 'var(--negative)'}
            title="If the second offer arrives"
            value={<>{bPVGap >= 0 ? '+' : '−'}{fmt(Math.abs(bPVGap))}</>}
            valueColor={bPVGap >= 0 ? 'var(--positive)' : 'var(--negative)'}
            body={
              <>
                If the second offer arrives in {arrivalMonths} month{arrivalMonths !== 1 ? 's' : ''} at {(percentAboveTA * 100).toFixed(0)}% higher, then you will make an additional{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(Math.abs(bPVGap))}</strong> in today&apos;s dollars between now and JCBA closing in {jcba} months vs. Voting Yes.
                {bRetPayoutRow && (
                  <> This number also includes your Retention Bonus payment in {bRetPayoutMonths} month{bRetPayoutMonths !== 1 ? 's' : ''} from now at {Math.round(pB * 100)}% payout probability.</>
                )}
              </>
            }
          />

          <RiskCard
            dotColor={cHeadlineLoss > 0 ? 'var(--negative)' : 'var(--positive)'}
            title="If no offer arrives"
            value={<>{cHeadlineLoss > 0 ? '−' : '+'}{fmt(Math.abs(cHeadlineLoss))}</>}
            valueColor={cHeadlineLoss > 0 ? 'var(--negative)' : 'var(--positive)'}
            body={
              cWagesShortfall > 0
                ? <>
                    If the second offer doesn&apos;t arrive and you earn the current CBA rates until the closing of JCBA in {jcba} months, you&apos;d be missing out on{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(cWagesShortfall)}</strong> in nominal wages and profit sharing vs. Voting Yes.
                    Additionally, you&apos;d delay your lump sum Retention Bonus payment of{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(retentionCurrentBalance)}</strong>.
                  </>
                : <>
                    If the second offer doesn&apos;t arrive, CBA pay rates in this scenario keep your earnings competitive vs. Voting Yes.
                    You&apos;d still delay your lump sum Retention Bonus payment of{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(retentionCurrentBalance)}</strong> until JCBA closes in {jcba} months.
                  </>
            }
          />

          <div className="md:col-span-2 xl:col-span-1 min-w-0">
          <RiskCard
            dotColor={cPVGap > 0 ? 'var(--warning)' : 'var(--positive)'}
            title="Worth the Risk?"
            value={<>{cPVGap > 0 ? '−' : '+'}{fmt(Math.abs(cPVGap))} if No Offer</>}
            valueColor={cPVGap > 0 ? 'var(--warning)' : 'var(--positive)'}
            accentBg={cPVGap > 0 ? 'rgba(245,158,11,0.07)' : 'rgba(34,197,94,0.07)'}
            accentBorder={`1px solid ${cPVGap > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`}
            body={
              <>
                Your current Retention Bonus of <strong style={{ color: 'var(--text-muted)' }}>{fmt(retentionCurrentBalance)}</strong> will accrue to{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(cRetAccrued)}</strong> during the {jcba}-month JCBA period.
                At {Math.round(pC * 100)}% payout probability, that lump sum is worth{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(cRetPV)}</strong> in today&apos;s dollars.
                {cPVGap > 0
                  ? <>
                      {' '}So while the retention bonus will make you partially whole, you&apos;d still be roughly{' '}
                      <strong style={{ color: 'var(--warning)' }}>{fmt(cPVGap)} behind</strong> vs. Voting Yes.
                      {' '}So, no matter how high you rate the probability of a second offer, is the potential upside worth the risk?
                    </>
                  : <>
                      {' '}So even in the worst case, the retention bonus more than offsets the CBA earnings gap — Vote No comes out ahead once accrual is counted.
                    </>}
              </>
            }
          />
          </div>

        </div>
    </div>
  )
}

// ── Single scenario: verdict card ─────────────────────────────────────────────

function SingleScenarioVerdict({ result }: { result: ComparisonResult }) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = result.voteNoExpected
  const aVal      = scenarioA.preJcbaTotal
  const noVal     = voteNo.preJcbaTotal
  const diff      = aVal - noVal
  const aWins     = diff > 0
  const maxVal    = Math.max(aVal, noVal)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      {/* Verdict */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Bottom line
          </div>
          <BottomLineHelp />
        </div>
        <div className="text-3xl font-black leading-tight" style={{ color: aWins ? VOTE_YES_COLOR : VOTE_NO_COLOR }}>
          {aWins ? 'Vote Yes' : 'Vote No'} leads
        </div>
        <div className="text-xl font-bold mt-0.5" style={{ color: aWins ? VOTE_YES_COLOR : VOTE_NO_COLOR, opacity: 0.85 }}>
          by {fmt(Math.abs(diff))}
        </div>
      </div>

      {/* Comparison rows */}
      <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: 'var(--border-subtle)', paddingTop: '16px' }}>
        {[
          { label: 'Vote Yes', sub: 'Accept the TA', val: aVal, color: VOTE_YES_COLOR },
          { label: 'Vote No',  sub: 'Probability-weighted expected value', val: noVal, color: VOTE_NO_COLOR },
        ].map(({ label, sub, val, color }) => (
          <div key={label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{sub}</span>
              </div>
              <span className="text-base font-bold tabular-nums" style={{ color }}>{fmt(val)}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(val / maxVal) * 100}%`, background: color, opacity: label === 'Vote No' ? 0.4 : 1 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Risk/reward accordion */}
      <RiskRewardBreakdown result={result} />

      {/* Assumptions */}
      <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          Assumptions: {fmtAssumptionsFooter(result.voteNoScenario)}
        </span>
      </div>
    </div>
  )
}

// ── Compact benchmark card (Average / Worst Case) ─────────────────────────────

const REFERENCE_LABELS = ['Average', 'Worst Case']
const REFERENCE_SCENARIO_COLORS = ['#3b82f6', 'var(--negative)']

function CompactScenarioCard({ result, label, color }: { result: ComparisonResult; label: string; color: string }) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = result.voteNoExpected
  const aVal      = scenarioA.preJcbaTotal
  const noVal     = voteNo.preJcbaTotal
  const diff      = aVal - noVal
  const aWins     = diff > 0
  const maxVal    = Math.max(aVal, noVal)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${color}`, background: 'var(--bg-surface)' }}>
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="font-bold text-sm" style={{ color }}>{label}</span>
        </div>
        <BottomLineHelp />
      </div>

      <div className="px-5 pt-4 pb-4">
        <div className="mb-3">
          <div className="text-xl font-black leading-tight" style={{ color: aWins ? VOTE_YES_COLOR : VOTE_NO_COLOR }}>
            {aWins ? 'Vote Yes' : 'Vote No'} leads
          </div>
          <div className="text-base font-bold" style={{ color: aWins ? VOTE_YES_COLOR : VOTE_NO_COLOR, opacity: 0.85 }}>
            by {fmt(Math.abs(diff))}
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { label: 'Vote Yes', val: aVal, color: VOTE_YES_COLOR },
            { label: 'Vote No',  val: noVal, color: VOTE_NO_COLOR },
          ].map(({ label: rowLabel, val, color }) => (
            <div key={rowLabel}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color }}>{rowLabel}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color }}>{fmt(val)}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(val / maxVal) * 100}%`, background: color, opacity: rowLabel === 'Vote No' ? 0.4 : 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          Assumptions: {fmtAssumptionsFooter(result.voteNoScenario)}
        </span>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function HeroCards({ results }: Props) {
  const userResult       = results[0]
  const referenceResults = results.slice(1)

  return (
    <div className="space-y-4">
      {/* User's scenario — full risk/reward breakdown */}
      <SingleScenarioVerdict result={userResult} />

      {/* Industry benchmarks (Average, Worst Case) */}
      {referenceResults.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: 'var(--text-faint)' }}>
            Industry benchmarks
          </div>
          {referenceResults.map((result, i) => (
            <CompactScenarioCard
              key={i}
              result={result}
              label={REFERENCE_LABELS[i] ?? `Scenario ${i + 2}`}
              color={REFERENCE_SCENARIO_COLORS[i] ?? 'var(--text-muted)'}
            />
          ))}
        </div>
      )}

      <p className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
        After the JCBA concludes, all paths converge to the same rates — those years cancel out.
      </p>
    </div>
  )
}
