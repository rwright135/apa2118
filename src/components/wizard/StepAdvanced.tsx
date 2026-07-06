import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'
import { ScenarioColorCard } from '../shared/ScenarioColorCard'
import { POST_JCBA_UPLIFT } from '../../lib/scenarios'
import { RETENTION_OUTCOME_COLORS } from '../../lib/retentionOutcomes'

const DEFAULT_PENALTY = 0.15

export function StepAdvanced() {
  const { inputs, setInput, compute, prevStep, isComputing } = useStore()
  const adv = inputs.advancedPostJCBA ?? { scenarioCPenalty: DEFAULT_PENALTY }
  const penalty = adv.scenarioCPenalty ?? DEFAULT_PENALTY

  const upliftPct = Math.round(POST_JCBA_UPLIFT * 100)
  const penaltyPct = Math.round(penalty * 100)

  return (
    <WizardLayout
      step="advanced"
      title="Post-JCBA Pay Assumptions"
      subtitle={
        <>
          Ratifying any bridge agreement, whether this one or a future one, gives the negotiating
          committee a stronger position heading into JCBA. Read the scenarios below and make your
          selection to see how our decisions now will affect outcomes post-JCBA.
        </>
      }
      onBack={prevStep}
    >
      <div className="mb-8 space-y-5">
        <div className="space-y-4">
          <ScenarioColorCard scenarioId="A">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Based on industry historicals and the simplicity of this calculator, we assume a {upliftPct}%
              pay improvement from TA Jan 2028 rates at the conclusion of JCBA.
            </p>
          </ScenarioColorCard>

          <ScenarioColorCard scenarioId="B">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              This scenario assumes a {upliftPct}% pay improvement from the second-offer pay rate you
              set with the adjustable percentage slider earlier in the wizard.
            </p>
          </ScenarioColorCard>

          <ScenarioColorCard scenarioId="C">
            <div className="space-y-5">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                In the other scenarios, we assume JCBA rates land at current TA + {upliftPct}% — that&apos;s
                the Vote Yes outcome. If there&apos;s no deal, JCBA talks start from CBA DOS+5 (2016) instead.
                This slider is your estimate of how much worse those rates end up compared to Vote Yes.
              </p>
              <SliderInput
                value={penaltyPct}
                min={0}
                max={30}
                step={1}
                onChange={(v) => setInput('advancedPostJCBA', { scenarioCPenalty: v / 100 })}
                formatValue={(v) => (v === 0 ? 'No difference' : `${v}% worse than Vote Yes`)}
                label="How much worse than Vote Yes?"
                accentColor={RETENTION_OUTCOME_COLORS.C}
                showMinMax
              />
            </div>
          </ScenarioColorCard>
        </div>

        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Key insight: </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Unequivocally, the resulting pay rates and benefits under the JCBA will be different depending on
            which contract we are negotiating from. A higher starting point today means a stronger foundation
            for the next agreement — and that difference compounds over your entire career.
          </span>
        </div>
      </div>

      <NavButton onClick={compute} disabled={isComputing}>
        {isComputing ? 'Calculating...' : 'Calculate My Results →'}
      </NavButton>
    </WizardLayout>
  )
}
