import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import type { AdvancedPostJCBA } from '../../lib/types'

type Direction = 'HIGHER' | 'SAME' | 'LOWER'
type ScenarioBranch = 'scenarioA' | 'scenarioB' | 'scenarioC'

const SCENARIOS: { key: ScenarioBranch; label: string; desc: string }[] = [
  { key: 'scenarioA', label: 'Vote Yes', desc: 'Starting from TA rates (~37% higher)' },
  { key: 'scenarioB', label: 'Vote No + 2nd Offer', desc: 'Starting from even higher rates' },
  { key: 'scenarioC', label: 'Vote No, No Offer', desc: 'Starting from current CBA rates' },
]

const DEFAULT_ADV: AdvancedPostJCBA = {
  enabled: false,
  scenarioA: { direction: 'SAME', magnitude: 0, probability: 1 },
  scenarioB: { direction: 'SAME', magnitude: 0, probability: 1 },
  scenarioC: { direction: 'SAME', magnitude: 0, probability: 1 },
}

const DIR_STYLE: Record<Direction, { active: React.CSSProperties; inactive: React.CSSProperties }> = {
  HIGHER: {
    active: { background: 'rgba(34,197,94,0.15)', border: '1px solid var(--positive)', color: 'var(--positive)' },
    inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  },
  SAME: {
    active: { background: 'var(--sel-bg)', border: '1px solid var(--sel-border)', color: 'var(--text-base)' },
    inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  },
  LOWER: {
    active: { background: 'rgba(239,68,68,0.15)', border: '1px solid var(--negative)', color: 'var(--negative)' },
    inactive: { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  },
}

export function StepAdvanced() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const adv = inputs.advancedPostJCBA ?? DEFAULT_ADV

  const update = (key: ScenarioBranch, field: string, value: unknown) => {
    setInput('advancedPostJCBA', { ...adv, [key]: { ...adv[key], [field]: value } })
  }

  return (
    <WizardLayout
      step="advanced"
      title="Advanced: Post-JCBA pay assumption"
      subtitle="Optional. Do you believe the JCBA outcome differs based on which contract you're negotiating from?"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        {/* Toggle */}
        <div
          className="flex items-center justify-between rounded-xl p-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div>
            <div className="font-medium" style={{ color: 'var(--text-base)' }}>
              Enable advanced assumptions
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Default: post-JCBA pay is the same for all paths
            </div>
          </div>
          <button
            onClick={() => setInput('advancedPostJCBA', { ...adv, enabled: !adv.enabled })}
            className="relative w-12 h-6 rounded-full transition-colors shrink-0"
            style={{ background: adv.enabled ? 'var(--gold)' : 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full transition-transform"
              style={{
                background: adv.enabled ? 'var(--btn-text)' : 'var(--text-faint)',
                transform: adv.enabled ? 'translateX(28px)' : 'translateX(4px)',
              }}
            />
          </button>
        </div>

        {adv.enabled && (
          <div className="space-y-4">
            {SCENARIOS.map(({ key, label, desc }) => (
              <div
                key={key}
                className="rounded-xl p-4 space-y-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-base)' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{desc}</div>
                </div>
                <div className="flex gap-2">
                  {(['HIGHER', 'SAME', 'LOWER'] as Direction[]).map((dir) => {
                    const active = adv[key].direction === dir
                    return (
                      <button
                        key={dir}
                        onClick={() => update(key, 'direction', dir)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                        style={active ? DIR_STYLE[dir].active : DIR_STYLE[dir].inactive}
                      >
                        {dir === 'HIGHER' ? '↑ Higher' : dir === 'LOWER' ? '↓ Lower' : '= Same'}
                      </button>
                    )
                  })}
                </div>
                {adv[key].direction !== 'SAME' && (
                  <div className="space-y-2">
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>By how much? (%)</label>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={Math.round((adv[key].magnitude || 0.05) * 100)}
                      onChange={(e) => update(key, 'magnitude', Number(e.target.value) / 100)}
                      className="w-full h-2 rounded-full"
                      style={{ background: 'var(--bg-surface)' }}
                    />
                    <div className="text-center font-bold" style={{ color: 'var(--gold)' }}>
                      {Math.round((adv[key].magnitude || 0.05) * 100)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!adv.enabled && (
          <div className="text-sm text-center py-4" style={{ color: 'var(--text-faint)' }}>
            Post-JCBA pay assumed equal for all paths — the conservative, apples-to-apples view.
          </div>
        )}
      </div>
      <NavButton onClick={nextStep}>Continue to Review</NavButton>
    </WizardLayout>
  )
}
