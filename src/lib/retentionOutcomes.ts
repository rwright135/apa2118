export const RETENTION_OUTCOME_COLORS = {
  A: 'var(--gold)',
  B: '#a855f7',
  C: 'var(--negative)',
} as const

export type RetentionOutcomeId = keyof typeof RETENTION_OUTCOME_COLORS

export const RETENTION_OUTCOME_TITLES: Record<RetentionOutcomeId, string> = {
  A: 'Scenario A — Vote Yes',
  B: 'Scenario B — Vote No + 2nd Offer',
  C: 'Scenario C — Vote No, No Offer',
}

export const RETENTION_OUTCOME_SHORT: Record<RetentionOutcomeId, string> = {
  A: 'Scenario A',
  B: 'Scenario B',
  C: 'Scenario C',
}

/** Describes the contract path for each scenario — not retention payout timing */
export const RETENTION_OUTCOME_DESCRIPTIONS: Record<RetentionOutcomeId, string> = {
  A: 'Vote Yes & Accept TA',
  B: 'Vote No + 2nd Offer',
  C: 'Vote No, No Offer',
}
