import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'

export function StepDOB() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const dob = inputs.dateOfBirth

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val) setInput('dateOfBirth', new Date(val + 'T00:00:00'))
  }

  const yearsToRetirement = dob
    ? Math.max(0, 65 - (new Date().getFullYear() - dob.getFullYear()))
    : null

  const dobString = dob ? dob.toISOString().split('T')[0] : ''

  return (
    <WizardLayout
      step="dob"
      title="What's your date of birth?"
      subtitle="We use this to calculate your mandatory retirement at age 65 — determining how long your cash flows run."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-4">
        <div
          className="rounded-xl overflow-hidden border-2 transition-colors"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)')}
          onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
        >
          <input
            type="date"
            value={dobString}
            onChange={handleChange}
            max={new Date(new Date().getFullYear() - 21, 0, 1).toISOString().split('T')[0]}
            min={new Date(new Date().getFullYear() - 65, 0, 1).toISOString().split('T')[0]}
            className="w-full bg-transparent px-4 py-4 text-lg font-semibold outline-none"
            style={{ color: 'var(--text-base)' }}
          />
        </div>

        {yearsToRetirement !== null && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--chip-bg)', border: '1px solid var(--chip-border)' }}
          >
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Years until mandatory retirement (age 65)
            </div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--gold)' }}>
              {yearsToRetirement} years
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
              Your calculation runs through {new Date().getFullYear() + yearsToRetirement}
            </div>
          </div>
        )}
      </div>
      <NavButton onClick={nextStep} disabled={!dob}>Continue</NavButton>
    </WizardLayout>
  )
}
