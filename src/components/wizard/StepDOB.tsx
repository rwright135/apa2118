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

  const dobString = dob
    ? dob.toISOString().split('T')[0]
    : ''

  return (
    <WizardLayout
      step="dob"
      title="What's your date of birth?"
      subtitle="We use this to calculate your mandatory retirement at age 65 — determining how long your cash flows run."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-4">
        <div className="bg-white/5 border-2 border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
          <input
            type="date"
            value={dobString}
            onChange={handleChange}
            max={new Date(new Date().getFullYear() - 21, 0, 1).toISOString().split('T')[0]}
            min={new Date(new Date().getFullYear() - 65, 0, 1).toISOString().split('T')[0]}
            className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-white outline-none [color-scheme:dark]"
          />
        </div>

        {yearsToRetirement !== null && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-sm text-gray-400">Years until mandatory retirement (age 65)</div>
            <div className="text-3xl font-bold text-blue-400 mt-1">{yearsToRetirement} years</div>
            <div className="text-xs text-gray-500 mt-1">Your calculation runs through {new Date().getFullYear() + yearsToRetirement}</div>
          </div>
        )}
      </div>
      <NavButton onClick={nextStep} disabled={!dob}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
