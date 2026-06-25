import { useEffect, useRef, useState } from 'react'
import type { ComparisonResult, VoteNoScenario } from '../../lib/types'
import { VOTE_NO_CSS, VOTE_YES_CSS } from '../../lib/resultColors'

const VOTE_YES_COLOR = VOTE_YES_CSS
const VOTE_NO_COLOR = VOTE_NO_CSS

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

// ── Risk/reward accordion ──────────────────────────────────────────────────────

function RiskRewardAccordion({ result }: { result: ComparisonResult }) {
  const [open, setOpen] = useState(false)

  const scenarioA   = result.scenarios.find(s => s.scenarioId === 'A')!
  const voteNo      = result.voteNoExpected
  const jcba        = result.voteNoScenario.jcbaDurationMonths
  const { probability: p, arrivalMonths } = result.voteNoScenario
  const { retentionPayoutProbabilityB: pB, retentionPayoutProbabilityC: pC } = result.inputs

  const aVal  = scenarioA.preJcbaTotal
  const noVal = voteNo.preJcbaTotal
  const pvGap = noVal - aVal                   // positive = Vote No leads

  // Nominal wages + profit-sharing gap (pre-JCBA window)
  const yesRegComp = scenarioA.totalGrossPay + scenarioA.totalProfitSharing
  const noRegComp  = voteNo.totalGrossPay    + voteNo.totalProfitSharing
  const regCompGap = yesRegComp - noRegComp  // positive = Vote No earns less in regular comp

  // Retention PV (sum across all rows, including post-JCBA payout months)
  const yesRetPV = scenarioA.rows.reduce((s, r) => s + r.retentionCashFlow * r.discountFactor, 0)
  const noRetPV  = voteNo.rows.reduce((s, r) => s + r.retentionCashFlow * r.discountFactor, 0)
  const retPVGap = noRetPV - yesRetPV          // positive = Vote No gets more retention PV

  // Nominal retention gap
  const retNomGap = voteNo.totalRetention - scenarioA.totalRetention

  // Blended payout probability (weighted by offer-arrival probability)
  const blendedPayoutProb = p * pB + (1 - p) * pC

  // Share of PV gap attributable to retention
  const retSharePct = pvGap !== 0 ? Math.round((retPVGap / pvGap) * 100) : 0

  const voteNoLeads = pvGap > 0

  return (
    <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-medium transition-colors"
        style={{ color: 'var(--text-muted)', background: 'transparent' }}
      >
        <span className="flex items-center gap-1.5">
          <span style={{ fontSize: '11px' }}>{open ? '▲' : '▼'}</span>
          {voteNoLeads
            ? "What\u2019s behind this advantage? Risk/reward breakdown"
            : "What\u2019s behind these numbers? Risk/reward breakdown"}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)', border: '1px solid var(--border-subtle)' }}>
          {voteNoLeads ? `Vote No +${fmt(pvGap)}` : `Vote Yes +${fmt(-pvGap)}`}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4" style={{ background: 'var(--bg-elevated)' }}>

          {/* Row 1: Upside */}
          <div className="rounded-xl px-4 py-3 space-y-0.5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
              {voteNoLeads ? 'The potential upside' : 'The Vote Yes advantage'}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {voteNoLeads
                  ? 'If you vote No, you could pocket an extra'
                  : 'Voting Yes puts you ahead by'}
              </span>
              <span className="text-base font-black tabular-nums" style={{ color: voteNoLeads ? 'var(--positive)' : VOTE_YES_CSS }}>
                {voteNoLeads ? '+' : '+'}{fmt(Math.abs(pvGap))}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              Present-value difference over the entire JCBA decision window ({jcba} months)
            </p>
          </div>

          {/* Row 2: Wage sacrifice */}
          <div className="rounded-xl px-4 py-3 space-y-0.5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
              Regular earnings during this window
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Wages + profit sharing (nominal)
              </span>
              <div className="text-right">
                <span className="text-base font-black tabular-nums" style={{ color: regCompGap > 0 ? 'var(--warning)' : 'var(--positive)' }}>
                  {regCompGap > 0 ? '−' : '+'}{fmt(Math.abs(regCompGap))}
                </span>
                <span className="text-xs ml-1.5" style={{ color: 'var(--text-faint)' }}>vs Vote Yes</span>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {regCompGap > 0
                ? `Staying on the CBA means lower pay rates — Vote No earns ${fmt(regCompGap)} less in wages & profit sharing before the JCBA closes.`
                : `With a second offer premium of +${(result.voteNoScenario.percentAboveTA * 100).toFixed(0)}% arriving in ${arrivalMonths} months, Vote No actually earns more in base compensation.`}
            </p>
          </div>

          {/* Row 3: Retention bonus */}
          <div className="rounded-xl px-4 py-3 space-y-2.5" style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-subtle)` }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              What offsets that gap — the retention bonus
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Retention bonus edge (nominal)</span>
              <span className="text-base font-black tabular-nums" style={{ color: retNomGap > 0 ? VOTE_NO_COLOR : 'var(--text-base)' }}>
                {retNomGap >= 0 ? '+' : '−'}{fmt(Math.abs(retNomGap))}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Present value of that bonus
              </span>
              <div className="text-right">
                <span className="text-base font-bold tabular-nums" style={{ color: retPVGap > 0 ? VOTE_NO_COLOR : 'var(--text-base)' }}>
                  {retPVGap >= 0 ? '+' : '−'}{fmt(Math.abs(retPVGap))}
                </span>
                <span className="text-xs ml-1.5" style={{ color: 'var(--text-faint)' }}>today</span>
              </div>
            </div>

            <div className="pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'var(--vote-no-dim)', color: VOTE_NO_COLOR, border: `1px solid var(--vote-no)` }}>
                  {Math.round(blendedPayoutProb * 100)}% weighted payout probability
                </span>
                {Math.abs(retSharePct) >= 80 && (
                  <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    ~{Math.abs(retSharePct)}% of the edge is retention
                  </span>
                )}
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                {retNomGap > 0 && retPVGap > 0
                  ? `Vote No accrues ${fmt(retNomGap)} more in retention than Vote Yes (which only locks in your current balance). Discounted to today, that's worth ${fmt(retPVGap)} — but only at a ${Math.round(blendedPayoutProb * 100)}% blended probability of payout.`
                  : `Vote Yes locks in your current retention balance immediately. Vote No's retention picture is smaller or less certain.`}
              </p>
            </div>
          </div>

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

      {/* Risk/reward accordion */}
      <RiskRewardAccordion result={result} />

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
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: VOTE_NO_COLOR }}>
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
                    <span className="text-base font-semibold tabular-nums" style={{ color: VOTE_NO_COLOR }}>{fmt(noVal)}</span>
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
