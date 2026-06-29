export interface AirlineSecondOfferRecord {
  id: string
  airline: string
  logoSrc: string
  firstTARejected: string
  secondTARatified: string
  daysBetween: number
  approximateMonths: number
  economicIncrease: string
  economicIncreasePercent: number
  isArrivalOutlier?: boolean
}

function daysToMonths(days: number): number {
  return Math.round((days / 365) * 12)
}

/** Midpoint of United's 20–26% range, used in the industry average. */
export const UNITED_ECONOMIC_INCREASE_MIDPOINT = 23

export const AIRLINE_SECOND_OFFER_HISTORY: AirlineSecondOfferRecord[] = [
  {
    id: 'delta',
    airline: 'Delta Air Lines',
    logoSrc: '/airlines/delta.svg',
    firstTARejected: 'July 10, 2015',
    secondTARatified: 'December 1, 2016',
    daysBetween: 510,
    approximateMonths: daysToMonths(510),
    economicIncrease: '~9%',
    economicIncreasePercent: 9,
  },
  {
    id: 'southwest',
    airline: 'Southwest Airlines',
    logoSrc: '/airlines/southwest.svg',
    firstTARejected: 'November 4, 2015',
    secondTARatified: 'November 7, 2016',
    daysBetween: 369,
    approximateMonths: daysToMonths(369),
    economicIncrease: '~11.8%',
    economicIncreasePercent: 11.8,
  },
  {
    id: 'united',
    airline: 'United Airlines',
    logoSrc: '/airlines/united.svg',
    firstTARejected: 'November 1, 2022',
    secondTARatified: 'September 29, 2023',
    daysBetween: 332,
    approximateMonths: daysToMonths(332),
    economicIncrease: '~20–26% (varied by longevity)',
    economicIncreasePercent: UNITED_ECONOMIC_INCREASE_MIDPOINT,
  },
  {
    id: 'fedex',
    airline: 'FedEx Express',
    logoSrc: '/airlines/fedex.svg',
    firstTARejected: 'July 24, 2023',
    secondTARatified: 'June 9, 2026',
    daysBetween: 1051,
    approximateMonths: daysToMonths(1051),
    economicIncrease: '~10% (excluding additional value from retroactive pay and future raises)',
    economicIncreasePercent: 10,
    isArrivalOutlier: true,
  },
]

export const AIRLINE_HISTORY_INTRO =
  'These carriers rejected an initial tentative agreement and later ratified a second offer. Use their timelines as historical context when setting your own second-offer arrival assumption.'

export const ARRIVAL_OUTLIER = AIRLINE_SECOND_OFFER_HISTORY.find((record) => record.isArrivalOutlier)!

export const ARRIVAL_NON_OUTLIERS = AIRLINE_SECOND_OFFER_HISTORY.filter((record) => !record.isArrivalOutlier)

const arrivalDaysSum = ARRIVAL_NON_OUTLIERS.reduce((sum, record) => sum + record.daysBetween, 0)
const arrivalCarrierCount = ARRIVAL_NON_OUTLIERS.length

export const AVERAGE_ARRIVAL_DAYS = arrivalDaysSum / arrivalCarrierCount
export const AVERAGE_ARRIVAL_MONTHS = Math.round((AVERAGE_ARRIVAL_DAYS / 365) * 12)

export const ARRIVAL_AVERAGE_MATH = {
  dayValues: ARRIVAL_NON_OUTLIERS.map((record) => record.daysBetween),
  daySum: arrivalDaysSum,
  carrierCount: arrivalCarrierCount,
  averageDays: AVERAGE_ARRIVAL_DAYS,
  months: AVERAGE_ARRIVAL_MONTHS,
  outlierLabel: `${ARRIVAL_OUTLIER.airline} (${ARRIVAL_OUTLIER.daysBetween.toLocaleString()} days)`,
}

const economicValues = AIRLINE_SECOND_OFFER_HISTORY.map((record) => record.economicIncreasePercent)
export const economicSum = economicValues.reduce((sum, value) => sum + value, 0)
export const AVERAGE_ECONOMIC_INCREASE_PERCENT =
  Math.round((economicSum / AIRLINE_SECOND_OFFER_HISTORY.length) * 10) / 10

export const ECONOMIC_AVERAGE_MATH = {
  values: economicValues,
  unitedMidpointNote: `United's 20–26% range uses ${UNITED_ECONOMIC_INCREASE_MIDPOINT}% as the midpoint`,
  sum: economicSum,
  count: AIRLINE_SECOND_OFFER_HISTORY.length,
  average: AVERAGE_ECONOMIC_INCREASE_PERCENT,
}

export const ECONOMIC_INCREASE_INTRO =
  'Historical second-offer improvements across these carriers. The industry average below uses all four data points.'
