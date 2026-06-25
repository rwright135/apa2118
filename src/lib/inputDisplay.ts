import type { UserInputs } from './types'

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export interface InputDisplayItem {
  label: string
  value: string
}

export function formatDate(d?: Date): string {
  return d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
}

export function formatCurrency(v?: number): string {
  return v ? `$${v.toLocaleString()}` : '$0'
}

export function formatPct(v?: number): string {
  return v !== undefined ? `${(v * 100).toFixed(1)}%` : '—'
}

export function getProfileInputItems(inputs: Partial<UserInputs>): InputDisplayItem[] {
  return [
    {
      label: 'Seat',
      value: inputs.seat === 'FO'
        ? 'First Officer (3 stripes)'
        : inputs.seat === 'CA'
          ? 'Captain (4 stripes)'
          : '—',
    },
    {
      label: 'Longevity (Jul 2026)',
      value: inputs.longevityAsOfJul2026 ? `Year ${inputs.longevityAsOfJul2026}` : '—',
    },
    {
      label: 'Anniversary Month',
      value: inputs.anniversaryMonth !== undefined ? MONTHS[inputs.anniversaryMonth] : '—',
    },
    {
      label: 'Line Type',
      value: inputs.lineType === 'FLYING'
        ? 'Flying Line Holder'
        : inputs.lineType === 'RESERVE'
          ? 'Reserve Line Holder'
          : '—',
    },
    {
      label: 'Extra Hours/Month',
      value: `+${inputs.extraHoursAboveMMG ?? 0} hrs above MMG`,
    },
    {
      label: 'Date of Birth',
      value: formatDate(inputs.dateOfBirth),
    },
  ]
}

export function getFinancialInputItems(inputs: Partial<UserInputs>): InputDisplayItem[] {
  return [
    {
      label: 'Annual Profit Sharing',
      value: formatCurrency(inputs.profitSharingLastYear),
    },
    {
      label: 'Retention Bonus Balance',
      value: formatCurrency(inputs.retentionCurrentBalance),
    },
    {
      label: 'Outcome A Payout Date',
      value: 'Oct 1, 2026 (fixed)',
    },
    {
      label: 'Outcome B Bonus Certainty',
      value: formatPct(inputs.retentionPayoutProbabilityB),
    },
    {
      label: 'Outcome C Bonus Certainty',
      value: formatPct(inputs.retentionPayoutProbabilityC),
    },
    {
      label: 'Investment Return Rate',
      value: formatPct(inputs.investmentRate),
    },
  ]
}
