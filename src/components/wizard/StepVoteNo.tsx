import { useState } from 'react'
import { useStore, DEFAULT_VOTE_NO_SCENARIO, AVERAGE_SCENARIO, WORST_CASE_SCENARIO } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'
import { SecondOfferArrivalInput } from './SecondOfferArrivalInput'
import type { VoteNoScenario } from '../../lib/types'

const JCBA_PRESETS = [
  { label: 'Optimistic', months: 18, desc: '1.5 yrs' },
  { label: 'Likely',     months: 30, desc: '2.5 yrs' },
  { label: 'Conservative', months: 48, desc: '4 yrs' },
]

// ── Your Scenario (user-editable) ────────────────────────────────────────────

function ScenarioCard({
  scenario,
  onChange,
}: {
  scenario: VoteNoScenario
  onChange: (patch: Partial<VoteNoScenario>) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const color = 'var(--gold)'
  const summary = `${Math.round(scenario.probability * 100)}% · ${scenario.arrivalMonths}mo · +${(scenario.percentAboveTA * 100).toFixed(0)}% · JCBA ${scenario.jcbaDurationMonths}mo`

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${color}`, background: 'var(--bg-surface)' }}
    >
      {!expanded ? (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="font-bold text-sm" style={{ color }}>Your Scenario</span>
            </div>
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
            {summary}
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              border: `1.5px solid ${color}`,
              color,
              background: 'var(--bg-elevated)',
            }}
          >
            Modify assumptions
          </button>
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="font-bold text-sm" style={{ color }}>Your Scenario</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
            >
              Collapse
            </button>
          </div>

          <div className="px-4 py-5 space-y-8">
          {/* Probability */}
          <div>
            <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              Probability of a second bridge offer
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
              How confident are you management comes back with another offer before JCBA?
            </p>
            <SliderInput
              value={Math.round(scenario.probability * 100)}
              min={0}
              max={100}
              step={5}
              onChange={(v) => onChange({ probability: v / 100 })}
              formatValue={(v) => `${v}%`}
              showMinMax
            />
          </div>

          {/* Arrival months */}
          <SecondOfferArrivalInput
            value={scenario.arrivalMonths}
            min={6}
            max={60}
            onChange={(v) => onChange({ arrivalMonths: v })}
          />

          {/* % above TA */}
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              How much better would that offer be vs. the TA?
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
              A positive number means the new offer beats the current TA rates.
            </p>
            <SliderInput
              value={Math.round(scenario.percentAboveTA * 1000) / 10}
              min={5}
              max={20}
              step={0.5}
              onChange={(v) => onChange({ percentAboveTA: v / 100 })}
              formatValue={(v) => `+${v.toFixed(1)}%`}
              showMinMax
            />
          </div>

          {/* JCBA duration */}
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              How long until the JCBA is concluded?
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
              If there&apos;s no second offer, you stay on current CBA (DOS+5) rates all the way until the JCBA concludes.
            </p>
            <SliderInput
              value={scenario.jcbaDurationMonths}
              min={6}
              max={60}
              step={3}
              onChange={(v) => onChange({ jcbaDurationMonths: v })}
              formatValue={(v) => `${v} mo (${(v / 12).toFixed(1)} yrs)`}
              showMinMax
            />
            <div className="grid grid-cols-3 gap-2 mt-3">
              {JCBA_PRESETS.map(({ label: pl, months, desc }) => {
                const active = scenario.jcbaDurationMonths === months
                return (
                  <button
                    key={pl}
                    onClick={() => onChange({ jcbaDurationMonths: months })}
                    className="py-2 px-2 rounded-xl text-center transition-all duration-200"
                    style={
                      active
                        ? { background: 'var(--sel-bg)', border: `2px solid ${color}`, color: 'var(--text-base)' }
                        : { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                    }
                  >
                    <div className="font-bold text-xs">{desc}</div>
                    <div className="text-xs mt-0.5" style={{ color: active ? color : 'var(--text-faint)' }}>{pl}</div>
                  </button>
                )
              })}
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Locked scenario card (Average / Worst Case) ───────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</span>
      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>{value}</span>
    </div>
  )
}

function LockedScenarioCard({
  label,
  color,
  scenario,
}: {
  label: string
  color: string
  scenario: typeof AVERAGE_SCENARIO
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${color}`, background: 'var(--bg-surface)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="font-bold text-sm" style={{ color }}>{label}</span>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-lg font-medium"
          style={{ color: 'var(--text-faint)', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
        >
          Fixed
        </span>
      </div>

      <div className="px-4 py-4 divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        <StatRow
          label="Probability of second offer"
          value={`${Math.round(scenario.probability * 100)}%`}
        />
        <StatRow
          label="Second offer arrives"
          value={`${scenario.arrivalMonths} months`}
        />
        <StatRow
          label="Offer improvement vs. TA"
          value={`+${(scenario.percentAboveTA * 100).toFixed(0)}%`}
        />
        <StatRow
          label="JCBA concluded"
          value={`${scenario.jcbaDurationMonths} mo (${(scenario.jcbaDurationMonths / 12).toFixed(1)} yrs)`}
        />
      </div>
    </div>
  )
}

// ── Step ──────────────────────────────────────────────────────────────────────

export function StepVoteNo() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const scenario: VoteNoScenario = (inputs.voteNoScenarios ?? [])[0] ?? { ...DEFAULT_VOTE_NO_SCENARIO }

  const updateScenario = (patch: Partial<VoteNoScenario>) => {
    setInput('voteNoScenarios', [{ ...scenario, ...patch }])
  }

  return (
    <WizardLayout
      step="voteNo"
      title="Your Vote No Assumptions"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Explain: </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Customize your own assumptions below, then compare your results against industry-backed historical average and worst-case scenarios.
          </span>
        </div>

        <div className="space-y-5">
          <ScenarioCard
            scenario={scenario}
            onChange={updateScenario}
          />

          <LockedScenarioCard
            label="Average"
            color="#3b82f6"
            scenario={AVERAGE_SCENARIO}
          />

          <LockedScenarioCard
            label="Worst Case"
            color="var(--negative)"
            scenario={WORST_CASE_SCENARIO}
          />
        </div>
      </div>

      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
