import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'

export function StepVoteNo() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const offer = inputs.voteNoOffer ?? { probability: 0.25, arrivalMonths: 18, percentAboveTA: 0.03 }

  const update = (patch: Partial<typeof offer>) => {
    setInput('voteNoOffer', { ...offer, ...patch })
  }

  return (
    <WizardLayout
      step="voteNo"
      title="If we vote no — what do you think happens?"
      subtitle="Allegiant just offered this as a bridge deal before joint JCBA negotiations. Some pilots think a second offer is coming. What do you believe?"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-8">
        <div>
          <SliderInput
            value={Math.round(offer.probability * 100)}
            min={5}
            max={50}
            step={2.5}
            onChange={(v) => update({ probability: v / 100 })}
            formatValue={(v) => `${v}%`}
            label="Probability of a second bridge offer (Scenario B)"
            showMinMax
          />
          <p className="text-xs text-gray-500 mt-2">How confident are you that management comes back with another offer before JCBA?</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-3">If the second offer comes — how many months from now?</label>
          <SliderInput
            value={offer.arrivalMonths}
            min={3}
            max={36}
            step={1}
            onChange={(v) => update({ arrivalMonths: v })}
            formatValue={(v) => `${v} months`}
            showMinMax
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-3">How much better would that offer be vs. the TA?</label>
          <SliderInput
            value={Math.round(offer.percentAboveTA * 100)}
            min={0}
            max={20}
            step={0.5}
            onChange={(v) => update({ percentAboveTA: v / 100 })}
            formatValue={(v) => `+${v.toFixed(1)}%`}
            showMinMax
          />
          <p className="text-xs text-gray-500 mt-2">A positive number means the new offer beats the current TA rates.</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200/80 leading-relaxed">
          <span className="font-medium text-amber-300">Important:</span> If there's no second offer, you stay on current CBA (DOS+5) rates all the way until the JCBA concludes. You set that timeline on the next screen.
        </div>
      </div>
      <NavButton onClick={nextStep}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
