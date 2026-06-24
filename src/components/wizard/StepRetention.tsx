import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'
import { SliderInput } from '../shared/SliderInput'

export function StepRetention() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const balance = inputs.retentionCurrentBalance ?? 0
  const probB   = inputs.retentionPayoutProbabilityB ?? 0.95
  const probC   = inputs.retentionPayoutProbabilityC ?? 0.90

  return (
    <WizardLayout
      step="retention"
      title="Retention Bonus Information"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">

        {/* Balance */}
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

        {/* Probability B — Vote No + 2nd offer */}
        <div>
          <SliderInput
            value={Math.round(probB * 100)}
            min={50}
            max={100}
            step={5}
            onChange={(v) => setInput('retentionPayoutProbabilityB', v / 100)}
            formatValue={(v) => `${v}%`}
            label="If we vote no and get a second offer — how likely is the bonus paid in full?"
            showMinMax
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            Covers the scenario where management returns with a bridge offer before JCBA.
          </p>
        </div>

        {/* Probability C — Vote No, wait for JCBA */}
        <div>
          <SliderInput
            value={Math.round(probC * 100)}
            min={50}
            max={100}
            step={5}
            onChange={(v) => setInput('retentionPayoutProbabilityC', v / 100)}
            formatValue={(v) => `${v}%`}
            label="If we vote no and wait all the way to JCBA — how likely is the bonus paid in full?"
            showMinMax
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            Covers the scenario where no second offer comes and the bonus accrues until JCBA concludes.
          </p>
        </div>

      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
