import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function StepAnniversary() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const anniversaryMonth = inputs.anniversaryMonth

  return (
    <WizardLayout
      step="anniversary"
      title="What month is your new-hire anniversary?"
      onBack={prevStep}
    >
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((month, idx) => (
            <button
              key={month}
              onClick={() => setInput('anniversaryMonth', idx)}
              className="py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                anniversaryMonth !== undefined && anniversaryMonth === idx
                  ? { background: 'var(--btn-bg)', color: 'var(--btn-text)', outline: '2px solid var(--gold)', outlineOffset: '2px' }
                  : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <NavButton onClick={nextStep} disabled={anniversaryMonth === undefined}>Continue</NavButton>
    </WizardLayout>
  )
}
