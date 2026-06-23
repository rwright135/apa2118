// Hourly pay rates by seat and longevity year (1-12)
// Source: APA2118 contract documents

export type Seat = 'FO' | 'CA'
export type Longevity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

// Current CBA (DOS+5 column) — in effect until TA ratification
export const CURRENT_CBA: Record<Seat, Record<Longevity, number>> = {
  FO: {
    1: 57.67,
    2: 103.07,
    3: 110.73,
    4: 116.99,
    5: 123.56,
    6: 129.24,
    7: 135.13,
    8: 139.19,
    9: 144.80,
    10: 148.39,
    11: 151.35,
    12: 155.61,
  },
  CA: {
    1: 163.29,
    2: 171.42,
    3: 178.27,
    4: 185.36,
    5: 192.76,
    6: 198.54,
    7: 204.49,
    8: 210.60,
    9: 215.85,
    10: 221.24,
    11: 225.65,
    12: 232.00,
  },
}

// Tentative Agreement (AIP) — three effective-date tiers
// DOS through EOY 2026
export const TA_DOS_EOY2026: Record<Seat, Record<Longevity, number>> = {
  FO: {
    1: 107.28,
    2: 142.16,
    3: 152.74,
    4: 161.37,
    5: 170.43,
    6: 178.26,
    7: 186.39,
    8: 191.99,
    9: 199.72,
    10: 204.68,
    11: 208.76,
    12: 214.63,
  },
  CA: {
    1: 225.23,
    2: 236.44,
    3: 245.89,
    4: 255.67,
    5: 265.88,
    6: 273.85,
    7: 282.05,
    8: 290.48,
    9: 297.73,
    10: 305.15,
    11: 311.24,
    12: 320.00,
  },
}

// AIP effective January 2027
export const TA_JAN2027: Record<Seat, Record<Longevity, number>> = {
  FO: {
    1: 115.20,
    2: 156.49,
    3: 171.99,
    4: 188.40,
    5: 199.61,
    6: 208.13,
    7: 211.13,
    8: 213.01,
    9: 214.30,
    10: 215.67,
    11: 216.68,
    12: 218.14,
  },
  CA: {
    1: 253.78,
    2: 259.19,
    3: 267.79,
    4: 284.92,
    5: 304.22,
    6: 306.25,
    7: 308.28,
    8: 312.68,
    9: 318.76,
    10: 324.82,
    11: 327.71,
    12: 345.00,
  },
}

// AIP effective January 2028 (final tier — repeats to retirement)
export const TA_JAN2028: Record<Seat, Record<Longevity, number>> = {
  FO: {
    1: 118.54,
    2: 161.02,
    3: 176.98,
    4: 193.86,
    5: 205.40,
    6: 214.16,
    7: 217.26,
    8: 219.18,
    9: 220.50,
    10: 221.93,
    11: 222.96,
    12: 224.46,
  },
  CA: {
    1: 261.14,
    2: 266.70,
    3: 275.55,
    4: 293.17,
    5: 313.04,
    6: 315.13,
    7: 317.22,
    8: 321.74,
    9: 327.99,
    10: 334.23,
    11: 337.21,
    12: 355.00,
  },
}

export function getRate(
  seat: Seat,
  longevity: number,
  tier: 'CBA' | 'TA_DOS_EOY2026' | 'TA_JAN2027' | 'TA_JAN2028'
): number {
  const clampedLongevity = Math.min(Math.max(Math.round(longevity), 1), 12) as Longevity
  switch (tier) {
    case 'CBA': return CURRENT_CBA[seat][clampedLongevity]
    case 'TA_DOS_EOY2026': return TA_DOS_EOY2026[seat][clampedLongevity]
    case 'TA_JAN2027': return TA_JAN2027[seat][clampedLongevity]
    case 'TA_JAN2028': return TA_JAN2028[seat][clampedLongevity]
  }
}
