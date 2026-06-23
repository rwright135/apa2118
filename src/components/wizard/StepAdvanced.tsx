import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import type { AdvancedPostJCBA } from '../../lib/types'

type Direction = 'HIGHER' | 'SAME' | 'LOWER'
type ScenarioBranch = 'scenarioA' | 'scenarioB' | 'scenarioC'

interface ScenarioConfig {
  key: ScenarioBranch
  label: string
  desc: string
}

const SCENARIOS: ScenarioConfig[] = [
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

export function StepAdvanced() {
  const { inputs, setInput, nextStep, prevStep } = useStore()
  const adv = inputs.advancedPostJCBA ?? DEFAULT_ADV

  const update = (key: ScenarioBranch, field: string, value: unknown) => {
    setInput('advancedPostJCBA', {
      ...adv,
      [key]: { ...adv[key], [field]: value }
    })
  }

  return (
    <WizardLayout
      step="advanced"
      title="Advanced: Post-JCBA pay assumption"
      subtitle="Optional. Do you believe the JCBA outcome will differ based on which contract you're negotiating from?"
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">
        {/* Toggle */}
        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
          <div>
            <div className="font-medium text-white">Enable advanced assumptions</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Default: post-JCBA pay is the same regardless of path (cancels out in comparison)
            </div>
          </div>
          <button
            onClick={() => setInput('advancedPostJCBA', { ...adv, enabled: !adv.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${adv.enabled ? 'bg-blue-600' : 'bg-white/20'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${adv.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {adv.enabled && (
          <div className="space-y-4">
            {SCENARIOS.map(({ key, label, desc }) => (
              <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <div className="flex gap-2">
                  {(['HIGHER', 'SAME', 'LOWER'] as Direction[]).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => update(key, 'direction', dir)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        adv[key].direction === dir
                          ? dir === 'HIGHER' ? 'bg-green-600/30 border border-green-500 text-green-300'
                          : dir === 'LOWER' ? 'bg-red-600/30 border border-red-500 text-red-300'
                          : 'bg-blue-600/20 border border-blue-500 text-blue-300'
                          : 'bg-white/5 border border-white/10 text-gray-400'
                      }`}
                    >
                      {dir === 'HIGHER' ? '↑ Higher' : dir === 'LOWER' ? '↓ Lower' : '= Same'}
                    </button>
                  ))}
                </div>
                {adv[key].direction !== 'SAME' && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">By how much? (%)</label>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={Math.round((adv[key].magnitude || 0.05) * 100)}
                      onChange={(e) => update(key, 'magnitude', Number(e.target.value) / 100)}
                      className="w-full accent-blue-500"
                    />
                    <div className="text-center text-blue-400 font-bold">
                      {Math.round((adv[key].magnitude || 0.05) * 100)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!adv.enabled && (
          <div className="text-sm text-gray-500 text-center py-4">
            Post-JCBA pay assumed equal for all paths — this is the conservative, apples-to-apples view.
          </div>
        )}
      </div>
      <NavButton onClick={nextStep}>
        Continue to Review
      </NavButton>
    </WizardLayout>
  )
}
