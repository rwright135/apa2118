import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'
import { getRate } from '../../data/payScales'
import { CONTRACT_PARAMS } from '../../data/contractParams'
import { getLongevityAt } from '../../lib/engine'

const START_DATE = CONTRACT_PARAMS.TA_EFFECTIVE_DATE // July 1, 2026
const MMG_FLYING  = CONTRACT_PARAMS.MMG_FLYING        // 70
const MMG_RESERVE = CONTRACT_PARAMS.MMG_RESERVE_TA    // 72
const JAN_2027    = new Date(2027, 0, 1)
const JAN_2028    = new Date(2028, 0, 1)

type PayTier = 'TA_DOS_EOY2026' | 'TA_JAN2027' | 'TA_JAN2028'

const TIER_LABELS: Record<PayTier, string> = {
  TA_DOS_EOY2026: 'DOS tier',
  TA_JAN2027: 'Jan 2027 tier (DOS+6 Months)',
  TA_JAN2028: 'Jan 2028 tier (DOS+18 Months)',
}

/** Which AIP rate tier is in effect on a given date. */
function tierAt(date: Date): PayTier {
  if (date < JAN_2027) return 'TA_DOS_EOY2026'
  if (date < JAN_2028) return 'TA_JAN2027'
  return 'TA_JAN2028'
}

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}
function fmtRate(n: number) {
  return `$${n.toFixed(2)}`
}

interface TierRow {
  label: string
  sublabel: string
  rate: number
  raiseDollarsPerHr: number
  raiseMonthly: number
}

export function StepPayRaise() {
  const { inputs, setInput, nextStep, prevStep } = useStore()

  const seat        = inputs.seat ?? 'FO'
  const baseLon     = inputs.longevityAsOfJul2026 ?? 1
  const annivMonth  = inputs.anniversaryMonth ?? 0
  const lineType    = inputs.lineType ?? 'FLYING'
  const pct         = inputs.brokerageSavingsPct ?? 0.33
  const mmg         = lineType === 'FLYING' ? MMG_FLYING : MMG_RESERVE

  // Longevity at each TA effective date (Jan 1, 2027 and Jan 1, 2028)
  const lonAt2027 = getLongevityAt(baseLon, annivMonth, START_DATE, new Date(2027, 0, 1))
  const lonAt2028 = getLongevityAt(baseLon, annivMonth, START_DATE, new Date(2028, 0, 1))

  const cbaRate  = getRate(seat, baseLon,   'CBA')
  const dosRate  = getRate(seat, baseLon,   'TA_DOS_EOY2026')
  const jan27Rate = getRate(seat, lonAt2027, 'TA_JAN2027')
  const jan28Rate = getRate(seat, lonAt2028, 'TA_JAN2028')

  const tiers: TierRow[] = [
    {
      label: 'Current (CBA)',
      sublabel: 'What you earn today',
      rate: cbaRate,
      raiseDollarsPerHr: 0,
      raiseMonthly: 0,
    },
    {
      label: 'Jul 2026 (DOS)',
      sublabel: 'Effective July 1 · includes back pay',
      rate: dosRate,
      raiseDollarsPerHr: dosRate - cbaRate,
      raiseMonthly: (dosRate - cbaRate) * mmg,
    },
    {
      label: 'Jan 2027 (DOS+6 Months)',
      sublabel: `Longevity year ${lonAt2027}`,
      rate: jan27Rate,
      raiseDollarsPerHr: jan27Rate - cbaRate,
      raiseMonthly: (jan27Rate - cbaRate) * mmg,
    },
    {
      label: 'Jan 2028 (DOS+18 Months)',
      sublabel: `Longevity year ${lonAt2028} · final tier`,
      rate: jan28Rate,
      raiseDollarsPerHr: jan28Rate - cbaRate,
      raiseMonthly: (jan28Rate - cbaRate) * mmg,
    },
  ]

  // Upgrade context for FO pilots — use whichever AIP tier is actually in
  // effect on the pilot's upgrade date, not always the initial DOS tier.
  const upgradeDate = inputs.upgradeToCAInYears != null
    ? new Date(2026 + inputs.upgradeToCAInYears, 6, 1)
    : null
  const upgradeTier = upgradeDate != null ? tierAt(upgradeDate) : null
  const upgradeLon = upgradeDate != null
    ? getLongevityAt(baseLon, annivMonth, START_DATE, upgradeDate)
    : null
  const upgradeCARate = (seat === 'FO' && upgradeLon != null && upgradeTier != null)
    ? getRate('CA', upgradeLon, upgradeTier)
    : null
  // How much more per month the CA rate pays vs. staying FO at that same date/tier
  const upgradeFORate = (upgradeLon != null && upgradeTier != null)
    ? getRate('FO', upgradeLon, upgradeTier)
    : null
  const upgradeRaiseMonthly = (upgradeCARate != null && upgradeFORate != null)
    ? (upgradeCARate - upgradeFORate) * mmg
    : null

  return (
    <WizardLayout
      step="payRaise"
      title="Investing your Bridge Agreement Pay Raise"
      subtitle="How much of your raise will you invest? Saved to a brokerage account and compounded to retirement."
      onBack={prevStep}
    >
      <SliderInput
        value={Math.round(pct * 100)}
        min={0}
        max={100}
        step={1}
        onChange={(v) => setInput('brokerageSavingsPct', v / 100)}
        formatValue={(v) => `${v}%`}
        showMinMax
      />

      {/* Tier cards */}
      <div className="mb-6 mt-8 space-y-3">
        {tiers.map((tier, i) => {
          const isCurrent = i === 0
          const hasRaise  = tier.raiseMonthly > 0
          const invested  = tier.raiseMonthly * pct
          return (
            <div
              key={tier.label}
              className="rounded-xl px-4 py-4"
              style={{
                background: isCurrent ? 'var(--bg-subtle)' : 'var(--bg-elevated)',
                border: isCurrent ? '1px solid var(--border)' : '1px solid var(--border-subtle)',
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold" style={{ color: isCurrent ? 'var(--text-muted)' : 'var(--text-base)' }}>
                    {tier.label}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {fmtRate(tier.rate)}/hr
                  </div>
                </div>
              </div>

              {/* Raise + investment rows */}
              {hasRaise && (
                <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Monthly Raise</span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--positive)' }}>
                      +{fmt(tier.raiseMonthly)}/mo
                    </span>
                  </div>
                  {pct > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Savings/Month</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--gold)' }}>
                        {fmt(invested)}/mo
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* CA upgrade preview for FO pilots */}
        {seat === 'FO' && upgradeCARate != null && upgradeRaiseMonthly != null && inputs.upgradeToCAInYears != null && (
          <div className="rounded-xl px-4 py-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--gold)' }}>
              After upgrade to Captain (Year {inputs.upgradeToCAInYears})
            </div>

            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>
                  CAPT Year {upgradeLon}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  {upgradeTier ? TIER_LABELS[upgradeTier] : ''}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {fmtRate(upgradeCARate)}/hr
                </div>
              </div>
            </div>

            {/* Raise row */}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>More per Month vs. Staying FO</span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--positive)' }}>
                  +{fmt(upgradeRaiseMonthly)}/mo
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
