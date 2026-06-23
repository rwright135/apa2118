import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { SelectCard } from '../shared/SelectCard'
import { NavButton } from '../shared/NavButton'
import type { Seat } from '../../lib/types'

export function StepSeat() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const seat = inputs.seat

  return (
    <WizardLayout
      step="seat"
      title="What's your current seat?"
      subtitle="This determines which pay scale applies to your calculations."
      onBack={prevStep}
    >
      <div className="space-y-3 mb-8">
        <SelectCard
          selected={seat === 'FO'}
          onClick={() => setInput('seat', 'FO' as Seat)}
          icon="🪙"
          title="First Officer"
          description="Right seat — FO pay scales apply"
        />
        <SelectCard
          selected={seat === 'CA'}
          onClick={() => setInput('seat', 'CA' as Seat)}
          icon="✈️"
          title="Captain"
          description="Left seat — Captain pay scales apply"
        />
      </div>
      <NavButton onClick={nextStep} disabled={!seat}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
