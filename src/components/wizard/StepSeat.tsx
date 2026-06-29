import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'
import { EpauletFO, EpauletCA } from '../shared/EpauletIcon'
import type { Seat } from '../../lib/types'

interface SeatCardProps {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
}

function SeatCard({ selected, onClick, icon, title, description }: SeatCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-xl border-2 transition-all duration-200"
      style={{
        borderColor: selected ? 'var(--sel-border)' : 'var(--border)',
        background: selected ? 'var(--sel-bg)' : 'var(--bg-subtle)',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0"
          style={{ color: selected ? 'var(--gold)' : 'var(--text-muted)' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-base"
            style={{ color: 'var(--text-base)' }}
          >
            {title}
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {description}
          </div>
        </div>
        {selected && (
          <div className="shrink-0" style={{ color: 'var(--gold)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
              <path fillRule="evenodd" d="M18.278 6.278a1 1 0 010 1.414l-9 9a1 1 0 01-1.414 0l-4.5-4.5a1 1 0 011.414-1.414L8.5 14.586l8.278-8.278a1 1 0 011.414 0z" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

export function StepSeat() {
  const { inputs, setInput, prevStep, goToStep } = useStore()
  const seat = inputs.seat

  function handleContinue() {
    if (!seat) return
    if (seat === 'FO') {
      goToStep('upgrade')
    } else {
      setInput('upgradeToCAInYears', undefined)
      goToStep('longevity')
    }
  }

  return (
    <WizardLayout
      step="seat"
      title="What's your current seat?"
      onBack={prevStep}
    >
      <div className="space-y-3 mb-8">
        <SeatCard
          selected={seat === 'FO'}
          onClick={() => setInput('seat', 'FO' as Seat)}
          icon={
            <EpauletFO
              size={44}
              boardColor={seat === 'FO' ? 'var(--bg-elevated)' : 'var(--bg-elevated)'}
              stripeColor={seat === 'FO' ? 'var(--gold)' : 'var(--text-muted)'}
            />
          }
          title="First Officer"
          description="A320 | B737"
        />
        <SeatCard
          selected={seat === 'CA'}
          onClick={() => setInput('seat', 'CA' as Seat)}
          icon={
            <EpauletCA
              size={44}
              boardColor={seat === 'CA' ? 'var(--bg-elevated)' : 'var(--bg-elevated)'}
              stripeColor={seat === 'CA' ? 'var(--gold)' : 'var(--text-muted)'}
            />
          }
          title="Captain"
          description="A320 | B737"
        />
      </div>
      <NavButton onClick={handleContinue} disabled={!seat}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
