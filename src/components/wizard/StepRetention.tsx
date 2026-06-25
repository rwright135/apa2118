import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'
import { SliderInput } from '../shared/SliderInput'

const RETENTION_SCENARIOS = [
  {
    key: 'B' as const,
    color: '#a855f7',
    title: 'Scenario B — Vote No + 2nd Offer',
    label: 'If we vote no and receive a second bridge offer prior to ratification of a JCBA, how likely will the bonus to be paid in full?',
    inputKey: 'retentionPayoutProbabilityB' as const,
  },
  {
    key: 'C' as const,
    color: 'var(--negative)',
    title: 'Scenario C — Vote No, No Offer',
    label: 'If we vote no, do not receive a second offer, and our next contract is ratified at the conclusion of JCBA, how likely will the bonus be paid in full?',
    inputKey: 'retentionPayoutProbabilityC' as const,
  },
]

function RetentionScenarioBox({
  color,
  title,
  children,
}: {
  color: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${color}`, background: 'var(--bg-surface)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="font-bold text-sm" style={{ color }}>{title}</span>
      </div>
      <div className="px-4 py-5">
        {children}
      </div>
    </div>
  )
}

export function StepRetention() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const balance = inputs.retentionCurrentBalance ?? 0
  const probB   = inputs.retentionPayoutProbabilityB ?? 0.95
  const probC   = inputs.retentionPayoutProbabilityC ?? 0.90

  return (
    <WizardLayout
      step="retention"
      title="Retention Bonus Information"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">

        {/* Balance */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            What will your estimated Rentention Bonus amount be on June 30th? Please include your estimated &ldquo;True Up&rdquo; as part of the total.
          </label>
          <NumberInput
            value={balance}
            onChange={(v) => setInput('retentionCurrentBalance', Math.max(0, v))}
            prefix="$"
            placeholder="0"
            min={0}
            step={1000}
          />

        </div>

        {/* Probability sliders */}
        {RETENTION_SCENARIOS.map((scenario) => {
          const prob = scenario.inputKey === 'retentionPayoutProbabilityB' ? probB : probC

          return (
            <RetentionScenarioBox key={scenario.key} color={scenario.color} title={scenario.title}>
              <SliderInput
                value={Math.round(prob * 100)}
                min={50}
                max={100}
                step={5}
                onChange={(v) => setInput(scenario.inputKey, v / 100)}
                formatValue={(v) => `${v}%`}
                label={scenario.label}
                showMinMax
              />
            </RetentionScenarioBox>
          )
        })}

      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
