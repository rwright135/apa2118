export const RETENTION_OUTCOME_COLORS = {
  A: 'var(--gold)',
  B: '#a855f7',
  C: 'var(--negative)',
} as const

export type RetentionOutcomeId = keyof typeof RETENTION_OUTCOME_COLORS

export const RETENTION_OUTCOME_TITLES: Record<RetentionOutcomeId, string> = {
  A: 'Outcome A — Vote Yes',
  B: 'Outcome B — Vote No + 2nd Offer',
  C: 'Outcome C — Vote No, No Offer',
}

export const RETENTION_OUTCOME_SHORT: Record<RetentionOutcomeId, string> = {
  A: 'Outcome A',
  B: 'Outcome B',
  C: 'Outcome C',
}

/** Describes the contract path for each outcome — not retention payout timing */
export const RETENTION_OUTCOME_DESCRIPTIONS: Record<RetentionOutcomeId, string> = {
  A: 'Accept the TA or vote yes on the current tentative agreement',
  B: 'Vote no and receive a second bridge offer',
  C: 'Vote No, No Offer, JCBA',
}
