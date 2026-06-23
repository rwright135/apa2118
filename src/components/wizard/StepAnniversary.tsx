import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function StepAnniversary() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const anniversaryMonth = inputs.anniversaryMonth ?? 0

  return (
    <WizardLayout
      step="anniversary"
      title="What month is your new-hire anniversary?"
      subtitle="Your longevity steps up each year on this month. This matters for timing your pay increases."
      onBack={prevStep}
    >
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((month, idx) => (
            <button
              key={month}
              onClick={() => setInput('anniversaryMonth', idx)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                anniversaryMonth === idx
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {month.slice(0,3)}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Selected: <span className="text-white font-medium">{MONTHS[anniversaryMonth]}</span>
        </p>
      </div>
      <NavButton onClick={nextStep}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
