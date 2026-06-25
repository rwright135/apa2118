import { useState } from 'react'
import { useStore, DEFAULT_VOTE_NO_SCENARIO } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { SliderInput } from '../shared/SliderInput'
import { RetentionPayoutTable } from '../shared/RetentionPayoutTable'
import type { VoteNoScenario } from '../../lib/types'

const JCBA_PRESETS = [
  { label: 'Optimistic', months: 18, desc: '1.5 yrs' },
  { label: 'Likely',     months: 30, desc: '2.5 yrs' },
  { label: 'Conservative', months: 48, desc: '4 yrs' },
]

const SCENARIO_COLORS = ['var(--gold)', '#a855f7', '#22c55e']
const SCENARIO_LABELS = ['Scenario 1', 'Scenario 2', 'Scenario 3']

function ScenarioCard({
  index,
  scenario,
  onChange,
  onRemove,
  jcbaMonths,
  retentionProbabilityB,
  retentionProbabilityC,
}: {
  index: number
  scenario: VoteNoScenario
  onChange: (patch: Partial<VoteNoScenario>) => void
  onRemove?: () => void
  jcbaMonths: number
  retentionProbabilityB?: number
  retentionProbabilityC?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const color = SCENARIO_COLORS[index]
  const label = SCENARIO_LABELS[index]

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${color}`, background: 'var(--bg-surface)' }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: 'var(--bg-elevated)', borderBottom: expanded ? '1px solid var(--border-subtle)' : 'none' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="font-bold text-sm" style={{ color }}>{label}</span>
          {!expanded && (
            <span className="text-xs ml-1" style={{ color: 'var(--text-faint)' }}>
              {Math.round(scenario.probability * 100)}% · {scenario.arrivalMonths}mo · +{(scenario.percentAboveTA * 100).toFixed(0)}% · JCBA {scenario.jcbaDurationMonths}mo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="text-xs px-2 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--negative)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              Remove
            </button>
          )}
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
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
          <div>
            <label className="block text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              If the second offer comes — how many months from now?
            </label>
            <SliderInput
              value={scenario.arrivalMonths}
              min={3}
              max={12}
              step={1}
              onChange={(v) => onChange({ arrivalMonths: v })}
              formatValue={(v) => `${v} months`}
              showMinMax
            />
          </div>

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
              min={18}
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

          {/* Retention payout table */}
          <RetentionPayoutTable
            arrivalMonths={scenario.arrivalMonths}
            jcbaMonths={jcbaMonths}
            offerProbability={scenario.probability}
            probB={retentionProbabilityB}
            probC={retentionProbabilityC}
          />
        </div>
      )}
    </div>
  )
}

export function StepVoteNo() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const scenarios: VoteNoScenario[] = inputs.voteNoScenarios ?? [{ ...DEFAULT_VOTE_NO_SCENARIO }]

  const updateScenario = (index: number, patch: Partial<VoteNoScenario>) => {
    const updated = scenarios.map((s, i) => i === index ? { ...s, ...patch } : s)
    setInput('voteNoScenarios', updated)
  }

  const addScenario = () => {
    if (scenarios.length >= 3) return
    setInput('voteNoScenarios', [...scenarios, { ...DEFAULT_VOTE_NO_SCENARIO }])
  }

  const removeScenario = (index: number) => {
    if (scenarios.length <= 1) return
    setInput('voteNoScenarios', scenarios.filter((_, i) => i !== index))
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
            Set your own probability assumptions to evaluate the value of a potential second offer, and a no-offer outcome, across different timelines. Add up to 3 scenarios to compare them side by side.
          </span>
        </div>

        <div className="space-y-5">
          {scenarios.map((s, i) => (
            <ScenarioCard
              key={i}
              index={i}
              scenario={s}
              onChange={(patch) => updateScenario(i, patch)}
              onRemove={scenarios.length > 1 ? () => removeScenario(i) : undefined}
              jcbaMonths={s.jcbaDurationMonths}
              retentionProbabilityB={inputs.retentionPayoutProbabilityB}
              retentionProbabilityC={inputs.retentionPayoutProbabilityC}
            />
          ))}
        </div>

        {scenarios.length < 3 && (
          <button
            onClick={addScenario}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={{ background: 'var(--bg-elevated)', border: '1.5px dashed var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <span style={{ fontSize: '1.1rem' }}>+</span>
            Add Scenario {scenarios.length + 1} of 3
          </button>
        )}

      </div>
      <NavButton onClick={nextStep}>Continue</NavButton>
    </WizardLayout>
  )
}
