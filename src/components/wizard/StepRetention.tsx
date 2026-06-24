import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'
import { SliderInput } from '../shared/SliderInput'

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function addMonthsTo(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const START_DATE = new Date(2026, 6, 1)  // July 1, 2026
const PAYOUT_DATE_A = new Date(2026, 9, 1) // Oct 1, 2026 — fixed for Vote Yes

export function StepRetention() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const balance = inputs.retentionCurrentBalance ?? 0
  const prob    = inputs.retentionPayoutProbability ?? 0.95

  // Computed payout dates for each scenario (shown for transparency)
  const arrivalMonths = inputs.voteNoOffer?.arrivalMonths ?? 18
  const jcbaMonths    = inputs.jcbaDurationMonths ?? 24

  const payoutDateB = addDays(addMonthsTo(START_DATE, arrivalMonths), 50)
  const payoutDateC = addMonthsTo(START_DATE, jcbaMonths)

  const PAYOUT_ROWS = [
    {
      scenario: 'A',
      label: 'Vote Yes',
      color: 'var(--gold)',
      date: fmtDate(PAYOUT_DATE_A),
      note: 'Fixed — ~60 days after ratification',
      certainty: '100%',
    },
    {
      scenario: 'B',
      label: 'Vote No + 2nd offer',
      color: '#a855f7',
      date: fmtDate(payoutDateB),
      note: `Offer arrival + 50 days (${arrivalMonths} mo from now)`,
      certainty: `${Math.round(prob * 100)}%`,
    },
    {
      scenario: 'C',
      label: 'Vote No, no offer',
      color: 'var(--negative)',
      date: fmtDate(payoutDateC),
      note: `JCBA conclusion (${jcbaMonths} mo from now)`,
      certainty: `${Math.round(prob * 100)}%`,
    },
  ]

  return (
    <WizardLayout
      step="retention"
      title="Tell us about your retention bonus"
      subtitle="Worth over $100K for many pilots — this is treated very differently under each contract path."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">

        {/* Balance */}
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            Current retention bonus balance
          </label>
          <NumberInput
            value={balance}
            onChange={(v) => setInput('retentionCurrentBalance', Math.max(0, v))}
            prefix="$"
            placeholder="0"
            min={0}
            step={1000}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            Formula: hourly rate × 85 hrs × 35%
          </p>
        </div>

        {/* Payout date table — computed, not user-entered */}
        <div>
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
            Computed payout dates per scenario
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {PAYOUT_ROWS.map((row, i) => (
              <div
                key={row.scenario}
                className="px-4 py-3"
                style={{
                  background: i % 2 === 0 ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: row.color }}
                      />
                      <span className="text-xs font-semibold" style={{ color: row.color }}>
                        {row.label}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {row.note}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>
                      {row.date}
                    </div>
                    <div className="text-xs" style={{ color: row.scenario === 'A' ? 'var(--positive)' : 'var(--text-faint)' }}>
                      {row.certainty} certain
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>
            Dates update automatically based on your Vote-No assumptions. Bonus accrues until its payout date under Scenarios B and C.
          </p>
        </div>

        {/* Payout probability */}
        <div>
          <SliderInput
            value={Math.round(prob * 100)}
            min={50}
            max={100}
            step={5}
            onChange={(v) => setInput('retentionPayoutProbability', v / 100)}
            formatValue={(v) => `${v}%`}
            label="Probability bonus is fully paid if we vote no (bankruptcy risk)"
            showMinMax
          />
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            Only applies to Scenarios B and C. Vote Yes (Scenario A) is 100% certain.
          </p>
        </div>

      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
