export interface AirlineSecondOfferRecord {
  id: string
  airline: string
  logoSrc: string
  firstTARejected: string
  secondTARatified: string
  daysBetween: number
  approximateMonths: number
  economicIncrease: string
}

function daysToApproximateMonths(days: number): number {
  return Math.round(days / 30.44)
}

export const AIRLINE_SECOND_OFFER_HISTORY: AirlineSecondOfferRecord[] = [
  {
    id: 'delta',
    airline: 'Delta Air Lines',
    logoSrc: '/airlines/delta.svg',
    firstTARejected: 'July 10, 2015',
    secondTARatified: 'December 1, 2016',
    daysBetween: 510,
    approximateMonths: daysToApproximateMonths(510),
    economicIncrease: '~9%',
  },
  {
    id: 'southwest',
    airline: 'Southwest Airlines',
    logoSrc: '/airlines/southwest.svg',
    firstTARejected: 'November 4, 2015',
    secondTARatified: 'November 7, 2016',
    daysBetween: 369,
    approximateMonths: daysToApproximateMonths(369),
    economicIncrease: '~11.8%',
  },
  {
    id: 'united',
    airline: 'United Airlines',
    logoSrc: '/airlines/united.svg',
    firstTARejected: 'November 1, 2022',
    secondTARatified: 'September 29, 2023',
    daysBetween: 332,
    approximateMonths: daysToApproximateMonths(332),
    economicIncrease: '~20–26% (varied by longevity)',
  },
  {
    id: 'fedex',
    airline: 'FedEx Express',
    logoSrc: '/airlines/fedex.svg',
    firstTARejected: 'July 24, 2023',
    secondTARatified: 'June 9, 2026',
    daysBetween: 1051,
    approximateMonths: daysToApproximateMonths(1051),
    economicIncrease: '~10% (excluding additional value from retroactive pay and future raises)',
  },
]

export const AIRLINE_HISTORY_INTRO =
  'These carriers rejected an initial tentative agreement and later ratified a second offer. Use their timelines as historical context when setting your own second-offer arrival assumption.'
