import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'

const FO_CBA = [57.67,103.07,110.73,116.99,123.56,129.24,135.13,139.19,144.80,148.39,151.35,155.61]
const FO_TA28 = [118.54,161.02,176.98,193.86,205.40,214.16,217.26,219.18,220.50,221.93,222.96,224.46]
const CA_CBA = [163.29,171.42,178.27,185.36,192.76,198.54,204.49,210.60,215.85,221.24,225.65,232.00]
const CA_TA28 = [261.14,266.70,275.55,293.17,313.04,315.13,317.22,321.74,327.99,334.23,337.21,355.00]

export function StepProfitSharing() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const ps = inputs.profitSharingLastYear ?? 0

  const taMultiplier = inputs.longevityAsOfJul2026
    ? (() => {
        const l = inputs.longevityAsOfJul2026 - 1
        if (inputs.seat === 'FO') return FO_TA28[l] / FO_CBA[l]
        if (inputs.seat === 'CA') return CA_TA28[l] / CA_CBA[l]
        return null
      })()
    : null

  return (
    <WizardLayout
      step="profitSharing"
      title="What was your profit sharing last year?"
      subtitle="Enter your total annual payout. We'll project how it changes under each scenario — it grows proportionally with your pay scale."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-4">
        <NumberInput
          value={ps}
          onChange={(v) => setInput('profitSharingLastYear', Math.max(0, v))}
          prefix="$"
          placeholder="0"
          min={0}
          step={100}
        />

        {ps > 0 && taMultiplier !== null && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              Profit sharing projection
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Current CBA (annual)</span>
              <span className="font-medium" style={{ color: 'var(--text-base)' }}>${ps.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Under TA (Jan 2028 rates)</span>
              <span className="font-bold" style={{ color: 'var(--positive)' }}>
                ${Math.round(ps * taMultiplier).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
              <span>Pay scale increase</span>
              <span>+{Math.round((taMultiplier - 1) * 100)}%</span>
            </div>
          </div>
        )}

        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          Paid semi-annually in June and November. Enter 0 if you don't receive profit sharing.
        </p>
      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
