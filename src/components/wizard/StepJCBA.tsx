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
      subtitle="The Joint CBA with Sun Country is the backstop. Until then, a 'no' vote means staying on current CBA rates."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <SliderInput
          value={months}
          min={12}
          max={72}
          step={3}
          onChange={(v) => setInput('jcbaDurationMonths', v)}
          formatValue={(v) => `${v} mo (${(v / 12).toFixed(1)} yrs)`}
          showMinMax
        />

        <div className="grid grid-cols-3 gap-2">
          {JCBA_PRESETS.map(({ label, months: m, desc }) => {
            const active = months === m
            return (
              <button
                key={label}
                onClick={() => setInput('jcbaDurationMonths', m)}
                className="py-3 px-2 rounded-xl text-center transition-all duration-200"
                style={
                  active
                    ? { background: 'var(--sel-bg)', border: '2px solid var(--sel-border)', color: 'var(--text-base)' }
                    : { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                }
              >
                <div className="font-bold text-sm">{desc}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{label}</div>
              </button>
            )
          })}
        </div>

        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
            What this means for you:
          </div>
          <div className="space-y-1" style={{ color: 'var(--text-muted)' }}>
            <div>
              • <span style={{ color: 'var(--negative)' }}>Vote No, no 2nd offer</span>:{' '}
              {months} months on DOS+5 rates before JCBA
            </div>
            <div>
              • <span style={{ color: 'var(--positive)' }}>Vote Yes</span>:{' '}
              TA rates effective July 1, 2026 through retirement
            </div>
          </div>
        </div>
      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
