import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'
import { SliderInput } from '../shared/SliderInput'

export function StepRetention() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const balance = inputs.retentionCurrentBalance ?? 0
  const prob = inputs.retentionPayoutProbability ?? 0.95
  const payoutDate = inputs.retentionPayoutDate

  const handlePayoutDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setInput('retentionPayoutDate', new Date(e.target.value + 'T00:00:00'))
  }

  const payoutDateString = payoutDate ? payoutDate.toISOString().split('T')[0] : ''

  return (
    <WizardLayout
      step="retention"
      title="Tell us about your retention bonus"
      subtitle="The retention bonus is a key financial variable — it's worth over $100K for many pilots and is treated differently under each contract path."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Current retention bonus balance</label>
          <NumberInput
            value={balance}
            onChange={(v) => setInput('retentionCurrentBalance', Math.max(0, v))}
            prefix="$"
            placeholder="0"
            min={0}
            step={1000}
          />
          <p className="text-xs text-gray-600 mt-1">Formula: rate × 85 hrs × 35%. This is your accrued balance.</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Expected payout date (if TA passes)</label>
          <div className="bg-white/5 border-2 border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
            <input
              type="date"
              value={payoutDateString}
              onChange={handlePayoutDateChange}
              className="w-full bg-transparent px-4 py-4 text-base font-semibold text-white outline-none [color-scheme:dark]"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">E.g., October 1, 2026 for 2.5-year anniversary</p>
        </div>

        <div>
          <SliderInput
            value={Math.round(prob * 100)}
            min={50}
            max={100}
            step={5}
            onChange={(v) => setInput('retentionPayoutProbability', v / 100)}
            formatValue={(v) => `${v}%`}
            label="Probability the retention bonus is paid out if we vote no (bankruptcy risk factor)"
            showMinMax
          />
          <p className="text-xs text-gray-500 mt-2">If the company faces financial trouble, there's a risk this bonus is never paid. Default: 95% certain.</p>
        </div>
      </div>
      <NavButton onClick={nextStep}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
