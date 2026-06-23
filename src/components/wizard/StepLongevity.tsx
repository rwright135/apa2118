import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'

const FO_RATES = [57.67,103.07,110.73,116.99,123.56,129.24,135.13,139.19,144.80,148.39,151.35,155.61]
const CA_RATES = [163.29,171.42,178.27,185.36,192.76,198.54,204.49,210.60,215.85,221.24,225.65,232.00]

export function StepLongevity() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const longevity = inputs.longevityAsOfJul2026 ?? 1

  const currentRate = inputs.seat === 'FO'
    ? FO_RATES[longevity - 1]
    : inputs.seat === 'CA'
    ? CA_RATES[longevity - 1]
    : null

  return (
    <WizardLayout
      step="longevity"
      title="What's your longevity as of July 1, 2026?"
      subtitle="Your pay step on the contract scale. Year 1 is your first full year, max is 12."
      onBack={prevStep}
    >
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((yr) => (
            <button
              key={yr}
              onClick={() => setInput('longevityAsOfJul2026', yr)}
              className="py-4 rounded-xl text-lg font-bold transition-all duration-200"
              style={
                longevity === yr
                  ? { background: 'var(--btn-bg)', color: 'var(--btn-text)', outline: '2px solid var(--gold)', outlineOffset: '2px' }
                  : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {yr}
            </button>
          ))}
        </div>

        {inputs.seat && currentRate !== null && (
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>
              Your current hourly rate
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
              ${currentRate.toFixed(2)}/hr
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Current CBA (DOS+5)</div>
          </div>
        )}
      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
