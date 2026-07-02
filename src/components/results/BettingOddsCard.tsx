import { useState } from 'react'
import type { ComparisonResult } from '../../lib/types'
import { SCENARIO_LABELS } from '../../lib/resultColors'
import { computeBettingOdds, type BettingOdds } from '../../lib/bettingOdds'
import { HelpButton } from '../shared/HelpButton'
import { Assumption, AssumptionsFooter, ASSUMPTIONS_FOOTNOTE, BENCHMARK_ASSUMPTIONS_FOOTNOTE } from './Assumption'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${Math.round(abs)}`
}

const ODDS_HELP = (
  'These are American-style betting odds. The moneyline reflects the probability of each outcome ' +
  '(from your assumptions), while "Break-even" is the win probability that would make Voting No a wash. ' +
  'If your assumed probability clears break-even, Vegas would call this a value bet.'
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
    text: () => 'There\'s no real downside here — even in the worst case, Voting No comes out ahead of Voting Yes.',
    color: 'var(--positive)',
    bg: 'rgba(34,197,94,0.08)',
  },
  trap: {
    label: 'BAD BEAT',
    text: () => 'Even if the 2nd offer arrives, Voting No doesn\'t pay off — there\'s no upside worth betting on.',
    color: 'var(--negative)',
    bg: 'rgba(239,68,68,0.08)',
  },
  value: {
    label: 'VALUE BET',
    text: (o) => `Your assumed odds beat the break-even line by ${Math.round(o.edgePoints ?? 0)} points — Vegas would take this action.`,
    color: 'var(--positive)',
    bg: 'rgba(34,197,94,0.08)',
  },
  longshot: {
    label: 'LONG SHOT',
    text: (o) => `Your assumed odds fall ${Math.round(Math.abs(o.edgePoints ?? 0))} points short of break-even — the math favors sticking with Voting Yes.`,
    color: 'var(--warning)',
    bg: 'rgba(245,158,11,0.08)',
  },
  coinflip: {
    label: 'COIN FLIP',
    text: () => 'This bet is close to break-even — reasonable people could call it either way.',
    color: 'var(--text-muted)',
    bg: 'var(--bg-elevated)',
  },
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
          {odds.breakeven !== null && (
            <> Break-even win probability: <strong style={{ color: 'var(--text-base)' }}>{Math.round(odds.breakeven * 100)}%</strong>.</>
          )}
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

function CompactOddsRow({ result, label }: { result: ComparisonResult; label: string }) {
  const [expanded, setExpanded] = useState(false)
  const odds = computeBettingOdds(result)
  const verdict = VERDICT_COPY[odds.verdict]

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        style={{ background: 'transparent' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>{label}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: verdict.color }}>{verdict.label}</span>
          <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text-base)' }}>
            No {odds.moneylineNo}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="var(--text-faint)" strokeWidth="1.8" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <BettingOddsMatchup result={result} showTeamCrests={false} />
          </div>
          <AssumptionsFooter vns={result.voteNoScenario} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{BENCHMARK_ASSUMPTIONS_FOOTNOTE}</p>
        </div>
      )}
    </div>
  )
}

export function BettingOddsCard({ results }: Props) {
  const userResult = results[0]
  const referenceResults = results.slice(1)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Vegas Odds — Is Voting No Worth the Bet?
          </div>
          <HelpButton label="About these betting odds" helpText={ODDS_HELP} />
        </div>

        <BettingOddsMatchup result={userResult} showTeamCrests />
      </div>

      <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        <AssumptionsFooter vns={userResult.voteNoScenario} />
        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{ASSUMPTIONS_FOOTNOTE}</p>
      </div>

      {referenceResults.length > 0 && (
        <div className="px-5 pb-5 pt-4 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
            Benchmark odds
          </div>
          {referenceResults.map((result, i) => (
            <CompactOddsRow key={i} result={result} label={SCENARIO_LABELS[i + 1] ?? `Scenario ${i + 2}`} />
          ))}
        </div>
      )}
    </div>
  )
}
