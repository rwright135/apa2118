export interface AirlineArticleLink {
  label: string
  url: string
}

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
  articleLinks: AirlineArticleLink[]
}


export function formatArrivalMonths(months: number): string {
  return Number.isInteger(months) ? `${months}` : months.toFixed(1)
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
    approximateMonths: 16.7,
    economicIncrease: '~9%',
    economicIncreasePercent: 9,
    articleLinks: [
      {
        label: 'Delta pilots say contract proposal',
        url: 'https://www.ajc.com/business/delta-pilots-say-contract-proposal/3kBUMrU3oYnMHHafMr6T7H/',
      },
      {
        label: 'Delta pilots ratify contract with 30% pay increase',
        url: 'https://www.startribune.com/delta-pilots-ratify-contract-that-yields-30-percent-pay-increase-over-four-years/404130436/',
      },
    ],
  },
  {
    id: 'southwest',
    airline: 'Southwest Airlines',
    logoSrc: '/airlines/southwest.svg',
    firstTARejected: 'November 4, 2015',
    secondTARatified: 'November 7, 2016',
    daysBetween: 369,
    approximateMonths: 12.1,
    economicIncrease: '~11.8%',
    economicIncreasePercent: 11.8,
    articleLinks: [
      {
        label: 'Southwest Airlines pilots reject tentative agreement',
        url: 'https://www.prnewswire.com/news-releases/southwest-airlines-pilots-reject-tentative-agreement-300172619.html',
      },
      {
        label: 'Southwest Airlines pilots approve new contract',
        url: 'https://www.airlinepilotcentral.com/articles/news/southwest-airlines-pilots-approve-new-contract.html',
      },
    ],
  },
  {
    id: 'united',
    airline: 'United Airlines',
    logoSrc: '/airlines/united.svg',
    firstTARejected: 'November 1, 2022',
    secondTARatified: 'September 29, 2023',
    daysBetween: 332,
    approximateMonths: 10.9,
    economicIncrease: '~20–26% (varied by longevity)',
    economicIncreasePercent: UNITED_ECONOMIC_INCREASE_MIDPOINT,
    articleLinks: [
      {
        label: 'United Airlines pilots vote to reject contract offer',
        url: 'https://www.reuters.com/business/aerospace-defense/united-airlines-pilots-vote-reject-contract-offer-2022-11-01/',
      },
      {
        label: 'United Airlines pilots accept new labor contract',
        url: 'https://www.reuters.com/business/aerospace-defense/united-airlines-pilots-accept-new-labor-contract-2023-09-29/',
      },
    ],
  },
  {
    id: 'fedex',
    airline: 'FedEx Express',
    logoSrc: '/airlines/fedex.svg',
    firstTARejected: 'July 24, 2023',
    secondTARatified: 'June 9, 2026',
    daysBetween: 1051,
    approximateMonths: 34.6,
    economicIncrease: '~10% (excluding additional value from retroactive pay and future raises)',
    economicIncreasePercent: 10,
    isArrivalOutlier: true,
    articleLinks: [
      {
        label: 'FedEx pilots reject tentative deal',
        url: 'https://www.reuters.com/business/fedex-pilots-reject-tentative-deal-supervised-talks-likely-2023-07-24/',
      },
      {
        label: 'FedEx reaches tentative wage deal with pilots',
        url: 'https://www.reuters.com/business/world-at-work/fedex-reaches-tentative-wage-deal-with-pilots-after-years-talks-2026-04-09/',
      },
      {
        label: 'FedEx pilots ratify new wage deal',
        url: 'https://www.reuters.com/business/world-at-work/fedex-pilots-ratify-new-wage-deal-union-says-2026-06-09/',
      },
    ],
  },
]

export const AIRLINE_HISTORY_INTRO =
  'These carriers rejected an initial tentative agreement and later ratified a second offer. Use their timelines as historical context when setting your own second-offer arrival assumption.'

export const ECONOMIC_INCREASE_FOOTNOTE =
  'Approximate Increase in Total Economic Value is based on publicly reported comparisons of the overall economic improvements between the rejected and subsequently ratified agreements. Figures reflect reported wage package improvements and may also incorporate other economic enhancements such as retirement contributions, retroactive pay, or contract structure. They are not intended to represent a direct comparison of individual hourly pay rates.'

export const ARRIVAL_OUTLIER = AIRLINE_SECOND_OFFER_HISTORY.find((record) => record.isArrivalOutlier)!

export const ARRIVAL_NON_OUTLIERS = AIRLINE_SECOND_OFFER_HISTORY.filter((record) => !record.isArrivalOutlier)

const arrivalDaysSum = ARRIVAL_NON_OUTLIERS.reduce((sum, record) => sum + record.daysBetween, 0)
const arrivalCarrierCount = ARRIVAL_NON_OUTLIERS.length

export const AVERAGE_ARRIVAL_DAYS = arrivalDaysSum / arrivalCarrierCount
export const AVERAGE_ARRIVAL_MONTHS = 13.3
/** Nearest whole month for the slider default (step = 1). */
export const AVERAGE_ARRIVAL_MONTHS_ROUNDED = Math.round(AVERAGE_ARRIVAL_MONTHS)

export const ARRIVAL_AVERAGE_MATH = {
  dayValues: ARRIVAL_NON_OUTLIERS.map((record) => record.daysBetween),
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


export function articleLinkTypeLabel(record: AirlineSecondOfferRecord, index: number): string {
  if (record.id === 'fedex') {
    if (index === 0) return 'Rejection'
    if (index === 1) return 'Improved Offer'
    return 'Ratification'
  }
  return index === 0 ? 'Rejection' : 'Ratification'
}
