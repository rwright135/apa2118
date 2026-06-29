import { useEffect, useRef, useState } from 'react'
import {
  AIRLINE_HISTORY_INTRO,
  AIRLINE_SECOND_OFFER_HISTORY,
  ARRIVAL_AVERAGE_MATH,
  articleLinkTypeLabel,
  formatArrivalMonths,
  type AirlineSecondOfferRecord,
} from '../../data/airlineSecondOfferHistory'
import {
  AirlineHistoryFootnote,
  AirlineHistorySources,
  AirlineHistoryTable,
} from './AirlineHistoryModalContent'

interface Props {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function monthToPercent(months: number, min: number, max: number): number {
  return ((months - min) / (max - min)) * 100
}

/**
 * Assign stagger rows by pixel proximity rather than raw months,
 * so the layout adapts gracefully across screen widths.
 * sliderWidthPx defaults to 320 (conservative mobile estimate).
 */
function assignMarkerRows(
  records: AirlineSecondOfferRecord[],
  min: number,
  max: number,
  sliderWidthPx = 320,
  chipWidthPx = 36,
): Map<string, number> {
  const toPixels = (months: number) =>
    ((months - min) / (max - min)) * sliderWidthPx

  const sorted = [...records].sort((a, b) => a.approximateMonths - b.approximateMonths)
  const rows = new Map<string, number>()
  const rowEndPx: number[] = []

  for (const record of sorted) {
    const px = toPixels(record.approximateMonths)
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

function AirlineTooltip({ record, onClose }: { record: AirlineSecondOfferRecord; onClose: () => void }) {
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
        <img src={record.logoSrc} alt="" className="h-7 w-auto max-w-[64px] object-contain" />
        <div className="font-semibold text-xs" style={{ color: 'var(--text-base)' }}>{record.airline}</div>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>First TA rejected</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{record.firstTARejected}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Second TA ratified</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{record.secondTARatified}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Time between</dt>
          <dd style={{ color: 'var(--text-muted)' }}>
            {record.daysBetween} days (~{formatArrivalMonths(record.approximateMonths)} mo)
          </dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Approx. economic increase</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{record.economicIncrease}</dd>
        </div>
      </dl>
      <ul className="space-y-1 mt-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
        {record.articleLinks.map((link, index) => (
          <li key={link.url}>
            <span style={{ color: 'var(--text-faint)' }}>{articleLinkTypeLabel(record, index)}: </span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: 'var(--accent)' }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CHIP_SIZE = 32   // px — uniform square chip for every logo
const ROW_HEIGHT = CHIP_SIZE + 6 // gap between stagger rows

function ArrivalSliderWithMarkers({
  value,
  min,
  max,
  onChange,
  activeId,
  onSelect,
}: {
  value: number
  min: number
  max: number
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

  const markerRows = assignMarkerRows(AIRLINE_SECOND_OFFER_HISTORY, min, max, sliderWidth, CHIP_SIZE)
  const maxRow = Math.max(...AIRLINE_SECOND_OFFER_HISTORY.map((r) => markerRows.get(r.id) ?? 0))
  const markerAreaHeight = (maxRow + 1) * ROW_HEIGHT + 8

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>
          {value} months
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
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: 'var(--bg-elevated)', accentColor: 'var(--gold)' }}
        />

        {AIRLINE_SECOND_OFFER_HISTORY.map((record) => {
          const row = markerRows.get(record.id) ?? 0
          const left = monthToPercent(record.approximateMonths, min, max)
          const isActive = activeId === record.id
          const topOffset = 12 + row * ROW_HEIGHT  // px below the track

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
                {isActive && <AirlineTooltip record={record} onClose={() => onSelect(null)} />}
                <button
                  type="button"
                  onClick={() => onSelect(isActive ? null : record.id)}
                  onMouseEnter={() => onSelect(record.id)}
                  className="flex items-center justify-center rounded-lg transition-all hover:scale-110 focus:outline-none"
                  style={{
                    width: `${CHIP_SIZE}px`,
                    height: `${CHIP_SIZE}px`,
                    background: '#ffffff',
                    border: isActive
                      ? '2px solid var(--gold)'
                      : '1px solid rgba(0,0,0,0.12)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    padding: '3px',
                  }}
                  aria-label={`${record.airline}, approximately ${formatArrivalMonths(record.approximateMonths)} months`}
                  aria-expanded={isActive}
                >
                  <img
                    src={record.logoSrc}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    draggable={false}
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
        <span>{min} months</span>
        <span>{max} months</span>
      </div>
      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
        Tap or hover a logo to see historical timing. * FedEx excluded from the 13.3-month average as an outlier.
      </p>
    </div>
  )
}

function AirlineHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { dayValues, carrierCount, averageDays, months, outlierLabel } = ARRIVAL_AVERAGE_MATH

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
        aria-labelledby="airline-history-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <h2 id="airline-history-title" className="font-bold text-base" style={{ color: 'var(--text-base)' }}>
              Historical Second-Offer Timelines
            </h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {AIRLINE_HISTORY_INTRO}
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
          <AirlineHistoryTable />

          <CalculationBox title="How we get 13.3 months (Average scenario default)">
            <p>
              {outlierLabel} is treated as an outlier and excluded from the average.
            </p>
            <p>
              ({dayValues.join(' + ')}) ÷ {carrierCount} = {Math.round(averageDays)} days average
            </p>
            <p>
              {Math.round(averageDays)} ÷ 365 × 12 = <strong style={{ color: 'var(--text-base)' }}>{formatArrivalMonths(months)} months</strong>
            </p>
          </CalculationBox>

          <AirlineHistorySources />
          <AirlineHistoryFootnote />
        </div>
      </div>
    </div>
  )
}

export function SecondOfferArrivalInput({ value, min, max, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeAirlineId, setActiveAirlineId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeAirlineId) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) {
        setActiveAirlineId(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [activeAirlineId])

  return (
    <div ref={sectionRef}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <label className="block text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
          If the second offer comes — how many months from now?
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
          aria-label="View historical airline second-offer timelines"
        >
          <InfoIcon />
        </button>
      </div>

      <ArrivalSliderWithMarkers
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        activeId={activeAirlineId}
        onSelect={setActiveAirlineId}
      />

      <AirlineHistoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
