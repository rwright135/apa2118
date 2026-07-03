export const VOTE_YES_CSS = 'var(--gold)'
export const VOTE_NO_CSS = 'var(--vote-no)'
export const VOTE_NO_DIM_CSS = 'var(--vote-no-dim)'

export const SCENARIO_LABELS = ['Your Scenario', 'Average', 'Worst Case'] as const

export const VOTE_YES_FALLBACK = '#c9a84c'
export const VOTE_NO_FALLBACK = '#7ba3c9'
export const TEXT_MUTED_FALLBACK = '#94a3b8'
export const TEXT_FAINT_FALLBACK = '#475569'
export const SCENARIO_AVERAGE_FALLBACK = '#3b82f6'
export const SCENARIO_OFFER_FALLBACK = '#a855f7'
export const SCENARIO_WORST_FALLBACK = '#ef4444'

export function readCssColor(variable: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const prop = variable.startsWith('--') ? variable : variable.replace(/^var\(|\)$/g, '').trim()
  const value = getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
  return value || fallback
}

export function readVoteYesColor(): string {
  return readCssColor('--gold', VOTE_YES_FALLBACK)
}

export function readVoteNoColor(): string {
  return readCssColor('--vote-no', VOTE_NO_FALLBACK)
}

export function readTextMutedColor(): string {
  return readCssColor('--text-muted', TEXT_MUTED_FALLBACK)
}

export function readTextFaintColor(): string {
  return readCssColor('--text-faint', TEXT_FAINT_FALLBACK)
}

export function readScenarioAverageColor(): string {
  return readCssColor('--scenario-average', SCENARIO_AVERAGE_FALLBACK)
}

export function readScenarioWorstColor(): string {
  return readCssColor('--negative', SCENARIO_WORST_FALLBACK)
}

export function readScenarioOfferColor(): string {
  return readCssColor('--scenario-offer', SCENARIO_OFFER_FALLBACK)
}
