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
  collapsible?: boolean
  defaultExpanded?: boolean
}

function RiskCard({ dotColor, title, value, valueColor, body, accentBg, accentBorder, collapsible = false, defaultExpanded = true }: RiskCardProps) {
  const [open, setOpen] = useState(defaultExpanded)
  const bg = accentBg ?? 'var(--bg-surface)'
  const border = accentBorder ?? '1px solid var(--border-subtle)'

  const header = (
    <>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
        <span className="text-xs font-semibold uppercase tracking-wide leading-snug break-words" style={{ color: 'var(--text-faint)' }}>
          {title}
        </span>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-1.5 pl-3.5">
        <span className="text-sm font-black tabular-nums leading-tight text-right" style={{ color: valueColor }}>{value}</span>
        {collapsible && (
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="var(--text-faint)" strokeWidth="1.8" strokeLinecap="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
          >
            <path d="M2 4l4 4 4-4"/>
          </svg>
        )}
      </div>
    </>
  )

  return (
    <div className="rounded-xl overflow-hidden min-w-0" style={{ background: bg, border }}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full px-4 py-3 text-left"
          style={{ background: 'transparent' }}
        >
          {header}
        </button>
      ) : (
        <div className="px-4 py-3">{header}</div>
      )}
      {(!collapsible || open) && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{body}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function computeRiskRewardMetrics(result: ComparisonResult) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const { jcbaDurationMonths: jcba, arrivalMonths, percentAboveTA } = result.voteNoScenario
  const { retentionPayoutProbabilityB: pB, retentionPayoutProbabilityC: pC, retentionCurrentBalance } = result.inputs

  const bNominalGap =
    (scenarioB.totalGrossPay + scenarioB.totalProfitSharing + scenarioB.totalRetention) -
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing + scenarioA.totalRetention)

  const bRetPayoutRow = scenarioB.rows.find(r => r.retentionCashFlow > 0)
  const bRetPayoutMonths = bRetPayoutRow?.monthIndex ?? (arrivalMonths + 2)

  const cWagesShortfall =
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing) -
    (scenarioC.totalGrossPay + scenarioC.totalProfitSharing)

  const cRetentionForegone = scenarioA.totalRetention
  const cHeadlineLoss = cWagesShortfall + cRetentionForegone

  const cRetPayoutRow = scenarioC.rows.find(r => r.retentionCashFlow > 0)
  const cRetPayoutMonths = cRetPayoutRow?.monthIndex ?? (jcba + 2)

  let cRetAccrued = retentionCurrentBalance
  for (const row of scenarioC.rows) {
    if (row.monthIndex >= cRetPayoutMonths) break
    cRetAccrued += row.retentionAccrualNote
  }

  const cExpectedRetentionPayout = cRetAccrued * pC
  const cNetAfterRetention = cHeadlineLoss - cExpectedRetentionPayout

  return {
    jcba,
    arrivalMonths,
    percentAboveTA,
    retentionCurrentBalance,
    pB,
    pC,
    bNominalGap,
    bRetPayoutRow,
    bRetPayoutMonths,
    cWagesShortfall,
    cHeadlineLoss,
    cNetAfterRetention,
    cRetAccrued,
    cExpectedRetentionPayout,
  }
}

function RiskRewardHeadline({ result }: { result: ComparisonResult }) {
  const { bNominalGap, cHeadlineLoss } = computeRiskRewardMetrics(result)
  const upsideIsGain = bNominalGap >= 0
  const upsideAmount = fmt(Math.abs(bNominalGap))
  const riskAmount = fmt(Math.abs(cHeadlineLoss))

  return (
    <p className="text-base leading-relaxed" style={{ color: 'var(--text-base)' }}>
      If a second offer arrives, you stand to{' '}
      <strong style={{ color: upsideIsGain ? 'var(--positive)' : 'var(--negative)' }}>
        {upsideIsGain ? 'gain' : 'lose'} {upsideAmount}
      </strong>
      {' '}vs. Voting Yes
      {cHeadlineLoss > 0 ? (
        <>
          {' '}— but you&apos;re risking{' '}
          <strong style={{ color: 'var(--negative)' }}>{riskAmount}</strong>
          {' '}if no offer arrives.
        </>
      ) : (
        <>
          {' '}— and if no offer arrives, you still come out{' '}
          <strong style={{ color: 'var(--positive)' }}>{riskAmount} ahead</strong>
          {' '}on nominal pay vs. Voting Yes.
        </>
      )}
    </p>
  )
}

function RiskRewardBreakdown({
  result,
  collapsible = false,
  defaultExpanded = true,
}: {
  result: ComparisonResult
  collapsible?: boolean
  defaultExpanded?: boolean
}) {
  const {
    jcba,
    arrivalMonths,
    percentAboveTA,
    retentionCurrentBalance,
    pB,
    pC,
    bNominalGap,
    bRetPayoutRow,
    bRetPayoutMonths,
    cWagesShortfall,
    cHeadlineLoss,
    cNetAfterRetention,
    cRetAccrued,
    cExpectedRetentionPayout,
  } = computeRiskRewardMetrics(result)

  return (
    <div style={{ background: 'var(--bg-elevated)' }}>
      <div className="px-4 pt-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

          <RiskCard
            dotColor={bNominalGap >= 0 ? 'var(--positive)' : 'var(--negative)'}
            title="If the second offer arrives"
            value={<>{bNominalGap >= 0 ? '+' : '−'}{fmt(Math.abs(bNominalGap))}</>}
            valueColor={bNominalGap >= 0 ? 'var(--positive)' : 'var(--negative)'}
            collapsible={collapsible}
            defaultExpanded={defaultExpanded}
            body={
              <>
                If the second offer arrives in {arrivalMonths} month{arrivalMonths !== 1 ? 's' : ''} at {(percentAboveTA * 100).toFixed(0)}% higher, then you will make an additional{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(Math.abs(bNominalGap))}</strong> in pay, profit sharing, and retention between now and JCBA closing in {jcba} months vs. Voting Yes.
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
            collapsible={collapsible}
            defaultExpanded={defaultExpanded}
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
            dotColor={cNetAfterRetention > 0 ? 'var(--warning)' : 'var(--positive)'}
            title="Worth the Risk?"
            value={<>{cNetAfterRetention > 0 ? '−' : '+'}{fmt(Math.abs(cNetAfterRetention))} if No Offer</>}
            valueColor={cNetAfterRetention > 0 ? 'var(--warning)' : 'var(--positive)'}
            accentBg={cNetAfterRetention > 0 ? 'rgba(245,158,11,0.07)' : 'rgba(34,197,94,0.07)'}
            accentBorder={`1px solid ${cNetAfterRetention > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`}
            collapsible={collapsible}
            defaultExpanded={defaultExpanded}
            body={
              <>
                Your current Retention Bonus of <strong style={{ color: 'var(--text-muted)' }}>{fmt(retentionCurrentBalance)}</strong> will accrue to{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(cRetAccrued)}</strong> during the {jcba}-month JCBA period.
                At {Math.round(pC * 100)}% payout probability, that lump sum is expected to pay{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(cExpectedRetentionPayout)}</strong>.
                {cNetAfterRetention > 0
                  ? <>
                      {' '}So while the retention bonus will make you partially whole, you&apos;d still be roughly{' '}
                      <strong style={{ color: 'var(--warning)' }}>{fmt(cNetAfterRetention)} behind</strong> vs. Voting Yes if no offer arrives.
                      {' '}So, no matter how high you rate the probability of a second offer, is the potential upside worth the risk?
                    </>
                  : <>
                      {' '}So even in the worst case, the retention bonus more than offsets the CBA earnings gap once accrual is counted.
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
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
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
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${scenarioColor}`, background: 'var(--bg-surface)' }}>
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          style={{ background: 'transparent' }}
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: scenarioColor }} />
          <span className="font-bold text-sm" style={{ color: scenarioColor }}>{label}</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <RiskRewardHelp />
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
            style={{ background: 'transparent' }}
          >
            <svg
              width="14" height="14" viewBox="0 0 12 12" fill="none"
              stroke="var(--text-faint)" strokeWidth="1.8" strokeLinecap="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <path d="M2 4l4 4 4-4"/>
            </svg>
          </button>
        </div>
      </div>

      {expanded ? (
        <>
          <RiskRewardBreakdown result={result} collapsible defaultExpanded={false} />
          <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            <span className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              Assumptions: {fmtAssumptionsFooter(result.voteNoScenario)}
            </span>
          </div>
        </>
      ) : (
        <div className="px-5 py-3" style={{ background: 'var(--bg-elevated)' }}>
          <span className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            Assumptions: {fmtAssumptionsFooter(result.voteNoScenario)}
          </span>
        </div>
      )}
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
