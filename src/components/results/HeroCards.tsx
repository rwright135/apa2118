import { useEffect, useRef, useState } from 'react'
import type { ComparisonResult, VoteNoScenario } from '../../lib/types'

const VOTE_YES_COLOR = 'var(--gold)'
const VOTE_NO_COLOR = 'var(--vote-no)'

interface Props { results: ComparisonResult[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function fmtAssumptionsCompact(vns: VoteNoScenario) {
  return `${Math.round(vns.probability * 100)}% offer probability · ${vns.arrivalMonths}mo arrival · +${(vns.percentAboveTA * 100).toFixed(0)}% above TA · JCBA ${vns.jcbaDurationMonths}mo`
}

function fmtAssumptionsSentence(
  vns: VoteNoScenario,
  retentionPayoutProbabilityB: number,
  retentionPayoutProbabilityC: number,
) {
  const offerPct = Math.round(vns.probability * 100)
  const premiumPct = (vns.percentAboveTA * 100).toFixed(0)
  const probB = Math.round(retentionPayoutProbabilityB * 100)
  const probC = Math.round(retentionPayoutProbabilityC * 100)

  return `${offerPct}% second offer probability arriving in ${vns.arrivalMonths} months at ${premiumPct}% higher above TA with JCBA closing in ${vns.jcbaDurationMonths} months. RB probability weighted at ${probB}% and ${probC}% respectively.`
}

const BOTTOM_LINE_HELP = (
  'These are Pre-JCBA decision window numbers: the present value of all earnings during this period in today\'s dollars. '
  + 'After the JCBA concludes, all paths converge to the same rates, therefore cancelling out those years for a more simplified estimate.'
)

function BottomLineHelp() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="About this bottom line comparison"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="w-5 h-5 rounded-full text-xs font-bold leading-none transition-colors"
        style={{
          color: 'var(--text-faint)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        ?
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-20 w-64 rounded-xl px-3 py-2.5 text-xs leading-relaxed shadow-lg"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          {BOTTOM_LINE_HELP}
        </div>
      )}
    </div>
  )
}

// ── Single scenario: verdict card ─────────────────────────────────────────────

function SingleScenarioVerdict({ result }: { result: ComparisonResult }) {
  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo    = result.voteNoExpected
  const aVal      = scenarioA.preJcbaTotal
  const noVal     = voteNo.preJcbaTotal
  const diff      = aVal - noVal
  const aWins     = diff > 0
  const maxVal    = Math.max(aVal, noVal)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      {/* Verdict */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Bottom line
          </div>
          <BottomLineHelp />
        </div>
        <div className="text-3xl font-black leading-tight" style={{ color: aWins ? VOTE_YES_COLOR : VOTE_NO_COLOR }}>
          {aWins ? 'Vote Yes' : 'Vote No'} leads
        </div>
        <div className="text-xl font-bold mt-0.5" style={{ color: aWins ? VOTE_YES_COLOR : VOTE_NO_COLOR, opacity: 0.85 }}>
          by {fmt(Math.abs(diff))}
        </div>
      </div>

      {/* Comparison rows */}
      <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: 'var(--border-subtle)', paddingTop: '16px' }}>
        {[
          { label: 'Vote Yes', sub: 'Accept the TA', val: aVal, color: VOTE_YES_COLOR },
          { label: 'Vote No',  sub: 'Probability-weighted expected value', val: noVal, color: VOTE_NO_COLOR },
        ].map(({ label, sub, val, color }) => (
          <div key={label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{sub}</span>
              </div>
              <span className="text-base font-bold tabular-nums" style={{ color }}>{fmt(val)}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(val / maxVal) * 100}%`, background: color, opacity: label === 'Vote No' ? 0.4 : 1 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Assumptions */}
      <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          Assumptions: {fmtAssumptionsSentence(
            result.voteNoScenario,
            result.inputs.retentionPayoutProbabilityB,
            result.inputs.retentionPayoutProbabilityC,
          )}
        </span>
      </div>
    </div>
  )
}

// ── Multiple scenarios: comparison table ──────────────────────────────────────

function MultiScenarioTable({ results }: { results: ComparisonResult[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                Assumptions
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
                Vote Yes
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                Vote No
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                Difference
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, i) => {
              const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
              const voteNo    = result.voteNoExpected
              const aVal      = scenarioA.preJcbaTotal
              const noVal     = voteNo.preJcbaTotal
              const diff      = aVal - noVal
              const aWins     = diff > 0
              const vns       = result.voteNoScenario
              const diffColor = aWins ? 'var(--positive)' : VOTE_NO_COLOR

              return (
                <tr
                  key={i}
                  className="border-b last:border-b-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <td className="px-5 py-4">
                    <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Scenario {i + 1}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {fmtAssumptionsCompact(vns)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-base font-bold tabular-nums" style={{ color: 'var(--gold)' }}>{fmt(aVal)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-base font-semibold tabular-nums" style={{ color: 'var(--text-base)' }}>{fmt(noVal)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="text-base font-black tabular-nums" style={{ color: diffColor }}>
                      {aWins ? '+' : '−'}{fmt(Math.abs(diff))}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: diffColor, opacity: 0.75 }}>
                      {aWins ? 'Vote Yes' : 'Vote No'} leads
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          Pre-JCBA decision window only · present value in today's dollars
        </span>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function HeroCards({ results }: Props) {
  if (results.length === 1) {
    return <SingleScenarioVerdict result={results[0]} />
  }

  return (
    <div className="space-y-2">
      <MultiScenarioTable results={results} />
      <p className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
        After the JCBA concludes, all paths converge to the same rates — those years cancel out.
      </p>
    </div>
  )
}
