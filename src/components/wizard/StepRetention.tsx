import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { NumberInput } from '../shared/NumberInput'
import { SliderInput } from '../shared/SliderInput'
import {
  RETENTION_OUTCOME_COLORS,
  RETENTION_OUTCOME_TITLES,
  type RetentionOutcomeId,
} from '../../lib/retentionOutcomes'

const RETENTION_OUTCOMES = [
  {
    key: 'A' as const,
    label: 'If we vote yes on this tentative bridge agreement, the retention bonus is paid in full.',
    fixed: true,
  },
  {
    key: 'B' as const,
    label: 'If we vote no and receive a second bridge offer prior to ratification of a JCBA, how likely will the bonus to be paid in full?',
    inputKey: 'retentionPayoutProbabilityB' as const,
  },
  {
    key: 'C' as const,
    label: 'If we vote no, do not receive a second offer, and our next contract is ratified at the conclusion of JCBA, how likely will the bonus be paid in full?',
    inputKey: 'retentionPayoutProbabilityC' as const,
  },
] as const

type SliderRetentionOutcome = Extract<
  (typeof RETENTION_OUTCOMES)[number],
  { inputKey: string }
>

function isSliderOutcome(
  outcome: (typeof RETENTION_OUTCOMES)[number],
): outcome is SliderRetentionOutcome {
  return 'inputKey' in outcome
}

function RetentionOutcomeBox({
  outcomeId,
  children,
}: {
  outcomeId: RetentionOutcomeId
  children: React.ReactNode
}) {
  const color = RETENTION_OUTCOME_COLORS[outcomeId]

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
        <span className="font-bold text-sm" style={{ color }}>
          {RETENTION_OUTCOME_TITLES[outcomeId]}
        </span>
      </div>
      <div className="px-4 py-5">
        {children}
      </div>
    </div>
  )
}

function WhyThisMattersCard() {
  return (
    <div
      className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Why this matters: </span>
      <span style={{ color: 'var(--text-muted)' }}>
        If we vote no, the timing and certainty of the retention bonus payout is unknown. This is
        not a fear tactic, it is purely a statement of fact. Despite the formal agreement and strong
        company financials, disruption to the future payout, whether it be partial or in entirety,
        is not a non-zero event. We have to weigh this reality as Allegiant Pilots could soon
        become the largest finance lenders to the company. Assign a probability to each outcome
        below for how likely the full bonus is actually paid.
      </span>
    </div>
  )
}

export function StepRetention() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const balance = inputs.retentionCurrentBalance
  const probB   = inputs.retentionPayoutProbabilityB ?? 0.90
  const probC   = inputs.retentionPayoutProbabilityC ?? 0.50
  const hasBalance = balance !== undefined

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

        {/* Outcome probabilities */}
        <div
          className="space-y-4 pt-6"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text-base)' }}>
            Payout Probabilities
          </h2>

          <WhyThisMattersCard />

          {RETENTION_OUTCOMES.map((outcome) => {
            const color = RETENTION_OUTCOME_COLORS[outcome.key]

            return (
              <RetentionOutcomeBox key={outcome.key} outcomeId={outcome.key}>
                {'fixed' in outcome && outcome.fixed ? (
                  <div className="space-y-3">
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {outcome.label}
                    </div>
                    <div className="text-center">
                      <span className="text-4xl font-bold" style={{ color }}>
                        100%
                      </span>
                    </div>
                  </div>
                ) : isSliderOutcome(outcome) ? (
                  <SliderInput
                    value={Math.round(
                      (outcome.inputKey === 'retentionPayoutProbabilityB' ? probB : probC) * 100,
                    )}
                    min={outcome.inputKey === 'retentionPayoutProbabilityC' ? 0 : 50}
                    max={100}
                    step={5}
                    onChange={(v) => setInput(outcome.inputKey, v / 100)}
                    formatValue={(v) => `${v}%`}
                    label={outcome.label}
                    showMinMax
                    accentColor={color}
                  />
                ) : null}
              </RetentionOutcomeBox>
            )
          })}
        </div>

      </div>
      <NavButton onClick={nextStep} disabled={!hasBalance}>Continue</NavButton>
    </WizardLayout>
  )
}
