import { useState } from 'react'
import type { ComparisonResult } from '../../lib/types'
import { SCENARIO_LABELS } from '../../lib/resultColors'
import { computeRiskRewardMetrics } from '../../lib/riskReward'
import { HelpButton } from '../shared/HelpButton'
import { Assumption, AssumptionsFooter, ASSUMPTIONS_FOOTNOTE, BENCHMARK_ASSUMPTIONS_FOOTNOTE } from './Assumption'
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

  return (
    <p className="text-base leading-relaxed" style={{ color: 'var(--text-base)' }}>
      Based on {assumptionLabel} assumptions, if a second offer arrives, you stand to{' '}
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
  assumptionsFootnote = ASSUMPTIONS_FOOTNOTE,
}: {
  result: ComparisonResult
  collapsible?: boolean
  defaultExpanded?: boolean
  assumptionsFootnote?: string
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
                If the second offer arrives in{' '}
                <Assumption>{arrivalMonths} month{arrivalMonths !== 1 ? 's' : ''}</Assumption>{' '}
                at{' '}
                <Assumption>{(percentAboveTA * 100).toFixed(0)}% higher</Assumption>, then you will make an additional{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{fmt(Math.abs(bNominalGap))}</strong> in pay, profit sharing, and retention between now and JCBA closing in{' '}
                <Assumption>{jcba} months</Assumption> vs. Voting Yes.
                {bRetPayoutRow && (
                  <>
                    {' '}This number also includes your Retention Bonus payment in{' '}
                    <Assumption>{bRetPayoutMonths} month{bRetPayoutMonths !== 1 ? 's' : ''}</Assumption>{' '}
                    from now at{' '}
                    <Assumption>{Math.round(pB * 100)}% payout probability</Assumption>.
                  </>
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
                    If the second offer doesn&apos;t arrive and you earn the current CBA rates until the closing of JCBA in{' '}
                    <Assumption>{jcba} months</Assumption>, you&apos;d be missing out on{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(cWagesShortfall)}</strong> in nominal wages and profit sharing vs. Voting Yes.
                    You&apos;d be delaying your guaranteed retention bonus payment of{' '}
                    <Assumption>{fmt(retentionCurrentBalance)}</Assumption>.
                  </>
                : <>
                    If the second offer doesn&apos;t arrive, CBA pay rates in this scenario keep your earnings competitive vs. Voting Yes.
                    You&apos;d still be delaying your guaranteed retention bonus payment of{' '}
                    <Assumption>{fmt(retentionCurrentBalance)}</Assumption> until JCBA closes in{' '}
                    <Assumption>{jcba} months</Assumption>.
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
            assumptionsFootnote={BENCHMARK_ASSUMPTIONS_FOOTNOTE}
          />
          <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            <AssumptionsFooter vns={result.voteNoScenario} />
          </div>
        </>
      ) : (
        <div className="px-5 py-3" style={{ background: 'var(--bg-elevated)' }}>
          <AssumptionsFooter vns={result.voteNoScenario} />
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            {BENCHMARK_ASSUMPTIONS_FOOTNOTE}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function HeroCards({ results }: Props) {
  const userResult       = results[0]
  const referenceResults = results.slice(1)
  const { scenarioAverage, scenarioWorst } = useResultChartColors()
  const benchmarkColors = [scenarioAverage, scenarioWorst]

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
                label={SCENARIO_LABELS[i + 1] ?? `Scenario ${i + 2}`}
                scenarioColor={benchmarkColors[i] ?? scenarioAverage}
              />
          ))}
        </div>
      )}
    </div>
  )
}
