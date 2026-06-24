import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'
import { SliderInput } from '../shared/SliderInput'

export function StepRetention() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const balance = inputs.retentionCurrentBalance ?? 0
  const prob    = inputs.retentionPayoutProbability ?? 0.95

  return (
    <WizardLayout
      step="retention"
      title="Tell us about your retention bonus"
      subtitle="Worth over $100K for many pilots — this is treated very differently under each contract path."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            What will your estimated Rentention Bonus amount be on June 30th? Please include your estimated &ldquo;True Up&rdquo; as part of the total.
          </label>
          <NumberInput
            value={balance}
            onChange={(v) => setInput('retentionCurrentBalance', Math.max(0, v))}
            prefix="$"
            placeholder="0"
            min={0}
            step={1000}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            Formula: hourly rate × 85 hrs × 35%
          </p>
        </div>

        <div>
          <SliderInput
            value={Math.round(prob * 100)}
            min={50}
            max={100}
            step={5}
            onChange={(v) => setInput('retentionPayoutProbability', v / 100)}
            formatValue={(v) => `${v}%`}
            label="Probability bonus is fully paid if we vote no (bankruptcy risk)"
            showMinMax
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            Only applies to Scenarios B and C. Vote Yes (Scenario A) is 100% certain.
          </p>
        </div>
      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
