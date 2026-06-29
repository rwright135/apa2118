import { useState } from 'react'
import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'

export function StepUpgrade() {
  const { inputs, setInput, nextStep, goToStep } = useStore()
  const upgradeYears = inputs.upgradeToCAInYears
  // noUpgrade tracks whether the user explicitly chose "I don't plan on upgrading"
  // (as opposed to just not having answered yet, where upgradeToCAInYears is also undefined)
  const [noUpgrade, setNoUpgrade] = useState(false)

  // The user has made a valid selection if they picked a year OR explicitly said no upgrade
  const hasSelection = upgradeYears !== undefined || noUpgrade

  function selectYear(yr: number) {
    setNoUpgrade(false)
    setInput('upgradeToCAInYears', yr)
  }

  function handleNoUpgrade() {
    setNoUpgrade(true)
    setInput('upgradeToCAInYears', undefined)
  }

  function handleContinue() {
    if (!hasSelection) return
    nextStep()
  }

  return (
    <WizardLayout
      step="upgrade"
      title="When do you expect to upgrade to Captain?"
      subtitle="Years from July 1, 2026"
      onBack={() => goToStep('seat')}
    >
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((yr) => {
            const isSelected = !noUpgrade && upgradeYears === yr
            return (
              <button
                key={yr}
                onClick={() => selectYear(yr)}
                className="py-4 rounded-xl text-lg font-bold transition-all duration-200"
                style={
                  isSelected
                    ? { background: 'var(--btn-bg)', color: 'var(--btn-text)', outline: '2px solid var(--gold)', outlineOffset: '2px' }
                    : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                {yr}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleNoUpgrade}
          className="w-full py-4 rounded-xl text-sm font-semibold transition-all duration-200"
          style={
            noUpgrade
              ? { background: 'var(--btn-bg)', color: 'var(--btn-text)', outline: '2px solid var(--gold)', outlineOffset: '2px' }
              : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '2px solid var(--border)' }
          }
        >
          I don't plan on upgrading
        </button>
      </div>

      <NavButton onClick={handleContinue} disabled={!hasSelection}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
