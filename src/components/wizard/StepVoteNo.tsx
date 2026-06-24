import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'
import { RetentionPayoutTable } from '../shared/RetentionPayoutTable'

export function StepVoteNo() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const offer = inputs.voteNoOffer ?? { probability: 0.50, arrivalMonths: 6, percentAboveTA: 0.10 }

  const update = (patch: Partial<typeof offer>) => {
    setInput('voteNoOffer', { ...offer, ...patch })
  }

  return (
    <WizardLayout
      step="voteNo"
      title="Your call: What happens if we vote no?"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-8">

        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Explain: </span>
          <span style={{ color: 'var(--text-muted)' }}>
            This calculator lets you set your own probability assumptions so you can empirically evaluate the value of a potential second offer — and a no-offer outcome — across multiple scenarios and timelines. There is no right or wrong answer; your inputs reflect your read of the situation.
          </span>
        </div>

        <div>
          <SliderInput
            value={Math.round(offer.probability * 100)}
            min={0}
            max={100}
            step={5}
            onChange={(v) => update({ probability: v / 100 })}
            formatValue={(v) => `${v}%`}
            label="Probability of a second bridge offer (Scenario B)"
            showMinMax
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            How confident are you that management comes back with another offer before JCBA?
          </p>
        </div>

        <div>
          <label className="block text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            If the second offer comes — how many months from now?
          </label>
          <SliderInput
            value={offer.arrivalMonths}
            min={3}
            max={12}
            step={1}
            onChange={(v) => update({ arrivalMonths: v })}
            formatValue={(v) => `${v} months`}
            showMinMax
          />
        </div>

        <div>
          <label className="block text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            How much better would that offer be vs. the TA?
          </label>
          <SliderInput
            value={Math.round(offer.percentAboveTA * 1000) / 10}
            min={5}
            max={20}
            step={0.5}
            onChange={(v) => update({ percentAboveTA: v / 100 })}
            formatValue={(v) => `+${v.toFixed(1)}%`}
            showMinMax
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            A positive number means the new offer beats the current TA rates.
          </p>
        </div>

        <RetentionPayoutTable
          arrivalMonths={offer.arrivalMonths}
          jcbaMonths={inputs.jcbaDurationMonths ?? 24}
          offerProbability={offer.probability}
          probB={inputs.retentionPayoutProbabilityB}
          probC={inputs.retentionPayoutProbabilityC}
        />

        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)' }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Important: </span>
          <span style={{ color: 'var(--text-muted)' }}>
            If there's no second offer, you stay on current CBA (DOS+5) rates all the way until the JCBA concludes. You set that timeline on the next screen.
          </span>
        </div>
      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
