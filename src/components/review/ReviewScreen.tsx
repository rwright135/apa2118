import { useStore } from '../../state/store'
import type { WizardStep } from '../../state/store'
import { NavButton } from '../shared/NavButton'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface ReviewItem {
  label: string
  value: string
}

interface ReviewSection {
  title: string
  editStep: WizardStep
  items: ReviewItem[]
}

export function ReviewScreen() {
  const { inputs, goToStep, compute, isComputing } = useStore()

  const formatDate = (d?: Date) => d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const formatCurrency = (v?: number) => v ? `$${v.toLocaleString()}` : '$0'
  const formatPct = (v?: number) => v !== undefined ? `${(v * 100).toFixed(1)}%` : '—'

  const sections: ReviewSection[] = [
    {
      title: 'Your Profile',
      editStep: 'seat',
      items: [
        { label: 'Seat', value: inputs.seat === 'FO' ? 'First Officer' : inputs.seat === 'CA' ? 'Captain' : '—' },
        { label: 'Longevity (Jul 2026)', value: inputs.longevityAsOfJul2026 ? `Year ${inputs.longevityAsOfJul2026}` : '—' },
        { label: 'Anniversary Month', value: inputs.anniversaryMonth !== undefined ? MONTHS[inputs.anniversaryMonth] : '—' },
        { label: 'Line Type', value: inputs.lineType === 'FLYING' ? 'Flying Line Holder' : inputs.lineType === 'RESERVE' ? 'Reserve Line Holder' : '—' },
        { label: 'Extra Hours/Month', value: `+${inputs.extraHoursAboveMMG ?? 0} hrs above MMG` },
        { label: 'Date of Birth', value: formatDate(inputs.dateOfBirth) },
      ]
    },
    {
      title: 'Financial Inputs',
      editStep: 'profitSharing',
      items: [
        { label: 'Annual Profit Sharing', value: formatCurrency(inputs.profitSharingLastYear) },
        { label: 'Retention Bonus Balance', value: formatCurrency(inputs.retentionCurrentBalance) },
        { label: 'Retention Payout Date', value: formatDate(inputs.retentionPayoutDate) },
        { label: 'Retention Payout Certainty', value: formatPct(inputs.retentionPayoutProbability) },
        { label: 'Investment Return Rate', value: formatPct(inputs.investmentRate) },
      ]
    },
    {
      title: 'Vote-No Assumptions',
      editStep: 'voteNo',
      items: [
        { label: '2nd Offer Probability', value: formatPct(inputs.voteNoOffer?.probability) },
        { label: '2nd Offer Arrival', value: inputs.voteNoOffer ? `${inputs.voteNoOffer.arrivalMonths} months from now` : '—' },
        { label: '2nd Offer Premium', value: inputs.voteNoOffer ? `+${(inputs.voteNoOffer.percentAboveTA * 100).toFixed(1)}% above TA` : '—' },
        { label: 'JCBA Timeline', value: inputs.jcbaDurationMonths ? `${inputs.jcbaDurationMonths} months (${(inputs.jcbaDurationMonths/12).toFixed(1)} years)` : '—' },
      ]
    },
  ]

  const isReady = !!(inputs.seat && inputs.longevityAsOfJul2026 && inputs.anniversaryMonth !== undefined && inputs.lineType && inputs.dateOfBirth)

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-xs text-green-400 font-medium mb-3">
            ✓ Almost there
          </div>
          <h1 className="text-2xl font-bold">Review Your Inputs</h1>
          <p className="text-gray-400 text-sm mt-2">Tap any section to edit. When you're ready, run the calculation.</p>
        </div>

        <div className="space-y-4 mb-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-[#1a2235] rounded-2xl overflow-hidden border border-white/5">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h2 className="font-semibold text-white">{section.title}</h2>
                <button
                  onClick={() => goToStep(section.editStep)}
                  className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                >
                  Edit
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {section.items.map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-white text-right max-w-[55%]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Advanced section */}
          {inputs.advancedPostJCBA?.enabled && (
            <div className="bg-[#1a2235] rounded-2xl overflow-hidden border border-white/5">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h2 className="font-semibold text-white">Advanced: Post-JCBA</h2>
                <button onClick={() => goToStep('advanced')} className="text-blue-400 text-sm font-medium hover:text-blue-300">Edit</button>
              </div>
              <div className="px-4 py-3 text-sm text-gray-400">Custom post-JCBA assumptions enabled</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <NavButton onClick={compute} disabled={!isReady || isComputing}>
            {isComputing ? 'Calculating...' : 'Calculate My Results →'}
          </NavButton>
          {!isReady && (
            <p className="text-center text-xs text-amber-400">
              Please complete all required fields before calculating.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
