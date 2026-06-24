import { useStore } from '../../state/store'
import type { WizardStep } from '../../state/store'
import { NavButton } from '../shared/NavButton'
import { ThemeToggle } from '../shared/ThemeToggle'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface ReviewItem { label: string; value: string }
interface ReviewSection { title: string; editStep: WizardStep; items: ReviewItem[] }

export function ReviewScreen() {
  const { inputs, goToStep, compute, isComputing } = useStore()

  const formatDate = (d?: Date) =>
    d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const formatCurrency = (v?: number) => v ? `$${v.toLocaleString()}` : '$0'
  const formatPct = (v?: number) => v !== undefined ? `${(v * 100).toFixed(1)}%` : '—'

  const sections: ReviewSection[] = [
    {
      title: 'Your Profile',
      editStep: 'seat',
      items: [
        { label: 'Seat', value: inputs.seat === 'FO' ? 'First Officer (3 stripes)' : inputs.seat === 'CA' ? 'Captain (4 stripes)' : '—' },
        { label: 'Longevity (Jul 2026)', value: inputs.longevityAsOfJul2026 ? `Year ${inputs.longevityAsOfJul2026}` : '—' },
        { label: 'Anniversary Month', value: inputs.anniversaryMonth !== undefined ? MONTHS[inputs.anniversaryMonth] : '—' },
        { label: 'Line Type', value: inputs.lineType === 'FLYING' ? 'Flying Line Holder' : inputs.lineType === 'RESERVE' ? 'Reserve Line Holder' : '—' },
        { label: 'Extra Hours/Month', value: `+${inputs.extraHoursAboveMMG ?? 0} hrs above MMG` },
        { label: 'Date of Birth', value: formatDate(inputs.dateOfBirth) },
      ],
    },
    {
      title: 'Financial Inputs',
      editStep: 'profitSharing',
      items: [
        { label: 'Annual Profit Sharing', value: formatCurrency(inputs.profitSharingLastYear) },
        { label: 'Retention Bonus Balance', value: formatCurrency(inputs.retentionCurrentBalance) },
        { label: 'Retention Payout (Vote Yes)', value: 'Oct 1, 2026 (fixed)' },
        { label: 'Retention Payout Certainty', value: formatPct(inputs.retentionPayoutProbability) },
        { label: 'Investment Return Rate', value: formatPct(inputs.investmentRate) },
      ],
    },
    {
      title: 'Vote-No Assumptions',
      editStep: 'voteNo',
      items: [
        { label: '2nd Offer Probability', value: formatPct(inputs.voteNoOffer?.probability) },
        { label: '2nd Offer Arrival', value: inputs.voteNoOffer ? `${inputs.voteNoOffer.arrivalMonths} months` : '—' },
        { label: '2nd Offer Premium', value: inputs.voteNoOffer ? `+${(inputs.voteNoOffer.percentAboveTA * 100).toFixed(1)}% above TA` : '—' },
        { label: 'JCBA Timeline', value: inputs.jcbaDurationMonths ? `${inputs.jcbaDurationMonths} mo (${(inputs.jcbaDurationMonths / 12).toFixed(1)} yrs)` : '—' },
      ],
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
