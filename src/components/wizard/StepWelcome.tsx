import { useStore } from '../../state/store'
import { ThemeToggle } from '../shared/ThemeToggle'

const BULLETS = [
  '~3 minutes to complete',
  'Personalized to your seat & longevity',
  'Month-by-month transparent breakdown',
]

export function StepWelcome() {
  const { nextStep } = useStore()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      {/* Top bar — full width */}
      <div className="flex justify-end px-6 pt-5">
        <ThemeToggle />
      </div>

      {/* Center content — expands horizontally on wider screens */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center w-full">

        {/* Logo */}
        <div className="mb-6">
          <img
            src="/APA Teamsters Local 2118 Logo.png"
            alt="Teamsters Local 2118"
            className="w-32 h-32 object-contain drop-shadow-lg"
            onError={(e) => {
              e.currentTarget.src = '/teamsters-logo.svg'
              e.currentTarget.onerror = null
            }}
          />
        </div>

        {/* Badge pill */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold mb-5 uppercase tracking-widest"
          style={{ background: 'var(--chip-bg)', border: '1px solid var(--chip-border)', color: 'var(--chip-text)' }}
        >
          Teamsters Local 2118
        </div>

        {/* Title — single line on md+, wraps gracefully on narrow */}
        <h1
          className="font-black mb-4 leading-none whitespace-nowrap"
          style={{
            color: 'var(--text-base)',
            fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
          }}
        >
          Contract Comparison Calculator
        </h1>

        {/* Subtitle */}
        <p
          className="leading-relaxed mb-7"
          style={{
            color: 'var(--text-muted)',
            maxWidth: '38rem',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
          }}
        >
          Make an informed decision on the Tentative Agreement.
          We'll walk you through a few questions and show you exactly
          what each path means for{' '}
          <span style={{ color: 'var(--text-base)', fontWeight: 700 }}>your</span>{' '}
          career and retirement.
        </p>

        {/* Feature bullets — icons vertically aligned in a left-anchored column */}
        <div className="flex flex-col gap-3 mb-10 mx-auto" style={{ color: 'var(--text-faint)' }}>
          {BULLETS.map((text) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="var(--positive)" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="var(--positive)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA — fixed comfortable width, not artificially narrow */}
        <button
          onClick={nextStep}
          className="py-4 rounded-xl font-bold transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'var(--btn-bg)',
            color: 'var(--btn-text)',
            fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
            width: 'min(100%, 26rem)',
            letterSpacing: '0.02em',
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
