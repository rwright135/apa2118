import { CONTRACT_PARAMS } from '../../data/contractParams'
import {
  RETENTION_OUTCOME_COLORS,
  RETENTION_OUTCOME_DESCRIPTIONS,
  type RetentionOutcomeId,
} from '../../lib/retentionOutcomes'

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
  const payoutDays = CONTRACT_PARAMS.RETENTION_PAYOUT_DAYS_AFTER_RATIFICATION
  const payoutDateB = addDays(addMonthsTo(START_DATE, arrivalMonths), payoutDays)
  const payoutDateC = addDays(addMonthsTo(START_DATE, jcbaMonths), payoutDays)
  const noOfferProbability = 1 - offerProbability

  const rows: Array<{
    outcome: RetentionOutcomeId
    label: string
    color: string
    date: string
    probability: number
  }> = [
    {
      outcome: 'A',
      label: RETENTION_OUTCOME_DESCRIPTIONS.A,
      color: RETENTION_OUTCOME_COLORS.A,
      date: fmtDate(PAYOUT_DATE_A),
      probability: 1,
    },
    {
      outcome: 'B',
      label: RETENTION_OUTCOME_DESCRIPTIONS.B,
      color: RETENTION_OUTCOME_COLORS.B,
      date: fmtDate(payoutDateB),
      probability: offerProbability,
    },
    {
      outcome: 'C',
      label: RETENTION_OUTCOME_DESCRIPTIONS.C,
      color: RETENTION_OUTCOME_COLORS.C,
      date: fmtDate(payoutDateC),
      probability: noOfferProbability,
    },
  ]

  return (
    <div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {rows.map((row, i) => (
          <div
            key={row.outcome}
            className="px-4 py-3"
            style={{
              background: i % 2 === 0 ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: row.color }}
                  />
                  <span className="text-xs font-semibold" style={{ color: row.color }}>
                    {row.label}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>
                  {row.date}
                </div>
                <div
                  className="text-xs"
                  style={{ color: row.outcome === 'A' ? 'var(--positive)' : 'var(--text-faint)' }}
                >
                  {row.outcome === 'A'
                    ? '100% Full RB Payout Probability'
                    : `${Math.round(row.probability * 100)}% Scenario Probability`}
                </div>
                {row.outcome === 'B' && probB !== undefined && (
                  <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {Math.round(probB * 100)}% Full RB Payout Probability
                  </div>
                )}
                {row.outcome === 'C' && probC !== undefined && (
                  <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {Math.round(probC * 100)}% Full RB Payout Probability
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
