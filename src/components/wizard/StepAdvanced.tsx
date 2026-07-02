import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'
import { POST_JCBA_UPLIFT } from '../../lib/scenarios'

const DEFAULT_PENALTY = 0.15

function OutcomeRow({ letter, label, children }: { letter: string; label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-3 text-xs py-2.5 px-3 rounded-lg"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
    >
      <span className="mt-0.5 font-bold" style={{ color: 'var(--gold)' }}>{letter}</span>
      <div>
        <span className="font-semibold" style={{ color: 'var(--gold)' }}>{label} — </span>
        <span style={{ color: 'var(--text-muted)' }}>{children}</span>
      </div>
    </div>
  )
}

export function StepAdvanced() {
  const { inputs, setInput, compute, prevStep, isComputing } = useStore()
  const adv = inputs.advancedPostJCBA ?? { scenarioCPenalty: DEFAULT_PENALTY }
  const penalty = adv.scenarioCPenalty ?? DEFAULT_PENALTY

  const upliftPct = Math.round(POST_JCBA_UPLIFT * 100)
  const penaltyPct = Math.round(penalty * 100)
  // Scenario C JCBA expressed as % of base TA_JAN2028 rates
  const cJcbaRelativePct = Math.round((1 + POST_JCBA_UPLIFT) * (1 - penalty) * 100)

  return (
    <WizardLayout
      step="advanced"
      title="Post-JCBA Pay Assumptions"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-5">

        {/* Intro */}
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

        {/* Post-JCBA outcomes — one consolidated block */}
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div>
            <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-base)' }}>
              Built-in assumption: +{upliftPct}% at JCBA for any deal
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Ratifying any bridge agreement — this offer or a future one — gives the negotiating
              committee a stronger position: JCBA rates land {upliftPct}% above whatever deal you
              ratified. No deal means starting JCBA talks from the current CBA (DOS+5, 2016) instead —
              you estimate how much lower that outcome lands below Vote Yes.
            </p>
          </div>

          <div className="space-y-2">
            <OutcomeRow letter="A" label="Vote Yes">
              JCBA rates = current TA rates + {upliftPct}%. You negotiated from the existing offer.
            </OutcomeRow>
            <OutcomeRow letter="B" label="2nd Offer">
              JCBA rates = bridge offer rates + {upliftPct}%. Since the bridge offer already beats TA,
              the JCBA starting point is even higher — compounding the advantage.
            </OutcomeRow>
            <OutcomeRow letter="C" label="No Offer">
              JCBA rates = {cJcbaRelativePct}% of current TA rates
              {penaltyPct > 0 && ` (${penaltyPct}% below the Vote Yes JCBA outcome)`}. Negotiating
              from DOS+5 CBA (2016) without a deal.
            </OutcomeRow>
          </div>

          <div className="pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <SliderInput
              value={penaltyPct}
              min={0}
              max={30}
              step={1}
              onChange={(v) => setInput('advancedPostJCBA', { scenarioCPenalty: v / 100 })}
              formatValue={(v) => v === 0 ? 'No difference' : `${v}% lower`}
              label="What's your estimate on the amount of impact?"
              accentColor="var(--gold)"
              showMinMax
            />
          </div>
        </div>

      </div>

      <NavButton onClick={compute} disabled={isComputing}>
        {isComputing ? 'Calculating...' : 'Calculate My Results →'}
      </NavButton>
    </WizardLayout>
  )
}
