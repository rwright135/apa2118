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
      subtitle="Worth over $100K for many pilots — this is treated very differently under each contract path."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            Current retention bonus balance
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
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            Expected payout date (if TA passes)
          </label>
          <div
            className="rounded-xl overflow-hidden border-2 transition-colors"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)')}
            onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
          >
            <input
              type="date"
              value={payoutDateString}
              onChange={handlePayoutDateChange}
              className="w-full bg-transparent px-4 py-4 text-base font-semibold outline-none"
              style={{ color: 'var(--text-base)' }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            E.g., October 1, 2026 for 2.5-year anniversary
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
            label="Probability the bonus is fully paid if we vote no (bankruptcy risk)"
            showMinMax
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            Default: 95%. Adjust down if you believe there's meaningful financial risk.
          </p>
        </div>
      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
