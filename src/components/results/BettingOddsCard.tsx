import type { ComparisonResult } from '../../lib/types'
import { computeBettingOdds } from '../../lib/bettingOdds'
import { HelpButton } from '../shared/HelpButton'

interface Props { results: ComparisonResult[] }

function fmtDollars(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${Math.round(abs / 1_000).toLocaleString()}K`
  return `$${Math.round(abs).toLocaleString()}`
}

function fmtOddsRaw(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : '+'
  return `${sign}${abs.toLocaleString()}`
}

const ODDS_HELP = (
  'The Vote No moneyline is the American-style odds equivalent of the dollar risk/reward ratio — ' +
  'exactly how a sportsbook would price this bet based on payout alone. ' +
  'It tells you how much you\'d need to risk to win $100, or how much $100 would win, ' +
  'based purely on the dollar amounts at stake — not on how likely you think the outcome is.'
)

export function BettingOddsCard({ results }: Props) {
  const userResult = results[0]
  const odds = computeBettingOdds(userResult)

  const risk   = Math.abs(odds.risk)
  const reward = Math.abs(odds.reward)

  // Raw integer moneyline for Vote No (positive = you win more than you risk, negative = you risk more than you win)
  const rawNo = parseInt(odds.moneylineNo.replace('−', '-'), 10)

  // Plain-English explanation of what the moneyline means
  let explanation: React.ReactNode
  if (odds.risk <= 0 && odds.reward > 0) {
    explanation = (
      <>
        Voting No costs you nothing even if no offer arrives — so this is a{' '}
        <strong style={{ color: 'var(--positive)' }}>free shot</strong> at{' '}
        <strong style={{ color: 'var(--positive)' }}>{fmtDollars(reward)}</strong> in upside.
      </>
    )
  } else if (odds.reward <= 0 && odds.risk > 0) {
    explanation = (
      <>
        Voting No has no upside — you&apos;re only risking{' '}
        <strong style={{ color: 'var(--negative)' }}>{fmtDollars(risk)}</strong> for nothing.
      </>
    )
  } else if (rawNo < 0) {
    const toWin100 = Math.abs(rawNo)
    explanation = (
      <>
        Risking{' '}
        <strong style={{ color: 'var(--negative)' }}>{fmtDollars(risk)}</strong>{' '}
        in guaranteed value for the chance to gain{' '}
        <strong style={{ color: 'var(--positive)' }}>{fmtDollars(reward)}</strong>{' '}
        is equivalent to laying <strong>{fmtOddsRaw(rawNo)}</strong> odds
        {' '}(risk ${toWin100.toLocaleString()} to win $100).
      </>
    )
  } else {
    explanation = (
      <>
        Risking{' '}
        <strong style={{ color: 'var(--negative)' }}>{fmtDollars(risk)}</strong>{' '}
        in guaranteed value for the chance to gain{' '}
        <strong style={{ color: 'var(--positive)' }}>{fmtDollars(reward)}</strong>{' '}
        is equivalent to <strong>{fmtOddsRaw(rawNo)}</strong> odds
        {' '}(win ${Math.abs(rawNo).toLocaleString()} for every $100 risked).
      </>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-5 pt-5 pb-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>
            Vegas Odds — Is Voting No Worth the Bet?
          </div>
          <HelpButton label="About these betting odds" helpText={ODDS_HELP} />
        </div>

        {/* Moneyline display */}
        <div className="flex items-end gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--vote-no)' }}>
              Vote No Moneyline
            </div>
            <div
              className="text-4xl font-black tabular-nums leading-none"
              style={{ color: 'var(--text-base)' }}
            >
              {odds.moneylineNo}
            </div>
          </div>
        </div>

        {/* Plain-English explanation */}
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          {explanation}
        </div>

      </div>
    </div>
  )
}
