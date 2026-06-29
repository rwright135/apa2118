import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'
import { POST_JCBA_UPLIFT } from '../../lib/scenarios'

const DEFAULT_PENALTY = 0.15

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

        {/* Fixed +20% assumption for A and B */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="font-semibold text-sm" style={{ color: 'var(--text-base)' }}>
            Built-in assumption: +{upliftPct}% at JCBA for any deal
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            For this calculator we assume that ratifying any bridge agreement — whether this offer or a future one —
            means the JCBA contracted pay and benefits will be <strong style={{ color: 'var(--text-base)' }}>{upliftPct}% higher</strong> than
            what would be achieved starting from current TA rates. Having a deal on the table gives the
            negotiating committee a materially stronger position going into JCBA talks.
          </p>

          <div className="space-y-2 pt-1">
            <div
              className="flex items-start gap-3 text-xs py-2.5 px-3 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <span className="mt-0.5 font-bold" style={{ color: 'var(--positive)' }}>A</span>
              <div>
                <span className="font-semibold" style={{ color: 'var(--positive)' }}>Vote Yes — </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  JCBA rates = current TA rates + {upliftPct}%. You negotiated from the existing offer.
                </span>
              </div>
            </div>
            <div
              className="flex items-start gap-3 text-xs py-2.5 px-3 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <span className="mt-0.5 font-bold" style={{ color: 'var(--positive)' }}>B</span>
              <div>
                <span className="font-semibold" style={{ color: 'var(--positive)' }}>2nd Offer — </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  JCBA rates = bridge offer rates + {upliftPct}%. Because the bridge offer is already above TA,
                  the JCBA starting point is even higher — compounding the advantage.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User input: Scenario C penalty */}
        <div
          className="rounded-xl p-4 space-y-5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div>
            <div className="font-semibold text-sm mb-2" style={{ color: 'var(--negative)' }}>
              No Offer (Outcome C) — Your Estimate
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              If we vote no and no second offer comes, we head into JCBA negotiations starting from
              the current CBA (DOS+5, 2016 contract). How much <em>lower</em> do you believe the final
              JCBA pay and benefits will be compared to negotiating from a ratified deal?
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              This percentage is measured against the Vote Yes JCBA outcome — not the 2nd-offer
              outcome — so extreme assumptions in your other scenario cannot inflate this figure.
            </p>
          </div>

          <SliderInput
            value={penaltyPct}
            min={0}
            max={30}
            step={1}
            onChange={(v) => setInput('advancedPostJCBA', { scenarioCPenalty: v / 100 })}
            formatValue={(v) => v === 0 ? 'No difference' : `${v}% lower`}
            accentColor="var(--negative)"
            showMinMax
          />

          {/* Live summary row */}
          <div
            className="flex items-start gap-3 text-xs py-2.5 px-3 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <span className="mt-0.5 font-bold" style={{ color: 'var(--negative)' }}>C</span>
            <div>
              <span className="font-semibold" style={{ color: 'var(--negative)' }}>No Offer — </span>
              <span style={{ color: 'var(--text-muted)' }}>
                JCBA rates = {cJcbaRelativePct}% of current TA rates
                {penaltyPct > 0 && (
                  <span> ({penaltyPct}% below the Vote Yes JCBA outcome)</span>
                )}
                . Negotiating from DOS+5 CBA (2016) without a deal.
              </span>
            </div>
          </div>
        </div>

      </div>

      <NavButton onClick={compute} disabled={isComputing}>
        {isComputing ? 'Calculating...' : 'Calculate My Results →'}
      </NavButton>
    </WizardLayout>
  )
}
