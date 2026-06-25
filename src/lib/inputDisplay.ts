import type { LineType, Seat, UserInputs } from './types'
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

export function getLineTypeIcon(lineType?: LineType): string {
  if (lineType === 'FLYING') return '🛫'
  if (lineType === 'RESERVE') return '🧑‍✈️'
  return ''
}

export function formatAnniversaryMonth(month?: number): string {
  return month !== undefined ? MONTHS[month] : '—'
}

export function formatYearsUntilRetirementValue(dob?: Date): string {
  return dob ? `${getYearsUntilRetirement(dob)}` : '—'
}

export function getExtraHoursColor(hours: number): string {
  if (hours < 3) return 'var(--negative)'
  if (hours <= 6) return 'var(--warning)'
  if (hours <= 10) return '#86efac'
  if (hours <= 14) return 'var(--positive)'
  return '#15803d'
}

export function formatExtraHoursAboveMMG(hours?: number): string {
  const value = hours ?? 0
  return `+${value} hrs above MMG`
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
      value: formatExtraHoursAboveMMG(inputs.extraHoursAboveMMG),
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
