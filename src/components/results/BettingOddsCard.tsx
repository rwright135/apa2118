import { useState } from 'react'
import type { ComparisonResult } from '../../lib/types'
import { computeBettingOdds, type BettingOdds } from '../../lib/bettingOdds'
import { HelpButton } from '../shared/HelpButton'
import { Assumption } from './Assumption'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${Math.round(abs)}`
}

const ODDS_HELP = (
  'These are American-style betting odds, priced off the dollar risk and reward — not off how likely you ' +
  'think the outcome is. "Break-even" is the win probability that would make Voting No a wash. If your ' +
  'assumed probability clears break-even, Vegas would call this a value bet.'
)

// ── Team crest ──────────────────────────────────────────────────────────────
// Drop real logo files at these paths (e.g. public/teams/vote-yes.png and
// public/teams/vote-no.png) and they'll appear automatically — otherwise a
// generic placeholder crest is shown.

function TeamCrest({ src, fallbackLabel, accent }: { src: string; fallbackLabel: string; accent: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black shrink-0"
        style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent, border: `2px solid ${accent}` }}
      >
        {fallbackLabel}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className="w-14 h-14 rounded-full object-contain shrink-0"
      style={{ border: `2px solid ${accent}`, background: 'var(--bg-elevated)' }}
      onError={() => setFailed(true)}
    />
  )
}

// ── Verdict banner ────────────────────────────────────────────────────────────

const VERDICT_COPY: Record<BettingOdds['verdict'], { label: string; text: (o: BettingOdds) => string; color: string; bg: string }> = {
  lock: {
    label: 'FREE ROLL',
    text: () => 'There\'s no real downside here. Even in the worst case, Voting No comes out ahead of Voting Yes.',
    color: 'var(--positive)',
    bg: 'rgba(34,197,94,0.08)',
  },
  trap: {
    label: 'BAD BEAT',
    text: () => 'Even if the 2nd offer arrives, Voting No doesn\'t pay off. There\'s no upside worth betting on.',
    color: 'var(--negative)',
    bg: 'rgba(239,68,68,0.08)',
  },
  value: {
    label: 'VALUE BET',
    text: (o) => {
      const assumed = Math.round(o.probability * 100)
      const needed = o.breakeven !== null ? Math.round(o.breakeven * 100) : null
      if (needed !== null) {
        return `You assume a ${assumed}% chance of a 2nd offer, above the ~${needed}% needed for Voting No to break even. Vegas would take this bet.`
      }
      return `Your assumed odds beat the break-even line by ${Math.round(o.edgePoints ?? 0)} points. Vegas would take this bet.`
    },
    color: 'var(--positive)',
    bg: 'rgba(34,197,94,0.08)',
  },
  longshot: {
    label: 'LONG SHOT',
    text: (o) => {
      const assumed = Math.round(o.probability * 100)
      const needed = o.breakeven !== null ? Math.round(o.breakeven * 100) : null
      if (needed !== null) {
        return `You assume a ${assumed}% chance of a 2nd offer. Voting No needs about a ${needed}% chance to break even. The math favors Voting Yes.`
      }
      return `Your assumed odds fall ${Math.round(Math.abs(o.edgePoints ?? 0))} points short of break-even. The math favors Voting Yes.`
    },
    color: 'var(--warning)',
    bg: 'rgba(245,158,11,0.08)',
  },
  coinflip: {
    label: 'COIN FLIP',
    text: () => 'This bet is close to break-even. Reasonable people could call it either way.',
    color: 'var(--text-muted)',
    bg: 'var(--bg-elevated)',
  },
}

// ── Explanation callout ───────────────────────────────────────────────────────

function HowToReadThis() {
  return (
    <div
      className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>How to read this: </span>
      <span style={{ color: 'var(--text-muted)' }}>
        The moneyline below is just a different way of showing the dollar risk and reward above — like a
        sportsbook price, it&apos;s set by the payout, not by how likely you think a second offer is. A big
        negative number means you&apos;d be risking a lot to win a little, a bad price no matter how
        confident you feel.         Compare your assumed chance of a 2nd offer to what Voting No would need to break even: if yours
        is higher, the math says Voting No is worth the bet.
      </span>
    </div>
  )
}

function BettingOddsMatchup({ result, showTeamCrests }: { result: ComparisonResult; showTeamCrests: boolean }) {
  const odds = computeBettingOdds(result)
  const verdict = VERDICT_COPY[odds.verdict]

  return (
    <div className="space-y-4">
      {/* Matchup row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {showTeamCrests && <TeamCrest src="/teams/vote-yes.png" fallbackLabel="YES" accent="var(--gold)" />}
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide truncate" style={{ color: 'var(--gold)' }}>
              Vote Yes
            </div>
            <div className="text-xl font-black tabular-nums" style={{ color: 'var(--text-base)' }}>
              {odds.moneylineYes}
            </div>
            {(odds.favorite === 'voteYes' || odds.favorite === 'even') && (
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                {odds.favorite === 'even' ? "Pick 'em" : 'Favorite'}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs font-bold shrink-0" style={{ color: 'var(--text-faint)' }}>VS</div>

        <div className="flex items-center justify-end gap-3 min-w-0 text-right">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide truncate" style={{ color: 'var(--vote-no)' }}>
              Vote No
            </div>
            <div className="text-xl font-black tabular-nums" style={{ color: 'var(--text-base)' }}>
              {odds.moneylineNo}
            </div>
            {(odds.favorite === 'voteNo' || odds.favorite === 'even') && (
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                {odds.favorite === 'even' ? "Pick 'em" : 'Favorite'}
              </div>
            )}
          </div>
          {showTeamCrests && <TeamCrest src="/teams/vote-no.png" fallbackLabel="NO" accent="var(--negative)" />}
        </div>
      </div>

      {/* The bet */}
      <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          The bet: risk <strong style={{ color: 'var(--text-base)' }}>{fmt(Math.abs(odds.risk))}</strong> to win{' '}
          <strong style={{ color: 'var(--text-base)' }}>{fmt(Math.abs(odds.reward))}</strong> on a{' '}
          <Assumption>{Math.round(odds.probability * 100)}% chance</Assumption> the 2nd offer arrives.
        </p>
      </div>

      {/* Verdict */}
      <div
        className="rounded-lg px-3 py-2.5 flex items-start gap-2"
        style={{ background: verdict.bg, border: `1px solid ${verdict.color}` }}
      >
        <span className="text-xs font-black uppercase tracking-wide shrink-0" style={{ color: verdict.color }}>
          {verdict.label}
        </span>
        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {verdict.text(odds)}
        </span>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

/** Vegas Odds card for the user's own scenario. Belongs directly under the
 *  user's Risk vs Reward card — no need to repeat the assumptions footer
 *  since it's already shown there. */
export function BettingOddsCard({ results }: Props) {
  const userResult = results[0]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-5 pt-5 pb-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Vegas Odds — Is Voting No Worth the Bet?
          </div>
          <HelpButton label="About these betting odds" helpText={ODDS_HELP} />
        </div>

        <HowToReadThis />

        <BettingOddsMatchup result={userResult} showTeamCrests />
      </div>
    </div>
  )
}
