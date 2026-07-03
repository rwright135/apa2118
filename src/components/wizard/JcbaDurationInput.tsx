import { useEffect, useRef, useState } from 'react'
import {
  AVERAGE_JCBA_MONTHS,
  JCBA_AVERAGE_MATH,
  JCBA_HISTORY_INTRO,
  JCBA_MERGER_HISTORY,
  JCBA_SUMMARY_STATS,
  formatTimelineMonths,
  type JcbaMergerRecord,
} from '../../data/jcbaMergerHistory'
import { formatDateAbbrevMonth } from '../../lib/inputDisplay'
import { SliderWithMarkers, type MarkerRecord } from './SliderWithMarkers'

interface Props {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" strokeLinecap="round" />
    </svg>
  )
}

function CalculationBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 mt-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="font-semibold text-xs mb-2" style={{ color: 'var(--gold)' }}>{title}</div>
      <div className="text-xs leading-relaxed space-y-1.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {children}
      </div>
    </div>
  )
}

function MergerTooltipBody({ record }: { record: JcbaMergerRecord }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1 shrink-0">
          {record.logoSrcs.map((src) => (
            <div key={src} className="flex items-center justify-center rounded overflow-hidden" style={{ width: 26, height: 22, background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
            </div>
          ))}
        </div>
        <div className="font-semibold text-xs" style={{ color: 'var(--text-base)' }}>{record.label}</div>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Merger close</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{formatDateAbbrevMonth(record.mergerClose)}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>JCBA completion</dt>
          <dd style={{ color: 'var(--text-muted)' }}>
            {formatDateAbbrevMonth(record.jcbaCompletion)}
            {record.completionNote ? <span style={{ color: 'var(--text-faint)' }}> ({record.completionNote})</span> : null}
          </dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Duration</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{formatTimelineMonths(record.months)} months</dd>
        </div>
      </dl>
    </>
  )
}

function JcbaHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { monthValues, carrierCount, months } = JCBA_AVERAGE_MATH

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} role="presentation">
      <div ref={dialogRef} className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} role="dialog" aria-modal="true" aria-labelledby="jcba-history-title" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 id="jcba-history-title" className="font-bold text-base" style={{ color: 'var(--text-base)' }}>Historical JCBA Merger Timelines</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{JCBA_HISTORY_INTRO}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }} aria-label="Close modal">×</button>
        </div>
        <div className="overflow-auto px-5 py-4">
          <table className="w-full min-w-[480px] text-xs border-collapse">
            <thead>
              <tr style={{ color: 'var(--text-faint)' }}>
                <th className="text-left font-semibold pb-3 pr-3">Merger</th>
                <th className="text-left font-semibold pb-3 pr-3">Merger Close</th>
                <th className="text-left font-semibold pb-3 pr-3">JCBA Completion</th>
                <th className="text-left font-semibold pb-3">Months</th>
              </tr>
            </thead>
            <tbody>
              {JCBA_MERGER_HISTORY.map((record) => (
                <tr key={record.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td className="py-3 pr-3 align-top">
                    <div className="flex items-center gap-1.5">
                      {record.logoSrcs.map((src) => (
                        <div key={src} className="flex items-center justify-center rounded overflow-hidden shrink-0" style={{ width: 28, height: 22, background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
                          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
                        </div>
                      ))}
                      <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{record.label}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{formatDateAbbrevMonth(record.mergerClose)}</td>
                  <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>
                    {formatDateAbbrevMonth(record.jcbaCompletion)}
                    {record.completionNote && <div style={{ color: 'var(--text-faint)' }}>{record.completionNote}</div>}
                  </td>
                  <td className="py-3 align-top tabular-nums font-semibold" style={{ color: 'var(--text-base)' }}>{formatTimelineMonths(record.months)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <CalculationBox title={`How we get ${formatTimelineMonths(months)} months (Average scenario default)`}>
            <p>({monthValues.map(formatTimelineMonths).join(' + ')}) ÷ {carrierCount} = <strong style={{ color: 'var(--text-base)' }}>{formatTimelineMonths(months)} months</strong></p>
          </CalculationBox>

          <div className="rounded-xl p-4 mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            {([
              ['Average (all 4)', JCBA_SUMMARY_STATS.average],
              ['Shortest', JCBA_SUMMARY_STATS.shortest],
              ['Longest', JCBA_SUMMARY_STATS.longest],
            ] as const).map(([label, val]) => (
              <div key={label}>
                <div style={{ color: 'var(--text-faint)' }}>{label}</div>
                <div className="font-semibold tabular-nums" style={{ color: 'var(--text-base)' }}>{formatTimelineMonths(val)} mo</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function JcbaDurationInput({ value, min, max, step, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const markers: MarkerRecord[] = JCBA_MERGER_HISTORY.map((record) => ({
    id: record.id,
    months: record.months,
    logoSrcs: record.logoSrcs,
    label: record.label,
    modalContent: <MergerTooltipBody record={record} />,
  }))

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <label className="block text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
          How long until the JCBA is concluded?
        </label>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
          style={{ color: 'var(--accent)', background: 'var(--chip-bg)', border: '1px solid var(--chip-border)' }}
          aria-label="View historical JCBA merger timelines"
        >
          <InfoIcon />
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
        If there&apos;s no second offer, you stay on current CBA (DOS+5) rates all the way until the JCBA concludes.
      </p>

      <SliderWithMarkers
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        formatValue={(v) => `${v} mo (${(v / 12).toFixed(1)} yrs)`}
        markers={markers}
        footnote={`Tap a logo to jump the slider to that timeline and see historical JCBA details. All-carrier average: ${formatTimelineMonths(AVERAGE_JCBA_MONTHS)} months.`}
      />

      <JcbaHistoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
