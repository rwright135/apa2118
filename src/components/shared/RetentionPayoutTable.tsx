import { CONTRACT_PARAMS } from '../../data/contractParams'
import {
  RETENTION_OUTCOME_COLORS,
  RETENTION_OUTCOME_DESCRIPTIONS,
  RETENTION_OUTCOME_SHORT,
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
    note: string
    probability: number
  }> = [
    {
      outcome: 'A',
      label: RETENTION_OUTCOME_SHORT.A,
      color: RETENTION_OUTCOME_COLORS.A,
      date: fmtDate(PAYOUT_DATE_A),
      note: RETENTION_OUTCOME_DESCRIPTIONS.A,
      probability: 1,
    },
    {
      outcome: 'B',
      label: RETENTION_OUTCOME_SHORT.B,
      color: RETENTION_OUTCOME_COLORS.B,
      date: fmtDate(payoutDateB),
      note: RETENTION_OUTCOME_DESCRIPTIONS.B,
      probability: offerProbability,
    },
    {
      outcome: 'C',
      label: RETENTION_OUTCOME_SHORT.C,
      color: RETENTION_OUTCOME_COLORS.C,
      date: fmtDate(payoutDateC),
      note: RETENTION_OUTCOME_DESCRIPTIONS.C,
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
                  style={{ color: row.outcome === 'A' ? 'var(--positive)' : 'var(--text-faint)' }}
                >
                  {row.outcome === 'A'
                    ? '100% bonus certainty'
                    : `${Math.round(row.probability * 100)}% Scenario Probability`}
                </div>
                {row.outcome === 'B' && probB !== undefined && (
                  <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {Math.round(probB * 100)}% bonus certainty
                  </div>
                )}
                {row.outcome === 'C' && probC !== undefined && (
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
        Scenario probabilities update as you adjust your assumptions above. The bonus accrues until its payout date under Scenarios B and C.
      </p>
    </div>
  )
}
