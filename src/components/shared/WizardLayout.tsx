import { ProgressBar } from './ProgressBar'
import { ThemeToggle } from './ThemeToggle'
import { WIZARD_STEPS } from '../../state/store'
import type { WizardStep } from '../../state/store'

interface Props {
  step: WizardStep
  title: string
  subtitle?: string
  onBack?: () => void
  children: React.ReactNode
}

export function WizardLayout({ step, title, subtitle, onBack, children }: Props) {
  const contentSteps = WIZARD_STEPS.filter(s => s !== 'welcome' && s !== 'results')
  const contentIndex = contentSteps.indexOf(step as typeof contentSteps[number])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      {/* Top bar */}
      <div
        className="px-4 pt-4 pb-2 flex items-center gap-3 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {onBack ? (
          <button
            onClick={onBack}
            className="p-1 -ml-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-base)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-7" />
        )}

        <div className="flex-1">
          <ProgressBar currentStep={contentIndex + 1} totalSteps={contentSteps.length} />
        </div>

        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>
          {Math.max(1, contentIndex + 1)}/{contentSteps.length}
        </span>

        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pt-6 pb-8 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text-base)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
