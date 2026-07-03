import { useState } from 'react'
import type { ComparisonResult } from '../../lib/types'
import { SCENARIO_LABELS } from '../../lib/resultColors'
import { computeRiskRewardMetrics } from '../../lib/riskReward'
import { HelpButton } from '../shared/HelpButton'
import { Assumption, AssumptionsFooter, AssumptionsFootnote, BenchmarkAssumptionsFootnote } from './Assumption'
import { useResultChartColors } from './useResultChartColors'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

const RISK_REWARD_HELP = (
  'Instead of a single cumulative expected value number, these cards show the Risk vs. Reward of this binary outcome: '
  + 'the upside if a second offer arrives vs. the downside if it doesn\'t.'
)

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

function RiskRewardHeadline({
  result,
  assumptionScope = 'your',
}: {
  result: ComparisonResult
  assumptionScope?: 'your' | 'these'
}) {
  const { bNominalGap, cHeadlineLoss } = computeRiskRewardMetrics(result)
  const upsideIsGain = bNominalGap >= 0
  const upsideAmount = fmt(Math.abs(bNominalGap))
  const riskAmount = fmt(Math.abs(cHeadlineLoss))
  const assumptionLabel = assumptionScope === 'your' ? 'your' : 'these'

  if (!upsideIsGain) {
    // Voting No doesn't pay off even if the 2nd offer arrives
    return (
      <p className="text-base leading-relaxed" style={{ color: 'var(--text-base)' }}>
        Based on {assumptionLabel} assumptions, Voting No doesn&apos;t pay off either way:{' '}
        even with a 2nd offer you&apos;d be{' '}
        <strong style={{ color: 'var(--negative)' }}>down {upsideAmount}</strong>
        {cHeadlineLoss > 0 && (
          <>
            , and with no offer the loss grows to{' '}
            <strong style={{ color: 'var(--negative)' }}>{riskAmount}</strong>
          </>
        )}
        .
      </p>
    )
  }

  return (
    <p className="text-base leading-relaxed" style={{ color: 'var(--text-base)' }}>
      Based on {assumptionLabel} assumptions, if a second offer arrives, you stand to{' '}
      <strong style={{ color: 'var(--positive)' }}>gain {upsideAmount}</strong>
      {cHeadlineLoss > 0 ? (
        <>
          , but you&apos;re risking{' '}
          <strong style={{ color: 'var(--negative)' }}>{riskAmount}</strong>
          {' '}if no offer arrives.
        </>
      ) : (
        <>
          , and if no offer arrives, you still come out{' '}
          <strong style={{ color: 'var(--positive)' }}>{riskAmount} ahead</strong>
          {' '}on nominal pay.
        </>
      )}
    </p>
  )
}

// ── Mini breakdown tables inside each risk card ───────────────────────────────

function BreakdownRow({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</span>
      <span className="text-xs tabular-nums font-semibold" style={{ color: color ?? 'var(--text-base)', fontWeight: bold ? 700 : 600 }}>
        {value}
      </span>
    </div>
  )
}

function CollapsibleBreakdown({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
        style={{ color: 'var(--accent)' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
        {open ? 'Hide breakdown' : title}
      </button>
      {open && <div className="mt-1.5">{children}</div>}
    </div>
  )
}

function RiskRewardBreakdown({
  result,
  collapsible = false,
  defaultExpanded = true,
  assumptionsFootnote = <AssumptionsFootnote />,
}: {
  result: ComparisonResult
  collapsible?: boolean
  defaultExpanded?: boolean
  assumptionsFootnote?: React.ReactNode
}) {
  const {
    jcba,
    arrivalMonths,
    percentAboveTA,
    retentionCurrentBalance,
    investmentRate,
    pB,
    pC,
    bRetDiff,
    bNominalGap,
    bPayPlusPS_waiting,
    bPayPlusPS_afterOffer,
    bRetPayoutRow,
    bRetPayoutMonths,
    cPayDiff,
    cRetentionForegone,
    cWagesShortfall,
    cHeadlineLoss,
    cNetAfterRetention,
    cRetAccrued,
    cExpectedRetentionPayout,
    cExpectedRetentionPayoutPV,
    cRetPayoutMonths,
  } = computeRiskRewardMetrics(result)

  const bIsPositive = bNominalGap >= 0

  return (
    <div style={{ background: 'var(--bg-elevated)' }}>
      <div className="px-4 pt-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

          <RiskCard
            dotColor={bIsPositive ? 'var(--positive)' : 'var(--negative)'}
            title="If the second offer arrives"
            value={<>{bIsPositive ? '+' : '−'}{fmt(Math.abs(bNominalGap))}</>}
            valueColor={bIsPositive ? 'var(--positive)' : 'var(--negative)'}
            collapsible={collapsible}
            defaultExpanded={defaultExpanded}
            body={
              <>
                {bIsPositive ? (
                  <>
                    If the second offer arrives in{' '}
                    <Assumption>{arrivalMonths} month{arrivalMonths !== 1 ? 's' : ''}</Assumption>{' '}
                    at <Assumption>{(percentAboveTA * 100).toFixed(0)}% higher</Assumption>, you&apos;d collect{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(bNominalGap)} more</strong> in total pay,
                    profit sharing, and retention through JCBA closing in{' '}
                    <Assumption>{jcba} months</Assumption> versus Voting Yes.
                  </>
                ) : (
                  <>
                    Even if the second offer arrives in{' '}
                    <Assumption>{arrivalMonths} month{arrivalMonths !== 1 ? 's' : ''}</Assumption>{' '}
                    at <Assumption>{(percentAboveTA * 100).toFixed(0)}% higher</Assumption>, you&apos;d still be{' '}
                    <strong style={{ color: 'var(--negative)' }}>{fmt(Math.abs(bNominalGap))} behind</strong>{' '}
                    Voting Yes through JCBA closing in <Assumption>{jcba} months</Assumption>.
                    The delayed start on a higher rate doesn&apos;t fully overcome the CBA gap in this window.
                  </>
                )}
                {bRetPayoutRow && (
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {' '}Includes your Retention Bonus at <Assumption>{bRetPayoutMonths} month{bRetPayoutMonths !== 1 ? 's' : ''}</Assumption>{' '}
                    at <Assumption>{Math.round(pB * 100)}% payout probability</Assumption>.
                  </span>
                )}
                <CollapsibleBreakdown title="Show how this is calculated">
                  <BreakdownRow
                    label={`Pay + PS lost waiting (months 1–${arrivalMonths})`}
                    value={`${bPayPlusPS_waiting >= 0 ? '+' : '−'}${fmt(Math.abs(bPayPlusPS_waiting))}`}
                    color={bPayPlusPS_waiting >= 0 ? 'var(--positive)' : 'var(--negative)'}
                  />
                  <BreakdownRow
                    label={`Pay + PS gained after offer (months ${arrivalMonths + 1}–${jcba})`}
                    value={`${bPayPlusPS_afterOffer >= 0 ? '+' : '−'}${fmt(Math.abs(bPayPlusPS_afterOffer))}`}
                    color={bPayPlusPS_afterOffer >= 0 ? 'var(--positive)' : 'var(--negative)'}
                  />
                  <BreakdownRow label="Retention timing difference" value={`${bRetDiff >= 0 ? '+' : '−'}${fmt(Math.abs(bRetDiff))}`} color={bRetDiff >= 0 ? 'var(--positive)' : 'var(--negative)'} />
                  <BreakdownRow label="Total Nominal Value" value={`${bIsPositive ? '+' : '−'}${fmt(Math.abs(bNominalGap))}`} color={bIsPositive ? 'var(--positive)' : 'var(--negative)'} bold />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>
                    Verify in the month-by-month detail table below.
                  </p>
                </CollapsibleBreakdown>
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
                    Staying on CBA rates through JCBA in{' '}
                    <Assumption>{jcba} months</Assumption> costs{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(cWagesShortfall)}</strong> in pay and profit sharing,
                    plus the loss of the Voting Yes retention timing (worth{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(cRetentionForegone)}</strong>).
                    The &ldquo;Worth the Risk?&rdquo; card below accounts for your expected retention payout under this path.
                    <CollapsibleBreakdown title="Show how this is calculated">
                      <BreakdownRow label="Pay + profit sharing shortfall" value={`−${fmt(cPayDiff)}`} color="var(--negative)" />
                      <BreakdownRow label="Retention Bonus" value={`−${fmt(cRetentionForegone)}`} color="var(--negative)" />
                      <BreakdownRow label="Total Nominal Value" value={`−${fmt(cHeadlineLoss)}`} color="var(--negative)" bold />
                      <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>
                        Nominal, not discounted. Your expected Scenario C retention payout ({fmt(cExpectedRetentionPayout)}) offsets this in the &ldquo;Worth the Risk?&rdquo; card. Verify in the month-by-month detail table.
                      </p>
                    </CollapsibleBreakdown>
                  </>
                : <>
                    CBA pay rates in this scenario keep your earnings competitive through JCBA in{' '}
                    <Assumption>{jcba} months</Assumption>.
                    The main cost is delaying your guaranteed retention bonus payment of{' '}
                    <Assumption>{fmt(retentionCurrentBalance)}</Assumption>.
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
                Your current Retention Bonus of{' '}
                <Assumption>{fmt(retentionCurrentBalance)}</Assumption> will accrue to{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(cRetAccrued)}</strong> during the{' '}
                <Assumption>{jcba}-month</Assumption> JCBA period.
                At <Assumption>{Math.round(pC * 100)}% payout probability</Assumption>, that lump sum is expected to pay{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(cExpectedRetentionPayout)}</strong>.{' '}
                Discounted back <Assumption>{cRetPayoutMonths} months</Assumption> at{' '}
                <Assumption>{Math.round(investmentRate * 100)}%</Assumption>, that payout is worth{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(cExpectedRetentionPayoutPV)}</strong> in today&apos;s dollars.
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

        <p className="md:col-span-2 xl:col-span-3 px-1 text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          {assumptionsFootnote}
        </p>

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
        <AssumptionsFooter vns={result.voteNoScenario} />
      </div>
    </div>
  )
}

// ── Compact benchmark card (Average / Worst Case) ─────────────────────────────

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
          <div className="px-5 pt-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <RiskRewardHeadline result={result} assumptionScope="these" />
          </div>
          <RiskRewardBreakdown
            result={result}
            collapsible
            defaultExpanded={false}
            assumptionsFootnote={<BenchmarkAssumptionsFootnote />}
          />
          <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            <AssumptionsFooter vns={result.voteNoScenario} underlineValues={false} />
          </div>
        </>
      ) : (
        <div className="px-5 py-3" style={{ background: 'var(--bg-elevated)' }}>
          <AssumptionsFooter vns={result.voteNoScenario} underlineValues={false} />
        </div>
      )}
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

/** Your scenario's full risk/reward breakdown. */
export function UserRiskRewardCard({ results }: Props) {
  return <SingleScenarioVerdict result={results[0]} />
}

/** Industry benchmarks (Average, Worst Case) — rendered separately so callers
 *  can place other cards (e.g. Vegas Odds) between this and the user's card. */
export function IndustryBenchmarkCards({ results }: Props) {
  const referenceResults = results.slice(1)
  const { scenarioAverage, scenarioWorst } = useResultChartColors()
  const benchmarkColors = [scenarioAverage, scenarioWorst]

  if (referenceResults.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: 'var(--text-faint)' }}>
        Industry benchmarks
      </div>
      {referenceResults.map((result, i) => (
          <CompactScenarioCard
            key={i}
            result={result}
            label={SCENARIO_LABELS[i + 1] ?? `Scenario ${i + 2}`}
            scenarioColor={benchmarkColors[i] ?? scenarioAverage}
          />
      ))}
    </div>
  )
}
