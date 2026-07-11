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
  /** American moneyline for each side, priced directly off the risk/reward dollar ratio
   *  — NOT off the user's assumed probability. This is "the price of the bet": how much
   *  you'd have to risk to win $100 (or how much $100 would win), same as a real sportsbook
   *  line. A side needing you to risk far more than you could win prices out very negative,
   *  regardless of how likely you think it is. */
  moneylineNo: string
  moneylineYes: string
  favorite: 'voteNo' | 'voteYes' | 'even'
  /** Break-even win probability for the risk/reward ratio to net to $0. */
  breakeven: number | null
  /** Percentage-point edge of the user's assumed probability over breakeven. */
  edgePoints: number | null
  verdict: BetVerdict
}

/** Converts a fraction (0–1) into an American moneyline string. */
export function toAmericanOdds(fraction: number): string {
  const p = Math.min(Math.max(fraction, 0.001), 0.999)
  if (p >= 0.5) {
    return `${Math.round(-100 * p / (1 - p))}`
  }
  return `+${Math.round(100 * (1 - p) / p)}`
}

/**
 * The fraction used to price the moneyline is exactly the break-even win
 * probability implied by the risk/reward dollar amounts (risk / (risk + reward))
 * — the same ratio a sportsbook would use to set a fair, no-vig line for a bet
 * with this payout structure. Degenerate cases (no real risk, or no real
 * reward) are priced at the extremes.
 */
function pricingFraction(risk: number, reward: number): number {
  if (risk > 0 && reward > 0) return risk / (risk + reward)
  if (risk <= 0 && reward > 0) return 0.01
  if (reward <= 0 && risk > 0) return 0.99
  return 0.5
}

export function computeBettingOdds(result: ComparisonResult): BettingOdds {
  // Use the retention-adjusted "worth the risk" figure (net of the expected
  // retention bonus payout), matching the number shown in the Risk vs Reward
  // card, rather than the raw wage shortfall.
  const { bNominalGap, cNetAfterRetention } = computeRiskRewardMetrics(result)
  const probability = result.voteNoScenario.probability

  const reward = bNominalGap
  const risk = cNetAfterRetention

  const pricing = pricingFraction(risk, reward)
  const moneylineNo = toAmericanOdds(pricing)
  const moneylineYes = toAmericanOdds(1 - pricing)

  // Mark 'even' only when the two displayed moneylines are identical in magnitude
  // (i.e. both round to +100/−100). A tiny threshold prevents float drift.
  const favorite: BettingOdds['favorite'] =
    Math.abs(pricing - 0.5) < 0.0001 ? 'even' : pricing > 0.5 ? 'voteYes' : 'voteNo'

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
    moneylineNo,
    moneylineYes,
    favorite,
    breakeven,
    edgePoints,
    verdict,
  }
}
