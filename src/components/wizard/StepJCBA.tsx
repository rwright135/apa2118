import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'

const JCBA_PRESETS = [
  { label: 'Optimistic', months: 18, desc: '1.5 years' },
  { label: 'Likely', months: 24, desc: '2 years' },
  { label: 'Conservative', months: 36, desc: '3 years' },
]

export function StepJCBA() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const months = inputs.jcbaDurationMonths ?? 24

  return (
    <WizardLayout
      step="jcba"
      title="How long until the JCBA is concluded?"
      subtitle="The Joint Collective Bargaining Agreement with Sun Country is the backstop. Until then, a 'no' vote means staying on current CBA rates."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <SliderInput
          value={months}
          min={12}
          max={72}
          step={3}
          onChange={(v) => setInput('jcbaDurationMonths', v)}
          formatValue={(v) => `${v} months (${(v/12).toFixed(1)} years)`}
          showMinMax
        />

        <div className="grid grid-cols-3 gap-2">
          {JCBA_PRESETS.map(({ label, months: m, desc }) => (
            <button
              key={label}
              onClick={() => setInput('jcbaDurationMonths', m)}
              className={`py-3 px-2 rounded-xl text-center transition-all duration-200 ${
                months === m
                  ? 'bg-blue-600/20 border-2 border-blue-500 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="font-bold text-sm">{desc}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-sm text-gray-400">
          <div className="text-white font-medium mb-2">What this means for you:</div>
          <div className="space-y-1">
            <div>• <span className="text-red-400">Vote No, no 2nd offer</span>: {months} months on DOS+5 rates before JCBA</div>
            <div>• <span className="text-green-400">Vote Yes</span>: TA rates effective July 1, 2026 through retirement</div>
          </div>
        </div>
      </div>
      <NavButton onClick={nextStep}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
