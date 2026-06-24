import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'

const PRESETS = [
  { label: 'HYSA', value: 4, desc: 'Safe / conservative' },
  { label: 'S&P 500', value: 8, desc: '50-yr inflation-adj avg' },
  { label: 'S&P Nominal', value: 11, desc: '50-yr nominal avg' },
]

export function StepInvestmentRate() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const rate = inputs.investmentRate ?? 0.08
  const ratePct = Math.round(rate * 1000) / 10

  return (
    <WizardLayout
      step="investmentRate"
      title="What return do you expect on your money?"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <SliderInput
          value={ratePct}
          min={4}
          max={20}
          step={0.1}
          onChange={(v) => setInput('investmentRate', v / 100)}
          formatValue={(v) => `${v.toFixed(1)}%`}
          showMinMax
        />

        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(({ label, value, desc }) => {
            const active = Math.abs(ratePct - value) < 0.06
            return (
              <button
                key={label}
                onClick={() => setInput('investmentRate', value / 100)}
                className="py-3 px-2 rounded-xl text-center transition-all duration-200"
                style={
                  active
                    ? { background: 'var(--sel-bg)', border: '2px solid var(--sel-border)', color: 'var(--text-base)' }
                    : { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                }
              >
                <div className="font-bold text-sm">{value}%</div>
                <div className="text-xs font-medium mt-0.5">{label}</div>
                <div className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-faint)' }}>{desc}</div>
              </button>
            )
          })}
        </div>

        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Why this matters: </span>
          <span style={{ color: 'var(--text-muted)' }}>
            The rate above discounts future pay into today's dollars AND compounds retirement contributions moving forward. In order to evaluate your options from an unbiased standpoint, you have to account for the time value of money. For example, $50,000 in your 401(k) starting today vs. starting in two years has a serious compound interest effect. Simply put, money today is worth more than money tomorrow.
          </span>
        </div>
      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
