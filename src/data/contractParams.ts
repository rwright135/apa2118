// Contract parameters — effective dates, MMG, 401k rules, retention formula

export const CONTRACT_PARAMS = {
  // TA retroactive start date (July 1, 2026)
  TA_EFFECTIVE_DATE: new Date(2026, 6, 1), // month is 0-indexed

  // TA rate tier effective dates
  TA_JAN2027_DATE: new Date(2027, 0, 1),
  TA_JAN2028_DATE: new Date(2028, 0, 1),

  // 401k contributions as decimal
  K401_CURRENT: 0.10,
  K401_TA_PHASE1: 0.10,    // TA Jul–Dec 2026
  K401_TA_PHASE2: 0.15,    // TA from Jan 2027 onward
  K401_TA_PHASE2_DATE: new Date(2027, 0, 1),

  // Minimum Monthly Guarantee (hours)
  MMG_FLYING: 70,
  MMG_RESERVE_CBA: 72,
  MMG_RESERVE_TA: 75,

  // Retention bonus accrual: rate × 85 hours × 35%
  RETENTION_ACCRUAL_HOURS: 85,
  RETENTION_ACCRUAL_FACTOR: 0.35,

  // Profit sharing payment months (0-indexed: May=5, October=10)
  PROFIT_SHARING_MONTHS: [5, 10] as const, // June and November (5=June, 10=November)

  // Default investment return rate
  DEFAULT_RATE: 0.0795,

  // Mandatory retirement age
  RETIREMENT_AGE: 65,
} as const
