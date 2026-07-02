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

  // Upgrade context for FO pilots
  const upgradeLon = inputs.upgradeToCAInYears != null
    ? getLongevityAt(baseLon, annivMonth, START_DATE, new Date(2026 + inputs.upgradeToCAInYears, 6, 1))
    : null
  const upgradeCARate = (seat === 'FO' && upgradeLon != null && inputs.upgradeToCAInYears != null)
    ? getRate('CA', upgradeLon, 'TA_DOS_EOY2026')
    : null

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    setInput('brokerageSavingsPct', Number(e.target.value) / 100)
  }

  return (
    <WizardLayout
      step="payRaise"
      title="Investing your Bridge Agreement Pay Raise"
      subtitle="Set how much of your raise to invest, then see the impact across each contract tier."
      onBack={prevStep}
    >
      {/* Investment slider — top */}
      <div className="rounded-xl px-4 py-4 mb-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>
              How much of your raise will you invest?
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Saved to a brokerage account and compounded to retirement
            </div>
          </div>
          <div className="text-2xl font-black tabular-nums" style={{ color: 'var(--gold)' }}>
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

        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Tier cards */}
      <div className="mb-6 space-y-3">
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
                  <div className="text-lg font-bold tabular-nums" style={{ color: isCurrent ? 'var(--text-muted)' : 'var(--gold)' }}>
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
        {seat === 'FO' && upgradeCARate != null && inputs.upgradeToCAInYears != null && (
          <div className="rounded-xl px-4 py-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>
              After upgrade to Captain (year {inputs.upgradeToCAInYears})
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

      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
