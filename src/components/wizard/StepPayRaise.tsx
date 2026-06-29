import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { getRate } from '../../data/payScales'
import { CONTRACT_PARAMS } from '../../data/contractParams'
import { getLongevityAt } from '../../lib/engine'

const START_DATE = CONTRACT_PARAMS.TA_EFFECTIVE_DATE // July 1, 2026
const MMG_FLYING  = CONTRACT_PARAMS.MMG_FLYING        // 70
const MMG_RESERVE = CONTRACT_PARAMS.MMG_RESERVE_TA    // 72

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}
function fmtRate(n: number) {
  return `$${n.toFixed(2)}`
}

function formatUpgradeDate(yearsFromStart: number) {
  return `Jul ${2026 + yearsFromStart}`
}

interface TierRow {
  label: string
  sublabel: string
  rate: number
  monthlyPay: number
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
      monthlyPay: cbaRate * mmg,
      raiseMonthly: 0,
    },
    {
      label: 'Jul 2026 (DOS)',
      sublabel: 'Back Pay Effective July 1st',
      rate: dosRate,
      monthlyPay: dosRate * mmg,
      raiseMonthly: (dosRate - cbaRate) * mmg,
    },
    {
      label: 'Jan 2027',
      sublabel: `${lonAt2027} Year ${seat}`,
      rate: jan27Rate,
      monthlyPay: jan27Rate * mmg,
      raiseMonthly: (jan27Rate - cbaRate) * mmg,
    },
    {
      label: 'Jan 2028',
      sublabel: `${lonAt2028} Year ${seat} · final tier`,
      rate: jan28Rate,
      monthlyPay: jan28Rate * mmg,
      raiseMonthly: (jan28Rate - cbaRate) * mmg,
    },
  ]

  // Upgrade context for FO pilots
  const upgradeLon = inputs.upgradeToCAInYears != null
    ? getLongevityAt(baseLon, annivMonth, START_DATE, new Date(2026 + inputs.upgradeToCAInYears, 6, 1))
    : null
  const upgradeCARate = (seat === 'FO' && upgradeLon != null && inputs.upgradeToCAInYears != null)
    ? getRate('CA', upgradeLon, 'TA_DOS_EOY2026')
    : null

  // For the slider preview, use the DOS raise as the reference
  const dosRaiseMonthly = tiers[1].raiseMonthly
  const monthlySavings  = Math.max(0, dosRaiseMonthly) * pct

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    setInput('brokerageSavingsPct', Number(e.target.value) / 100)
  }

  return (
    <WizardLayout
      step="payRaise"
      title="Your pay raise"
      subtitle="See how your hourly rate changes with the new contract — and decide how much of your raise to invest."
      onBack={prevStep}
    >
      <div className="mb-6 space-y-2">
        {tiers.map((tier, i) => {
          const isCurrent = i === 0
          const hasRaise  = tier.raiseMonthly > 0
          return (
            <div
              key={tier.label}
              className="rounded-xl px-4 py-3"
              style={{
                background: isCurrent ? 'var(--bg-subtle)' : 'var(--bg-elevated)',
                border: isCurrent ? '1px solid var(--border)' : '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold" style={{ color: isCurrent ? 'var(--text-muted)' : 'var(--text-base)' }}>
                    {tier.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {tier.sublabel}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold tabular-nums" style={{ color: isCurrent ? 'var(--text-muted)' : 'var(--gold)' }}>
                    {fmtRate(tier.rate)}/hr
                  </div>
                  <div className="text-xs tabular-nums" style={{ color: 'var(--text-faint)' }}>
                    {fmt(tier.monthlyPay)}/mo
                  </div>
                  {hasRaise && (
                    <div className="text-xs font-semibold tabular-nums mt-0.5" style={{ color: 'var(--positive)' }}>
                      +{fmt(tier.raiseMonthly)}/mo
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* CA upgrade preview for FO pilots */}
        {seat === 'FO' && upgradeCARate != null && inputs.upgradeToCAInYears != null && (
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>
              After upgrade to Captain ({formatUpgradeDate(inputs.upgradeToCAInYears)})
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Captain rate at longevity {upgradeLon} · DOS tier
              </div>
              <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--gold)' }}>
                {fmtRate(upgradeCARate)}/hr · {fmt(upgradeCARate * mmg)}/mo
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Savings slider */}
      <div className="rounded-xl px-4 py-4 mb-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>
              How much of your raise will you invest?
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Saved to a brokerage account and compounded to retirement
            </div>
          </div>
          <div className="text-xl font-black tabular-nums" style={{ color: 'var(--gold)' }}>
            {Math.round(pct * 100)}%
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pct * 100)}
          onChange={handleSlider}
          className="w-full"
          style={{ accentColor: 'var(--gold)' }}
        />

        <div className="flex justify-between text-xs mt-1 mb-4" style={{ color: 'var(--text-faint)' }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        {dosRaiseMonthly > 0 ? (
          <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>
              At the July 2026 rate, your monthly raise is {fmt(dosRaiseMonthly)}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black tabular-nums" style={{ color: 'var(--gold)' }}>
                {fmt(monthlySavings)}/mo
              </span>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>invested in your brokerage</span>
            </div>
            {pct === 0 && (
              <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                Slide to model brokerage savings
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-center py-2" style={{ color: 'var(--text-faint)' }}>
            Enter your longevity to see rate details
          </div>
        )}
      </div>

      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
