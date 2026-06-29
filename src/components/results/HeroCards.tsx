import { useEffect, useRef, useState } from 'react'
import type { ComparisonResult, VoteNoScenario } from '../../lib/types'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function fmtAssumptionsFooter(vns: VoteNoScenario) {
  return `${Math.round(vns.probability * 100)}% 2nd Offer Probability in ${vns.arrivalMonths}mons | ${(vns.percentAboveTA * 100).toFixed(0)}% Higher | JCBA in ${vns.jcbaDurationMonths}mons`
}

const RISK_REWARD_HELP = (
  'Instead of a single expected-value number, these cards show the upside if a second offer arrives, '
  + 'the downside if it doesn\'t, and whether the potential reward is worth the risk of voting No.'
)

function HelpButton({ label, helpText }: { label: string; helpText: string }) {
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
        aria-label={label}
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
          {helpText}
        </div>
      )}
    </div>
  )
}

function RiskRewardHelp() {
  return <HelpButton label="About this risk vs reward breakdown" helpText={RISK_REWARD_HELP} />
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
  const bg = accentBg ?? 'var(--bg-surface)'
  const border = accentBorder ?? '1px solid var(--border-subtle)'
  return (
    <div className="rounded-xl overflow-hidden min-w-0" style={{ background: bg, border }}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
          <span className="text-xs font-semibold uppercase tracking-wide leading-snug break-words" style={{ color: 'var(--text-faint)' }}>
            {title}
          </span>
        </div>
        <div className="flex items-center justify-end mt-1.5 pl-3.5">
          <span className="text-sm font-black tabular-nums leading-tight text-right" style={{ color: valueColor }}>{value}</span>
        </div>
      </div>
      <div className="px-4 pb-4 pt-0">
        <div className="border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{body}</p>
        </div>
      </div>
    </div>
  )
}

function computeRiskRewardMetrics(result: ComparisonResult) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const { jcbaDurationMonths: jcba, arrivalMonths, percentAboveTA } = result.voteNoScenario
  const { retentionPayoutProbabilityB: pB, retentionPayoutProbabilityC: pC, retentionCurrentBalance } = result.inputs

  const bPVGap = scenarioB.preJcbaTotal - scenarioA.preJcbaTotal

  const bRetPayoutRow = scenarioB.rows.find(r => r.retentionCashFlow > 0)
  const bRetPayoutMonths = bRetPayoutRow?.monthIndex ?? (arrivalMonths + 2)

  const cWagesShortfall =
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing) -
    (scenarioC.totalGrossPay + scenarioC.totalProfitSharing)

  const cRetentionForegone = scenarioA.totalRetention
  const cHeadlineLoss = cWagesShortfall + cRetentionForegone
  const cPVGap = scenarioA.preJcbaTotal - scenarioC.preJcbaTotal

  const cRetPayoutRow = scenarioC.rows.find(r => r.retentionCashFlow > 0)
  const cRetPayoutMonths = cRetPayoutRow?.monthIndex ?? (jcba + 2)

  let cRetAccrued = retentionCurrentBalance
  for (const row of scenarioC.rows) {
    if (row.monthIndex >= cRetPayoutMonths) break
    cRetAccrued += row.retentionAccrualNote
  }

  const cRetPV = cRetPayoutRow
    ? cRetPayoutRow.retentionCashFlow * cRetPayoutRow.discountFactor
    : 0

  return {
    jcba,
    arrivalMonths,
    percentAboveTA,
    retentionCurrentBalance,
    pB,
    pC,
    bPVGap,
    bRetPayoutRow,
    bRetPayoutMonths,
    cWagesShortfall,
    cHeadlineLoss,
    cPVGap,
    cRetAccrued,
    cRetPV,
  }
}

function RiskRewardHeadline({ result }: { result: ComparisonResult }) {
  const { bPVGap, cHeadlineLoss } = computeRiskRewardMetrics(result)
  const upsideIsGain = bPVGap >= 0
  const upsideAmount = fmt(Math.abs(bPVGap))
  const riskAmount = fmt(Math.abs(cHeadlineLoss))
  const upsideColor = upsideIsGain ? 'var(--positive)' : 'var(--negative)'
  const upsideBg = upsideIsGain ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)'
  const upsideBorder = upsideIsGain ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'
  const riskColor = cHeadlineLoss > 0 ? 'var(--negative)' : 'var(--positive)'
  const riskBg = cHeadlineLoss > 0 ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.10)'
  const riskBorder = cHeadlineLoss > 0 ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        {/* Reward */}
        <div
          className="rounded-xl px-4 py-4 text-center sm:text-left"
          style={{ background: upsideBg, border: `1.5px solid ${upsideBorder}` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: upsideColor }}>
            If 2nd offer arrives
          </div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-faint)' }}>
            You stand to {upsideIsGain ? 'gain' : 'lose'}
          </div>
          <div className="text-3xl font-black tabular-nums leading-none" style={{ color: upsideColor }}>
            {upsideIsGain ? '+' : '−'}{upsideAmount}
          </div>
          <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            vs. Voting Yes
          </div>
        </div>

        {/* VS divider */}
        <div className="hidden sm:flex flex-col items-center justify-center px-1">
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>but</span>
        </div>
        <div className="sm:hidden text-center text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          but
        </div>

        {/* Risk */}
        <div
          className="rounded-xl px-4 py-4 text-center sm:text-left"
          style={{ background: riskBg, border: `1.5px solid ${riskBorder}` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: riskColor }}>
            If no offer arrives
          </div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-faint)' }}>
            {cHeadlineLoss > 0 ? "You're risking" : 'You still come out'}
          </div>
          <div className="text-3xl font-black tabular-nums leading-none" style={{ color: riskColor }}>
            {cHeadlineLoss > 0 ? '−' : '+'}{riskAmount}
          </div>
          <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {cHeadlineLoss > 0 ? 'on nominal pay vs. Voting Yes' : 'ahead on nominal pay'}
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold text-center" style={{ color: 'var(--text-muted)' }}>
        Is the upside worth betting on Vote No?
      </p>
    </div>
  )
}

function RiskRewardBreakdown({ result }: { result: ComparisonResult }) {
  const {
    jcba,
    arrivalMonths,
    percentAboveTA,
    retentionCurrentBalance,
    pB,
    pC,
    bPVGap,
    bRetPayoutRow,
    bRetPayoutMonths,
    cWagesShortfall,
    cHeadlineLoss,
    cPVGap,
    cRetAccrued,
    cRetPV,
  } = computeRiskRewardMetrics(result)

  return (
    <div style={{ background: 'var(--bg-elevated)' }}>
      <div className="px-4 pt-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

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
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div
        className="px-5 pt-5 pb-5 border-b"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'linear-gradient(180deg, rgba(201,168,76,0.06) 0%, var(--bg-surface) 100%)',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
            Risk vs Reward
          </div>
          <RiskRewardHelp />
        </div>
        <RiskRewardHeadline result={result} />
      </div>

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

const BENCHMARK_SCENARIOS = [
  { label: 'Average', color: '#3b82f6' },
  { label: 'Worst Case', color: '#ef4444' },
] as const

function CompactScenarioCard({ result, label, scenarioColor }: { result: ComparisonResult; label: string; scenarioColor: string }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${scenarioColor}`, background: 'var(--bg-surface)' }}>
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: scenarioColor }} />
          <span className="font-bold text-sm" style={{ color: scenarioColor }}>{label}</span>
        </div>
        <RiskRewardHelp />
      </div>

      <RiskRewardBreakdown result={result} />

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
          {referenceResults.map((result, i) => {
            const benchmark = BENCHMARK_SCENARIOS[i]
            return (
              <CompactScenarioCard
                key={i}
                result={result}
                label={benchmark?.label ?? `Scenario ${i + 2}`}
                scenarioColor={benchmark?.color ?? 'var(--text-muted)'}
              />
            )
          })}
        </div>
      )}

      <p className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
        After the JCBA concludes, all paths converge to the same rates — those years cancel out.
      </p>
    </div>
  )
}
