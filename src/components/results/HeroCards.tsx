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

function fmtAssumptionsFooter(vns: VoteNoScenario) {
  return `${Math.round(vns.probability * 100)}% 2nd Offer Probability in ${vns.arrivalMonths}mons | ${(vns.percentAboveTA * 100).toFixed(0)}% Higher | JCBA in ${vns.jcbaDurationMonths}mons`
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

  const scenarioA = result.scenarios.find(s => s.scenarioId === 'A')!
  const scenarioB = result.scenarios.find(s => s.scenarioId === 'B')!
  const scenarioC = result.scenarios.find(s => s.scenarioId === 'C')!
  const { jcbaDurationMonths: jcba, arrivalMonths, percentAboveTA } = result.voteNoScenario
  const { retentionPayoutProbabilityB: pB, retentionPayoutProbabilityC: pC, retentionCurrentBalance } = result.inputs

  // ── Best case: Outcome B (offer arrives) ─────────────────────────────────────
  const bPVGap = scenarioB.preJcbaTotal - scenarioA.preJcbaTotal   // + = Vote No wins

  const bRetPayoutRow = scenarioB.rows.find(r => r.retentionCashFlow > 0)
  const bRetPayoutMonths = bRetPayoutRow?.monthIndex ?? (arrivalMonths + 2)

  // ── Worst case: Outcome C (no offer, stay on CBA) ────────────────────────────
  // Nominal wages + PS you give up compared to accepting the TA today
  const cWagesShortfall =
    (scenarioA.totalGrossPay + scenarioA.totalProfitSharing) -
    (scenarioC.totalGrossPay + scenarioC.totalProfitSharing)   // + = Vote No earns less

  // Vote Yes pays current retention balance at ratification; Scenario C delays it
  const cRetentionForegone = scenarioA.totalRetention
  const cHeadlineLoss = cWagesShortfall + cRetentionForegone

  // Full PV gap worst case (includes retention in both; + = Vote Yes leads even after retention)
  const cPVGap = scenarioA.preJcbaTotal - scenarioC.preJcbaTotal

  // ── Retention bonus growth & recovery (Scenario C) ───────────────────────────
  // Find the payout row to get exact timing and discount factor
  const cRetPayoutRow = scenarioC.rows.find(r => r.retentionCashFlow > 0)
  const cRetPayoutMonths = cRetPayoutRow?.monthIndex ?? (jcba + 2)

  // Nominal accrued balance at payout — sum of starting balance + monthly accruals
  let cRetAccrued = retentionCurrentBalance
  for (const row of scenarioC.rows) {
    if (row.monthIndex >= cRetPayoutMonths) break
    cRetAccrued += row.retentionAccrualNote
  }

  // PV of the probability-weighted payout (retentionCashFlow already × pC in engine)
  const cRetPV = cRetPayoutRow
    ? cRetPayoutRow.retentionCashFlow * cRetPayoutRow.discountFactor
    : 0

  const voteNoLeads = result.voteNoExpected.preJcbaTotal > scenarioA.preJcbaTotal

  return (
    <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center px-5 py-3 text-xs font-medium transition-colors"
        style={{ color: 'var(--text-muted)', background: 'transparent' }}
      >
        <span className="flex items-center gap-1.5">
          <span style={{ fontSize: '11px' }}>{open ? '▲' : '▼'}</span>
          {voteNoLeads
            ? 'What if the offer never comes? Best & worst case'
            : 'Why does Vote No trail? Scenario-by-scenario breakdown'}
        </span>
      </button>

      {open && (
        <div className="px-5 pt-5 pb-5 space-y-3" style={{ background: 'var(--bg-elevated)' }}>

          {/* Card 1: Best case — Outcome B */}
          <div className="rounded-xl px-4 py-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: bPVGap >= 0 ? 'var(--positive)' : 'var(--negative)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                  If the second offer arrives
                </span>
              </div>
              <span className="text-base font-black tabular-nums shrink-0"
                style={{ color: bPVGap >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {bPVGap >= 0 ? '+' : '−'}{fmt(Math.abs(bPVGap))}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              If the second offer arrives in {arrivalMonths} month{arrivalMonths !== 1 ? 's' : ''} at {(percentAboveTA * 100).toFixed(0)}% higher, then you will make an additional{' '}
              <strong style={{ color: 'var(--text-muted)' }}>{fmt(Math.abs(bPVGap))}</strong> in today&apos;s dollars between now and JCBA closing in {jcba} months vs. Voting Yes.
              {bRetPayoutRow && (
                <>
                  {' '}This number also includes your Retention Bonus payment in {bRetPayoutMonths} month{bRetPayoutMonths !== 1 ? 's' : ''} from now at {Math.round(pB * 100)}% payout probability.
                </>
              )}
            </p>
          </div>

          {/* Card 2: Worst case — Outcome C earnings shortfall */}
          <div className="rounded-xl px-4 py-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cHeadlineLoss > 0 ? 'var(--negative)' : 'var(--positive)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                  If no offer arrives
                </span>
              </div>
              <span className="text-base font-black tabular-nums shrink-0"
                style={{ color: cHeadlineLoss > 0 ? 'var(--negative)' : 'var(--positive)' }}>
                {cHeadlineLoss > 0 ? '−' : '+'}{fmt(Math.abs(cHeadlineLoss))}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              {cWagesShortfall > 0
                ? <>
                    If the second offer doesn&apos;t arrive and you earn the current CBA rates until the closing of JCBA in {jcba} months, you&apos;d be missing out on{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(cWagesShortfall)}</strong> in nominal wages and profit sharing vs. Voting Yes.
                    Additionally, you&apos;d delay your lump sum Retention Bonus payment of{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(retentionCurrentBalance)}</strong>.
                  </>
                : <>
                    If the second offer doesn&apos;t arrive, CBA pay rates in this scenario keep your earnings competitive vs. Voting Yes.
                    You&apos;d still delay your lump sum Retention Bonus payment of{' '}
                    <strong style={{ color: 'var(--text-muted)' }}>{fmt(retentionCurrentBalance)}</strong> until JCBA closes in {jcba} months.
                  </>}
            </p>
          </div>

          {/* Net worst case — retention recovery factored in */}
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background:  cPVGap > 0 ? 'rgba(245,158,11,0.07)' : 'rgba(34,197,94,0.07)',
              border: `1px solid ${cPVGap > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cPVGap > 0 ? 'var(--warning)' : 'var(--positive)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                  Worth the Risk?
                </span>
              </div>
              <span className="text-base font-black tabular-nums shrink-0"
                style={{ color: cPVGap > 0 ? 'var(--warning)' : 'var(--positive)' }}>
                {cPVGap > 0 ? '−' : '+'}{fmt(Math.abs(cPVGap))} vs Vote Yes
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              Your current Retention Bonus of <strong style={{ color: 'var(--text-muted)' }}>{fmt(retentionCurrentBalance)}</strong> will accrue to{' '}
              <strong style={{ color: 'var(--text-muted)' }}>{fmt(cRetAccrued)}</strong> during the {jcba}-month JCBA period.
              At {Math.round(pC * 100)}% payout probability, that lump sum is worth{' '}
              <strong style={{ color: 'var(--text-muted)' }}>{fmt(cRetPV)}</strong> in today&apos;s dollars.
              {cPVGap > 0
                ? <>
                    {' '}So while the retention bonus will make you partially whole, you&apos;d still be roughly{' '}
                    <strong style={{ color: 'var(--warning)' }}>{fmt(cPVGap)} behind</strong> vs. Voting Yes.
                    {' '}So, no matter how high you rate the probability of a second offer, is the potential upside worth the risk?
                  </>
                : <>
                    {' '}So even in the worst case, the retention bonus more than offsets the CBA earnings gap — Vote No comes out ahead once accrual is counted.
                  </>}
            </p>
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
          Assumptions: {fmtAssumptionsFooter(result.voteNoScenario)}
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
