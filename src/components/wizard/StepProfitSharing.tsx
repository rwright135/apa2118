import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'

const FO_CBA   = [57.67,103.07,110.73,116.99,123.56,129.24,135.13,139.19,144.80,148.39,151.35,155.61]
const FO_TA26  = [107.28,142.16,152.74,161.37,170.43,178.26,186.39,191.99,199.72,204.68,208.76,214.63]
const FO_TA27  = [115.20,156.49,171.99,188.40,199.61,208.13,211.13,213.01,214.30,215.67,216.68,218.14]
const FO_TA28  = [118.54,161.02,176.98,193.86,205.40,214.16,217.26,219.18,220.50,221.93,222.96,224.46]
const CA_CBA   = [163.29,171.42,178.27,185.36,192.76,198.54,204.49,210.60,215.85,221.24,225.65,232.00]
const CA_TA26  = [225.23,236.44,245.89,255.67,265.88,273.85,282.05,290.48,297.73,305.15,311.24,320.00]
const CA_TA27  = [253.78,259.19,267.79,284.92,304.22,306.25,308.28,312.68,318.76,324.82,327.71,345.00]
const CA_TA28  = [261.14,266.70,275.55,293.17,313.04,315.13,317.22,321.74,327.99,334.23,337.21,355.00]

interface Tier {
  label: string
  date: string
  rates: number[]
}

const FO_TIERS: Tier[] = [
  { label: 'TA Jul–Dec 2026', date: 'DOS–EOY 2026', rates: FO_TA26 },
  { label: 'TA January 2027', date: 'Jan 2027',     rates: FO_TA27 },
  { label: 'TA January 2028', date: 'Jan 2028',     rates: FO_TA28 },
]
const CA_TIERS: Tier[] = [
  { label: 'TA Jul–Dec 2026', date: 'DOS–EOY 2026', rates: CA_TA26 },
  { label: 'TA January 2027', date: 'Jan 2027',     rates: CA_TA27 },
  { label: 'TA January 2028', date: 'Jan 2028',     rates: CA_TA28 },
]

export function StepProfitSharing() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const ps = inputs.profitSharingLastYear ?? 0
  const l  = (inputs.longevityAsOfJul2026 ?? 1) - 1

  const cbaRate = inputs.seat === 'FO' ? FO_CBA[l] : inputs.seat === 'CA' ? CA_CBA[l] : null
  const tiers   = inputs.seat === 'FO' ? FO_TIERS  : inputs.seat === 'CA' ? CA_TIERS  : null
  const hasValue = ps > 0

  return (
    <WizardLayout
      step="profitSharing"
      title="What was your profit sharing last year?"
      subtitle={
        <>
          Enter your <strong>total</strong> estimated annual profit sharing payment and see how it scales proportionally with new pay rates for <u>your</u> seat and longevity.
        </>
      }
      onBack={prevStep}
    >
      <div className="mb-8 space-y-4">
        <NumberInput
          value={ps}
          onChange={(v) => setInput('profitSharingLastYear', Math.max(0, v))}
          prefix="$"
          placeholder="0"
          min={0}
          step={100}
        />

        {cbaRate !== null && tiers !== null && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* Header row */}
            <div
              className="flex justify-between items-center gap-3 px-4 py-2"
              style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-xs uppercase tracking-wide shrink-0" style={{ color: 'var(--text-faint)' }}>
                Profit Sharing Projection
              </span>
              <span className="text-xs shrink-0 text-right leading-snug min-w-[11rem]">
                {hasValue ? (
                  <span style={{ color: 'var(--text-faint)' }}>Annual</span>
                ) : (
                  <span
                    className="inline-block font-medium px-2 py-0.5 rounded"
                    style={{
                      background: 'var(--chip-bg)',
                      color: 'var(--chip-text)',
                      border: '1px solid var(--chip-border)',
                    }}
                  >
                    Enter a number above for the calculation.
                  </span>
                )}
              </span>
            </div>

            {/* Current CBA */}
            <div
              className="flex justify-between items-center px-4 py-3"
              style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Current CBA
              </span>
              <span
                className="font-semibold"
                style={{ color: hasValue ? 'var(--text-base)' : 'var(--text-faint)' }}
              >
                {hasValue ? `$${ps.toLocaleString()}` : 'TBD'}
              </span>
            </div>

            {/* Three TA tiers */}
            {tiers.map((tier, i) => {
              const isLast = i === tiers.length - 1
              const multiplier = hasValue ? tier.rates[l] / cbaRate : null
              const psPct      = multiplier !== null ? Math.round((multiplier - 1) * 100) : null
              const psAmt      = multiplier !== null ? Math.round(ps * multiplier) : null

              return (
                <div
                  key={tier.label}
                  className="flex justify-between items-center px-4 py-3"
                  style={{
                    background: isLast ? 'rgba(201,168,76,0.06)' : 'var(--bg-surface)',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="text-sm" style={{ color: isLast ? 'var(--text-base)' : 'var(--text-muted)' }}>
                    {tier.label}
                    {hasValue && psPct !== null && (
                      <>
                        {' '}
                        <span
                          className="text-xs font-semibold ml-1 px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(34,197,94,0.12)',
                            color: 'var(--positive)',
                          }}
                        >
                          +{psPct}%
                        </span>
                      </>
                    )}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: hasValue ? 'var(--positive)' : 'var(--text-faint)' }}
                  >
                    {hasValue && psAmt !== null ? `$${psAmt.toLocaleString()}` : 'TBD'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
