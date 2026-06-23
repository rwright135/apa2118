import { ProgressBar } from './ProgressBar'
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
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors p-1 -ml-1"
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <ProgressBar currentStep={contentIndex + 1} totalSteps={contentSteps.length} />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {contentIndex + 1}/{contentSteps.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pt-6 pb-8 max-w-lg mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-2 text-sm leading-relaxed">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
