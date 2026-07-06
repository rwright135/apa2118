import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { ScenarioColorCard } from '../shared/ScenarioColorCard'
import { CALCULATOR_SCENARIOS } from '../../lib/calculatorScenarios'

export function StepScenariosIntro() {
  const { nextStep, prevStep } = useStore()

  return (
    <WizardLayout
      step="scenariosIntro"
      title="The Scenarios This Calculator Uses"
      subtitle="Every comparison in this tool is built from three paths through the decision window, but your vote produces a binary outcome. Voting Yes reflects Scenario A. Voting No blends Scenarios B and C with probability weights based on your assumptions later in the wizard."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-4">
        {CALCULATOR_SCENARIOS.map(({ id, body }) => (
          <ScenarioColorCard key={id} scenarioId={id}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {body}
            </p>
          </ScenarioColorCard>
        ))}
      </div>

      <NavButton onClick={nextStep}>Acknowledge &amp; Continue</NavButton>
    </WizardLayout>
  )
}
