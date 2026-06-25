import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'

export function StepExtraHours() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const extra = inputs.extraHoursAboveMMG ?? 0
  const hasValue = inputs.extraHoursAboveMMG !== undefined
  const mmg = inputs.lineType === 'RESERVE' ? 72 : 70

  return (
    <WizardLayout
      step="extraHours"
      title="How many additional PCH do you credit on average each month?"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-4">
        <NumberInput
          value={extra}
          onChange={(v) => setInput('extraHoursAboveMMG', Math.max(0, v))}
          suffix="hrs/mon"
          min={0}
          max={50}
          placeholder="0"
        />

        {inputs.seat && inputs.longevityAsOfJul2026 && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              Monthly hours preview
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>MMG hours</span>
              <span className="font-medium" style={{ color: 'var(--text-base)' }}>{mmg} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Extra hours</span>
              <span className="font-medium" style={{ color: 'var(--text-base)' }}>+{extra} hrs</span>
            </div>
            <div
              className="flex justify-between pt-2 border-t"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Total hours</span>
              <span className="font-bold" style={{ color: 'var(--gold)' }}>{mmg + extra} hrs</span>
            </div>
          </div>
        )}

      </div>
      <NavButton onClick={nextStep} disabled={!hasValue}>Continue</NavButton>
    </WizardLayout>
  )
}
