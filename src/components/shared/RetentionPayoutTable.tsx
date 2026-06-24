function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function addMonthsTo(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const START_DATE = new Date(2026, 6, 1)
const PAYOUT_DATE_A = new Date(2026, 9, 1)

interface Props {
  arrivalMonths: number
  jcbaMonths: number
  offerProbability: number
  probB?: number
  probC?: number
}

export function RetentionPayoutTable({ arrivalMonths, jcbaMonths, offerProbability, probB, probC }: Props) {
  const payoutDateB = addDays(addMonthsTo(START_DATE, arrivalMonths), 50)
  const payoutDateC = addMonthsTo(START_DATE, jcbaMonths)
  const noOfferProbability = 1 - offerProbability

  const rows = [
    {
      scenario: 'A',
      label: 'Vote Yes',
      color: 'var(--gold)',
      date: fmtDate(PAYOUT_DATE_A),
      note: 'Fixed — ~60 days after ratification',
      probability: 1,
    },
    {
      scenario: 'B',
      label: 'Vote No + 2nd offer',
      color: '#a855f7',
      date: fmtDate(payoutDateB),
      note: `Offer arrival + 50 days (${arrivalMonths} mo from now)`,
      probability: offerProbability,
    },
    {
      scenario: 'C',
      label: 'Vote No, no offer',
      color: 'var(--negative)',
      date: fmtDate(payoutDateC),
      note: `JCBA conclusion (${jcbaMonths} mo from now)`,
      probability: noOfferProbability,
    },
  ]

  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
        Computed payout dates per scenario
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {rows.map((row, i) => (
          <div
            key={row.scenario}
            className="px-4 py-3"
            style={{
              background: i % 2 === 0 ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: row.color }}
                  />
                  <span className="text-xs font-semibold" style={{ color: row.color }}>
                    {row.label}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {row.note}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>
                  {row.date}
                </div>
                <div
                  className="text-xs"
                  style={{ color: row.scenario === 'A' ? 'var(--positive)' : 'var(--text-faint)' }}
                >
                  {row.scenario === 'A'
                    ? '100% if Vote Yes'
                    : `${Math.round(row.probability * 100)}% scenario weight`}
                </div>
                {row.scenario === 'B' && probB !== undefined && (
                  <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {Math.round(probB * 100)}% bonus certainty
                  </div>
                )}
                {row.scenario === 'C' && probC !== undefined && (
                  <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {Math.round(probC * 100)}% bonus certainty
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>
        Scenario weights update as you adjust your assumptions above. Bonus accrues until its payout date under Scenarios B and C.
      </p>
    </div>
  )
}
