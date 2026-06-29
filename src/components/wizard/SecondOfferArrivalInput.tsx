import { useEffect, useRef, useState } from 'react'
import { SliderInput } from '../shared/SliderInput'
import {
  AIRLINE_HISTORY_INTRO,
  AIRLINE_SECOND_OFFER_HISTORY,
  ARRIVAL_AVERAGE_MATH,
  type AirlineSecondOfferRecord,
} from '../../data/airlineSecondOfferHistory'

interface Props {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function monthToPercent(months: number, min: number, max: number): number {
  return ((months - min) / (max - min)) * 100
}

function assignMarkerRows(records: AirlineSecondOfferRecord[], minGapMonths = 2): Map<string, number> {
  const sorted = [...records].sort((a, b) => a.approximateMonths - b.approximateMonths)
  const rows = new Map<string, number>()
  const rowEnds: number[] = []

  for (const record of sorted) {
    let row = 0
    while (rowEnds[row] !== undefined && record.approximateMonths - rowEnds[row] < minGapMonths) {
      row += 1
    }
    rows.set(record.id, row)
    rowEnds[row] = record.approximateMonths
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
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl p-3 shadow-lg z-20"
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
        <img src={record.logoSrc} alt="" className="w-8 h-8 rounded-lg object-contain" />
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
            {record.daysBetween} days (~{record.approximateMonths} mo)
          </dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Approx. economic increase</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{record.economicIncrease}</dd>
        </div>
      </dl>
    </div>
  )
}

function AirlineTimeline({ min, max, activeId, onSelect }: {
  min: number
  max: number
  activeId: string | null
  onSelect: (id: string | null) => void
}) {
  const markerRows = assignMarkerRows(AIRLINE_SECOND_OFFER_HISTORY)
  const maxRow = Math.max(...AIRLINE_SECOND_OFFER_HISTORY.map((record) => markerRows.get(record.id) ?? 0))

  return (
    <div className="pt-2">
      <div className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>
        Historical second-offer timing at other carriers
      </div>
      <div
        className="relative rounded-lg"
        style={{
          height: `${44 + maxRow * 24}px`,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="absolute top-1/2 left-3 right-3 h-px -translate-y-1/2"
          style={{ background: 'var(--border)' }}
        />
        {AIRLINE_SECOND_OFFER_HISTORY.map((record) => {
          const row = markerRows.get(record.id) ?? 0
          const left = monthToPercent(record.approximateMonths, min, max)
          const isActive = activeId === record.id

          return (
            <div
              key={record.id}
              className="absolute -translate-x-1/2"
              style={{
                left: `calc(12px + (100% - 24px) * ${left / 100})`,
                top: `${12 + row * 22}px`,
              }}
            >
              {isActive && <AirlineTooltip record={record} onClose={() => onSelect(null)} />}
              <button
                type="button"
                onClick={() => onSelect(isActive ? null : record.id)}
                className="flex flex-col items-center gap-0.5 transition-transform hover:scale-105"
                aria-label={`${record.airline}, approximately ${record.approximateMonths} months`}
                aria-expanded={isActive}
              >
                <span
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm"
                  style={{
                    background: '#ffffff',
                    border: isActive ? '2px solid var(--gold)' : '1px solid var(--border)',
                  }}
                >
                  <img src={record.logoSrc} alt="" className="w-6 h-6 object-contain" />
                </span>
                <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--text-faint)' }}>
                  {record.approximateMonths}mo{record.isArrivalOutlier ? '*' : ''}
                </span>
              </button>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-faint)' }}>
        * Excluded from the 13-month industry average as an outlier
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
          <table className="w-full min-w-[640px] text-xs border-collapse">
            <thead>
              <tr style={{ color: 'var(--text-faint)' }}>
                <th className="text-left font-semibold pb-3 pr-3">Airline</th>
                <th className="text-left font-semibold pb-3 pr-3">First TA Rejected</th>
                <th className="text-left font-semibold pb-3 pr-3">Second TA Ratified</th>
                <th className="text-left font-semibold pb-3 pr-3">Time Between</th>
                <th className="text-left font-semibold pb-3">Approx. Increase*</th>
              </tr>
            </thead>
            <tbody>
              {AIRLINE_SECOND_OFFER_HISTORY.map((record) => (
                <tr key={record.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td className="py-3 pr-3 align-top">
                    <div className="flex items-center gap-2">
                      <img src={record.logoSrc} alt="" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
                      <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{record.airline}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.firstTARejected}</td>
                  <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.secondTARatified}</td>
                  <td className="py-3 pr-3 align-top tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {record.daysBetween} days
                    <div style={{ color: 'var(--text-faint)' }}>~{record.approximateMonths} mo</div>
                  </td>
                  <td className="py-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.economicIncrease}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <CalculationBox title="How we get 13 months (Average scenario default)">
            <p>
              {outlierLabel} is treated as an outlier and excluded from the average.
            </p>
            <p>
              ({dayValues.join(' + ')}) ÷ {carrierCount} = {Math.round(averageDays)} days average
            </p>
            <p>
              {Math.round(averageDays)} ÷ 365 × 12 = <strong style={{ color: 'var(--text-base)' }}>{months} months</strong>
            </p>
          </CalculationBox>

          <p className="text-[11px] mt-4 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            * Approximate increase in total economic value between first and second offers.
          </p>
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

      <SliderInput
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={onChange}
        formatValue={(v) => `${v} months`}
        showMinMax
      />

      <AirlineTimeline
        min={min}
        max={max}
        activeId={activeAirlineId}
        onSelect={setActiveAirlineId}
      />

      <AirlineHistoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
