import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { SelectCard } from '../shared/SelectCard'
import { NavButton } from '../shared/NavButton'
import type { LineType } from '../../lib/types'

export function StepLineType() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const lineType = inputs.lineType

  return (
    <WizardLayout
      step="lineType"
      title="Are you primarily a Line Holder or Reserve?"
      subtitle="This affects your minimum monthly guarantee (MMG) — the base hours used to calculate your pay."
      onBack={prevStep}
    >
      <div className="space-y-3 mb-8">
        <SelectCard
          selected={lineType === 'FLYING'}
          onClick={() => setInput('lineType', 'FLYING' as LineType)}
          icon="🛫"
          title="Flying Line Holder"
          description="MMG: 70 hrs/month (both CBA and TA)"
        />
        <SelectCard
          selected={lineType === 'RESERVE'}
          onClick={() => setInput('lineType', 'RESERVE' as LineType)}
          icon="🧑‍✈️"
          title="Reserve Line Holder"
          description="MMG: 72 hrs (CBA) → 75 hrs (TA)"
        />
      </div>
      <NavButton onClick={nextStep} disabled={!lineType}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
