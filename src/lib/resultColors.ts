export const VOTE_YES_CSS = 'var(--gold)'
export const VOTE_NO_CSS = 'var(--vote-no)'
export const VOTE_NO_DIM_CSS = 'var(--vote-no-dim)'

export const VOTE_YES_FALLBACK = '#c9a84c'
export const VOTE_NO_FALLBACK = '#7ba3c9'

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
