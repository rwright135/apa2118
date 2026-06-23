import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'

export function StepExtraHours() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const extra = inputs.extraHoursAboveMMG ?? 0

  const mmg = inputs.lineType === 'RESERVE' ? 72 : 70

  return (
    <WizardLayout
      step="extraHours"
      title="How many extra pay-credit hours do you average per month?"
      subtitle="Most pilots fly more than the MMG. Every extra hour means the pay-rate difference between scenarios multiplies. Enter 0 if you fly exactly the guarantee."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-4">
        <NumberInput
          value={extra}
          onChange={(v) => setInput('extraHoursAboveMMG', Math.max(0, v))}
          suffix="hours/mo above MMG"
          min={0}
          max={50}
          placeholder="0"
        />

        {inputs.seat && inputs.longevityAsOfJul2026 && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Monthly pay preview (current CBA)</div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">MMG hours</span>
              <span className="text-white font-medium">{mmg} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Extra hours</span>
              <span className="text-white font-medium">+{extra} hrs</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="text-gray-400 text-sm font-medium">Total hours</span>
              <span className="text-blue-400 font-bold">{mmg + extra} hrs</span>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 leading-relaxed">
          💡 Flying an extra 20 hours means you're not just losing the MMG pay difference — you're losing 20 more hours of that pay gap every month.
        </p>
      </div>
      <NavButton onClick={nextStep}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
