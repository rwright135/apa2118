import type { Seat, UserInputs } from './types'
import { getYearsUntilRetirement } from './engine'

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export interface InputDisplayItem {
  label: string
  value: string
}

export function formatCurrency(v?: number): string {
  return v ? `$${v.toLocaleString()}` : '$0'
}

export function formatSeatName(seat?: Seat): string {
  if (seat === 'FO') return 'First Officer'
  if (seat === 'CA') return 'Captain'
  return '—'
}

export function formatLongevity(longevity?: number): string {
  return longevity ? `Year ${longevity}` : '—'
}

export function formatAnniversaryMonth(month?: number): string {
  return month !== undefined ? MONTHS[month] : '—'
}

export function formatYearsUntilRetirementValue(dob?: Date): string {
  return dob ? `${getYearsUntilRetirement(dob)}` : '—'
}

export function getProfileInputItems(inputs: Partial<UserInputs>): InputDisplayItem[] {
  return [
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
  ]
}

export function getBaselineFinancialInputItems(inputs: Partial<UserInputs>): InputDisplayItem[] {
  return [
    {
      label: 'Annual Profit Sharing',
      value: formatCurrency(inputs.profitSharingLastYear),
    },
    {
      label: 'Retention Bonus Balance',
      value: formatCurrency(inputs.retentionCurrentBalance),
    },
  ]
}
