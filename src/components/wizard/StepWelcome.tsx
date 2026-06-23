import { useStore } from '../../state/store'
import { ThemeToggle } from '../shared/ThemeToggle'

export function StepWelcome() {
  const { nextStep } = useStore()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      {/* Theme toggle — top right */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center">
        {/* Teamsters Local 2118 logo */}
        <div className="mb-7">
          <img
            src="/teamsters-logo.png"
            alt="Teamsters Local 2118"
            className="w-28 h-28 object-contain drop-shadow-lg"
            onError={(e) => {
              /* Fall back to the SVG version */
              e.currentTarget.src = '/teamsters-logo.svg'
              e.currentTarget.onerror = null
            }}
          />
        </div>

        {/* Pill badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4 uppercase tracking-wider"
          style={{ background: 'var(--chip-bg)', border: '1px solid var(--chip-border)', color: 'var(--chip-text)' }}
        >
          Teamsters Local 2118
        </div>

        <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: 'var(--text-base)' }}>
          Contract Comparison<br />Calculator
        </h1>

        <p className="text-base leading-relaxed max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Make an informed decision on the Tentative Agreement.
          We'll walk you through a few questions and show you exactly
          what each path means for{' '}
          <span style={{ color: 'var(--text-base)', fontWeight: 600 }}>your</span>{' '}
          career and retirement.
        </p>

        {/* Feature bullets */}
        <div className="space-y-2 text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
          {[
            '~3 minutes to complete',
            'Personalized to your seat & longevity',
            'Month-by-month transparent breakdown',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2 justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="var(--positive)" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="var(--positive)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={nextStep}
          className="w-full max-w-sm py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'var(--btn-bg)',
            color: 'var(--btn-text)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--btn-bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--btn-bg)')}
        >
          Get Started
        </button>

        <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
          Your data stays on your device and is never sent to a server.
        </p>
      </div>
    </div>
  )
}
