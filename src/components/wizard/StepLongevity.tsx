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
      subtitle="This is your pay step on the contract scale. Longevity 1 is your first year, max is 12."
      onBack={prevStep}
    >
      <div className="mb-8">
        {/* Longevity grid — large tap targets */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((yr) => (
            <button
              key={yr}
              onClick={() => setInput('longevityAsOfJul2026', yr)}
              className={`py-4 rounded-xl text-lg font-bold transition-all duration-200 ${
                longevity === yr
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        {/* Current rate preview */}
        {inputs.seat && currentRate !== null && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your current hourly rate</div>
            <div className="text-2xl font-bold text-blue-400">
              ${currentRate.toFixed(2)}/hr
            </div>
            <div className="text-xs text-gray-500 mt-1">Current CBA (DOS+5)</div>
          </div>
        )}
      </div>
      <NavButton onClick={nextStep}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
