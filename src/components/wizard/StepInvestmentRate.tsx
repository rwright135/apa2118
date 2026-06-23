import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'

const PRESETS = [
  { label: 'HYSA', value: 4.1, desc: 'Safe / conservative' },
  { label: 'S&P 500', value: 7.95, desc: '50-yr inflation-adj avg' },
  { label: 'S&P Nominal', value: 10.7, desc: '50-yr nominal avg' },
]

export function StepInvestmentRate() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const rate = inputs.investmentRate ?? 0.0795

  const ratePct = Math.round(rate * 1000) / 10

  return (
    <WizardLayout
      step="investmentRate"
      title="What return do you expect on your money?"
      subtitle="This rate does two jobs: it discounts future pay to today's dollars AND compounds your 401(k) contributions forward to retirement."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <SliderInput
          value={ratePct}
          min={3}
          max={20}
          step={0.1}
          onChange={(v) => setInput('investmentRate', v / 100)}
          formatValue={(v) => `${v.toFixed(1)}%`}
          showMinMax
        />

        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(({ label, value, desc }) => (
            <button
              key={label}
              onClick={() => setInput('investmentRate', value / 100)}
              className={`py-3 px-2 rounded-xl text-center transition-all duration-200 ${
                Math.abs(ratePct - value) < 0.05
                  ? 'bg-blue-600/20 border-2 border-blue-500 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="font-bold text-sm">{value}%</div>
              <div className="text-xs font-medium mt-0.5">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{desc}</div>
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-sm text-gray-400 leading-relaxed">
          <span className="text-blue-400 font-medium">Why this matters:</span> Getting $50K more in 401(k) contributions today vs 2 years from now — and growing it for 20 years — is a much bigger number than it looks.
        </div>
      </div>
      <NavButton onClick={nextStep}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
