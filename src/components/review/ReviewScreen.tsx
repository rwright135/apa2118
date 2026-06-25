import { useStore } from '../../state/store'
import type { WizardStep } from '../../state/store'
import { formatPct, getFinancialInputItems, getProfileInputItems } from '../../lib/inputDisplay'
import { NavButton } from '../shared/NavButton'
import { ThemeToggle } from '../shared/ThemeToggle'

interface ReviewItem { label: string; value: string }
interface ReviewSection { title: string; editStep: WizardStep; items: ReviewItem[] }

export function ReviewScreen() {
  const { inputs, goToStep, compute, isComputing } = useStore()

  const sections: ReviewSection[] = [
    {
      title: 'Your Profile',
      editStep: 'seat',
      items: getProfileInputItems(inputs),
    },
    {
      title: 'Financial Inputs',
      editStep: 'profitSharing',
      items: getFinancialInputItems(inputs),
    },
    {
      title: `Vote-No Assumptions (${(inputs.voteNoScenarios ?? []).length} scenario${(inputs.voteNoScenarios ?? []).length !== 1 ? 's' : ''})`,
      editStep: 'voteNo',
      items: (inputs.voteNoScenarios ?? []).flatMap((vns, i) => {
        const prefix = (inputs.voteNoScenarios ?? []).length > 1 ? `S${i + 1}: ` : ''
        return [
          { label: `${prefix}2nd Offer Probability`, value: formatPct(vns.probability) },
          { label: `${prefix}2nd Offer Arrival`, value: `${vns.arrivalMonths} months` },
          { label: `${prefix}2nd Offer Premium`, value: `+${(vns.percentAboveTA * 100).toFixed(1)}% above TA` },
          { label: `${prefix}JCBA Timeline`, value: `${vns.jcbaDurationMonths} mo (${(vns.jcbaDurationMonths / 12).toFixed(1)} yrs)` },
        ]
      }),
    },
  ]

  const isReady = !!(inputs.seat && inputs.longevityAsOfJul2026 && inputs.anniversaryMonth !== undefined && inputs.lineType && inputs.dateOfBirth)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>
          Review Inputs
        </span>
        <ThemeToggle />
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: 'var(--positive)' }}
          >
            ✓ Almost there
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-base)' }}>
            Review Your Inputs
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Tap any section to edit. When you're ready, run the calculation.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <h2 className="font-semibold" style={{ color: 'var(--text-base)' }}>
                  {section.title}
                </h2>
                <button
                  onClick={() => goToStep(section.editStep)}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Edit
                </button>
              </div>
              <div style={{ borderColor: 'var(--border-subtle)' }} className="divide-y">
                {section.items.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center px-4 py-3"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="text-sm font-medium text-right max-w-[55%]" style={{ color: 'var(--text-base)' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {inputs.advancedPostJCBA?.enabled && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <h2 className="font-semibold" style={{ color: 'var(--text-base)' }}>
                  Advanced: Post-JCBA
                </h2>
                <button
                  onClick={() => goToStep('advanced')}
                  className="text-sm font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  Edit
                </button>
              </div>
              <div className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                Custom post-JCBA assumptions enabled
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <NavButton onClick={compute} disabled={!isReady || isComputing}>
            {isComputing ? 'Calculating...' : 'Calculate My Results →'}
          </NavButton>
          {!isReady && (
            <p className="text-center text-xs" style={{ color: 'var(--warning)' }}>
              Please complete all required fields before calculating.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
