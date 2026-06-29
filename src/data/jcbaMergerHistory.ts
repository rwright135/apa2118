export interface JcbaMergerRecord {
  id: string
  label: string
  logoSrcs: string[]
  isPlaceholder?: boolean
  mergerClose: string
  jcbaCompletion: string
  completionNote?: string
  months: number
  isOutlier?: boolean
}

export function formatTimelineMonths(months: number): string {
  return Number.isInteger(months) ? `${months}` : months.toFixed(1)
}

export const JCBA_MERGER_HISTORY: JcbaMergerRecord[] = [
  {
    id: 'alaska-virgin',
    label: 'Alaska / Virgin America',
    logoSrcs: ['/airlines/alaska.png', '/airlines/virgin.png'],
    mergerClose: 'December 14, 2016',
    jcbaCompletion: 'November 1, 2017',
    completionNote: 'Binding arbitration implementation',
    months: 10.6,
  },
  {
    id: 'american-usairways',
    label: 'American / US Airways',
    logoSrcs: ['/airlines/american.png'],
    mergerClose: 'December 9, 2013',
    jcbaCompletion: 'January 30, 2015',
    months: 13.7,
  },
  {
    id: 'united-continental',
    label: 'United / Continental',
    logoSrcs: ['/airlines/united.png'],
    mergerClose: 'October 1, 2010',
    jcbaCompletion: 'December 15, 2012',
    months: 26.5,
  },
  {
    id: 'atlas-southern',
    label: 'Atlas Air / Southern Air',
    logoSrcs: ['/airlines/atlas-placeholder.png'],
    isPlaceholder: true,
    mergerClose: 'April 7, 2016',
    jcbaCompletion: 'September 10, 2021',
    completionNote: 'Binding arbitration implementation',
    months: 65.1,
    isOutlier: true,
  },
]

export const JCBA_HISTORY_INTRO =
  'Historical JCBA timelines following major airline mergers. Use these as context when estimating how long until a JCBA is concluded.'

export const JCBA_OUTLIER = JCBA_MERGER_HISTORY.find((record) => record.isOutlier)!

export const JCBA_NON_OUTLIERS = JCBA_MERGER_HISTORY.filter((record) => !record.isOutlier)

const jcbaMonthSum = JCBA_NON_OUTLIERS.reduce((sum, record) => sum + record.months, 0)
const jcbaCarrierCount = JCBA_NON_OUTLIERS.length

export const AVERAGE_JCBA_MONTHS =
  Math.round((jcbaMonthSum / jcbaCarrierCount) * 10) / 10

export const AVERAGE_JCBA_MONTHS_ROUNDED = Math.round(AVERAGE_JCBA_MONTHS)

export const JCBA_AVERAGE_MATH = {
  monthValues: JCBA_NON_OUTLIERS.map((record) => record.months),
  carrierCount: jcbaCarrierCount,
  months: AVERAGE_JCBA_MONTHS,
  outlierLabel: `${JCBA_OUTLIER.label} (${formatTimelineMonths(JCBA_OUTLIER.months)} mo)`,
}

export const JCBA_SUMMARY_STATS = {
  average: 29.0,
  median: 20.1,
  shortest: 10.6,
  longest: 65.1,
}
