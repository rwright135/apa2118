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

interface Props {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function monthToPercent(months: number, min: number, max: number): number {
  return ((months - min) / (max - min)) * 100
}

const CHIP_SIZE = 32
const ROW_HEIGHT = CHIP_SIZE + 6

function assignMarkerRows(
  records: JcbaMergerRecord[],
  min: number,
  max: number,
  sliderWidthPx = 320,
  chipWidthPx = CHIP_SIZE,
): Map<string, number> {
  const toPixels = (months: number) =>
    ((months - min) / (max - min)) * sliderWidthPx

  const sorted = [...records].sort((a, b) => a.months - b.months)
  const rows = new Map<string, number>()
  const rowEndPx: number[] = []

  for (const record of sorted) {
    const px = toPixels(record.months)
    let row = 0
    while (rowEndPx[row] !== undefined && px - rowEndPx[row] < chipWidthPx + 4) {
      row += 1
    }
    rows.set(record.id, row)
    rowEndPx[row] = px + chipWidthPx / 2
  }

  return rows
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
    <div
      className="rounded-xl p-4 mt-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="font-semibold text-xs mb-2" style={{ color: 'var(--gold)' }}>{title}</div>
      <div className="text-xs leading-relaxed space-y-1.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {children}
      </div>
    </div>
  )
}

function MergerLogoMark({ record }: { record: JcbaMergerRecord }) {
  if (record.logoSrcs.length > 1) {
    return (
      <div
        className="flex items-center gap-0.5 px-1 py-0.5 rounded-md"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        {record.logoSrcs.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            className="h-5 w-auto max-w-[26px] object-contain"
            draggable={false}
          />
        ))}
      </div>
    )
  }

  return (
    <img
      src={record.logoSrcs[0]}
      alt=""
      className={`object-contain drop-shadow-sm ${record.isPlaceholder ? 'h-6 w-6 opacity-80' : 'h-6 w-auto max-w-[52px]'}`}
      draggable={false}
    />
  )
}

function MergerTooltip({ record, onClose }: { record: JcbaMergerRecord; onClose: () => void }) {
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl p-3 shadow-lg z-20"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      role="tooltip"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
        style={{ color: 'var(--text-faint)', background: 'var(--bg-elevated)' }}
        aria-label="Close tooltip"
      >
        ×
      </button>
      <div className="flex items-center gap-2 mb-2 pr-4">
        <MergerLogoMark record={record} />
        <div className="font-semibold text-xs" style={{ color: 'var(--text-base)' }}>{record.label}</div>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Merger close</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{record.mergerClose}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>JCBA completion</dt>
          <dd style={{ color: 'var(--text-muted)' }}>
            {record.jcbaCompletion}
            {record.completionNote ? ` (${record.completionNote})` : ''}
          </dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Duration</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{formatTimelineMonths(record.months)} months</dd>
        </div>
      </dl>
    </div>
  )
}

function JcbaSliderWithMarkers({
  value,
  min,
  max,
  step,
  onChange,
  activeId,
  onSelect,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  activeId: string | null
  onSelect: (id: string | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderWidth, setSliderWidth] = useState(320)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setSliderWidth(el.offsetWidth))
    observer.observe(el)
    setSliderWidth(el.offsetWidth)
    return () => observer.disconnect()
  }, [])

  const markerRows = assignMarkerRows(JCBA_MERGER_HISTORY, min, max, sliderWidth, CHIP_SIZE)
  const maxRow = Math.max(...JCBA_MERGER_HISTORY.map((r) => markerRows.get(r.id) ?? 0))
  const markerAreaHeight = (maxRow + 1) * ROW_HEIGHT + 8

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>
          {value} mo ({(value / 12).toFixed(1)} yrs)
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative"
        style={{ paddingBottom: `${markerAreaHeight}px` }}
        onMouseLeave={() => onSelect(null)}
      >
        <input
          type="range"
          tabIndex={-1}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: 'var(--bg-elevated)', accentColor: 'var(--gold)' }}
        />

        {JCBA_MERGER_HISTORY.map((record) => {
          const row = markerRows.get(record.id) ?? 0
          const left = monthToPercent(record.months, min, max)
          const isActive = activeId === record.id
          const topOffset = 12 + row * ROW_HEIGHT

          return (
            <div
              key={record.id}
              className="absolute z-20 pointer-events-none"
              style={{
                left: `${left}%`,
                top: `${topOffset}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="relative pointer-events-auto">
                {isActive && <MergerTooltip record={record} onClose={() => onSelect(null)} />}
                <button
                  type="button"
                  onClick={() => onSelect(isActive ? null : record.id)}
                  onMouseEnter={() => onSelect(record.id)}
                  className="flex items-center justify-center rounded-lg transition-all hover:scale-110 focus:outline-none overflow-hidden"
                  style={{
                    width: record.logoSrcs.length > 1 ? `${CHIP_SIZE * 2 + 2}px` : `${CHIP_SIZE}px`,
                    height: `${CHIP_SIZE}px`,
                    background: '#ffffff',
                    border: isActive
                      ? '2px solid var(--gold)'
                      : '1px solid rgba(0,0,0,0.12)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    padding: record.logoSrcs.length > 1 ? '3px 2px' : '3px',
                    gap: '2px',
                  }}
                  aria-label={`${record.label}, ${formatTimelineMonths(record.months)} months`}
                  aria-expanded={isActive}
                >
                  {record.logoSrcs.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      style={{
                        height: '100%',
                        width: record.logoSrcs.length > 1 ? `${CHIP_SIZE - 6}px` : '100%',
                        objectFit: 'contain',
                        flexShrink: 0,
                      }}
                      draggable={false}
                    />
                  ))}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
        <span>{min} mo ({(min / 12).toFixed(1)} yrs)</span>
        <span>{max} mo ({(max / 12).toFixed(1)} yrs)</span>
      </div>
      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
        Tap or hover a logo for historical JCBA timing. * Atlas Air / Southern Air excluded from the {formatTimelineMonths(AVERAGE_JCBA_MONTHS)}-month average as an outlier.
      </p>
    </div>
  )
}

function JcbaHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { monthValues, carrierCount, months, outlierLabel } = JCBA_AVERAGE_MATH

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.55)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jcba-history-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <h2 id="jcba-history-title" className="font-bold text-base" style={{ color: 'var(--text-base)' }}>
              Historical JCBA Merger Timelines
            </h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {JCBA_HISTORY_INTRO}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="overflow-auto px-5 py-4">
          <table className="w-full min-w-[640px] text-xs border-collapse">
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
                    <div className="flex items-center gap-2">
                      <MergerLogoMark record={record} />
                      <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{record.label}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.mergerClose}</td>
                  <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>
                    {record.jcbaCompletion}
                    {record.completionNote && (
                      <div style={{ color: 'var(--text-faint)' }}>{record.completionNote}</div>
                    )}
                  </td>
                  <td className="py-3 align-top tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {formatTimelineMonths(record.months)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <CalculationBox title={`How we get ${formatTimelineMonths(months)} months (Average scenario default)`}>
            <p>{outlierLabel} is treated as an outlier and excluded from the average.</p>
            <p>
              ({monthValues.map(formatTimelineMonths).join(' + ')}) ÷ {carrierCount} ={' '}
              <strong style={{ color: 'var(--text-base)' }}>{formatTimelineMonths(months)} months</strong>
            </p>
          </CalculationBox>

          <div
            className="rounded-xl p-4 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            {([
              ['Average', JCBA_SUMMARY_STATS.average],
              ['Median', JCBA_SUMMARY_STATS.median],
              ['Shortest', JCBA_SUMMARY_STATS.shortest],
              ['Longest', JCBA_SUMMARY_STATS.longest],
            ] as const).map(([label, val]) => (
              <div key={label}>
                <div style={{ color: 'var(--text-faint)' }}>{label}</div>
                <div className="font-semibold tabular-nums" style={{ color: 'var(--text-base)' }}>
                  {formatTimelineMonths(val)} mo
                </div>
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
  const [activeMergerId, setActiveMergerId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeMergerId) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) {
        setActiveMergerId(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [activeMergerId])

  return (
    <div ref={sectionRef}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <label className="block text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
          How long until the JCBA is concluded?
        </label>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
          style={{
            color: 'var(--accent)',
            background: 'var(--chip-bg)',
            border: '1px solid var(--chip-border)',
          }}
          aria-label="View historical JCBA merger timelines"
        >
          <InfoIcon />
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
        If there&apos;s no second offer, you stay on current CBA (DOS+5) rates all the way until the JCBA concludes.
      </p>

      <JcbaSliderWithMarkers
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        activeId={activeMergerId}
        onSelect={setActiveMergerId}
      />

      <JcbaHistoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
