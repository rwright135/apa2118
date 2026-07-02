import type { ComparisonResult } from './types'
import { computeRiskRewardMetrics } from './riskReward'

export type BetVerdict = 'lock' | 'value' | 'coinflip' | 'longshot' | 'trap'

export interface BettingOdds {
  /** Probability a 2nd offer arrives, per the user's assumptions (0–1). */
  probability: number
  /** $ upside vs Voting Yes if the 2nd offer arrives (can be negative). */
  reward: number
  /** $ downside vs Voting Yes if no offer arrives (can be negative, i.e. still ahead). */
  risk: number
  /** Probability "Vote No" ends up ahead of "Vote Yes" (0–1). */
  probNoWins: number
  probYesWins: number
  /** American moneyline for each side, e.g. "-150" or "+240". */
  moneylineNo: string
  moneylineYes: string
  favorite: 'voteNo' | 'voteYes' | 'even'
  /** Break-even win probability for the risk/reward ratio to net to $0. */
  breakeven: number | null
  /** Percentage-point edge of the user's assumed probability over breakeven. */
  edgePoints: number | null
  verdict: BetVerdict
}

/** Converts a win probability (0–1) into an American moneyline string. */
export function toAmericanOdds(prob: number): string {
  const p = Math.min(Math.max(prob, 0.001), 0.999)
  if (p >= 0.5) {
    return `${Math.round(-100 * p / (1 - p))}`
  }
  return `+${Math.round(100 * (1 - p) / p)}`
}

export function computeBettingOdds(result: ComparisonResult): BettingOdds {
  // Use the retention-adjusted "worth the risk" figure (net of the expected
  // retention bonus payout), matching the number shown in the Risk vs Reward
  // card, rather than the raw wage shortfall.
  const { bNominalGap, cNetAfterRetention } = computeRiskRewardMetrics(result)
  const probability = result.voteNoScenario.probability

  const reward = bNominalGap
  const risk = cNetAfterRetention

  // Probability "Vote No" outright beats "Vote Yes": if there's no real downside
  // (risk <= 0) Vote No always wins regardless of whether the offer arrives; if
  // there's no real upside (reward <= 0) Vote No never wins. Otherwise it wins
  // exactly when the 2nd offer arrives.
  let probNoWins: number
  if (risk <= 0 && reward <= 0) probNoWins = 0.5
  else if (risk <= 0) probNoWins = 1
  else if (reward <= 0) probNoWins = 0
  else probNoWins = probability

  const probYesWins = 1 - probNoWins

  const favorite: BettingOdds['favorite'] =
    Math.abs(probNoWins - probYesWins) < 0.01 ? 'even' : probNoWins > probYesWins ? 'voteNo' : 'voteYes'

  const breakeven = risk > 0 && reward > 0 ? risk / (risk + reward) : null
  const edgePoints = breakeven !== null ? (probability - breakeven) * 100 : null

  let verdict: BetVerdict
  if (risk <= 0 && reward > 0) verdict = 'lock'
  else if (reward <= 0 && risk > 0) verdict = 'trap'
  else if (edgePoints === null) verdict = 'coinflip'
  else if (edgePoints >= 8) verdict = 'value'
  else if (edgePoints <= -8) verdict = 'longshot'
  else verdict = 'coinflip'

  return {
    probability,
    reward,
    risk,
    probNoWins,
    probYesWins,
    moneylineNo: toAmericanOdds(probNoWins),
    moneylineYes: toAmericanOdds(probYesWins),
    favorite,
    breakeven,
    edgePoints,
    verdict,
  }
}
