import { useEffect, useRef, useState } from 'react'
import {
  AIRLINE_HISTORY_INTRO,
  AIRLINE_SECOND_OFFER_HISTORY,
  ARRIVAL_AVERAGE_MATH,
  articleLinkTypeLabel,
  formatArrivalMonths,
  type AirlineSecondOfferRecord,
} from '../../data/airlineSecondOfferHistory'
import { formatDateAbbrevMonth } from '../../lib/inputDisplay'
import {
  AirlineHistorySources,
  AirlineHistoryTable,
} from './AirlineHistoryModalContent'
import { SliderWithMarkers, type MarkerRecord } from './SliderWithMarkers'

interface Props {
  value: number
  min: number
  max: number
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

function AirlineTooltipBody({ record }: { record: AirlineSecondOfferRecord }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex items-center justify-center rounded overflow-hidden shrink-0"
          style={{ width: 36, height: 24, background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}
        >
          <img src={record.logoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
        </div>
        <div className="font-semibold text-xs" style={{ color: 'var(--text-base)' }}>{record.airline}</div>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>First TA rejected</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{formatDateAbbrevMonth(record.firstTARejected)}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Second TA ratified</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{formatDateAbbrevMonth(record.secondTARatified)}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Time between</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{record.daysBetween} days (~{formatArrivalMonths(record.approximateMonths)} mo)</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--text-faint)' }}>Approx. economic increase</dt>
          <dd style={{ color: 'var(--text-muted)' }}>{record.economicIncrease}</dd>
        </div>
      </dl>
      <div className="mt-2 pt-2 border-t text-xs flex flex-wrap items-center gap-x-1.5 gap-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
        {record.articleLinks.map((link, index) => (
          <span key={link.url} className="flex items-center gap-x-1.5">
            {index > 0 && <span style={{ color: 'var(--text-faint)' }}>|</span>}
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>
              {articleLinkTypeLabel(record, index)}
            </a>
          </span>
        ))}
      </div>
    </>
  )
}

function AirlineHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { dayValues, carrierCount, averageDays, months, outlierLabel } = ARRIVAL_AVERAGE_MATH

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
      <div ref={dialogRef} className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} role="dialog" aria-modal="true" aria-labelledby="airline-history-title" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 id="airline-history-title" className="font-bold text-base" style={{ color: 'var(--text-base)' }}>Historical Second-Offer Timelines</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{AIRLINE_HISTORY_INTRO}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }} aria-label="Close modal">×</button>
        </div>
        <div className="overflow-auto px-5 py-4">
          <AirlineHistoryTable showIncreaseColumn={false} />
          <CalculationBox title="How we get 13.3 months (Average scenario default)">
            <p>{outlierLabel} is treated as an outlier and excluded from the average.</p>
            <p>({dayValues.join(' + ')}) ÷ {carrierCount} = {Math.round(averageDays)} days average</p>
            <p>{Math.round(averageDays)} ÷ 365 × 12 = <strong style={{ color: 'var(--text-base)' }}>{formatArrivalMonths(months)} months</strong></p>
          </CalculationBox>
          <AirlineHistorySources />
        </div>
      </div>
    </div>
  )
}

export function SecondOfferArrivalInput({ value, min, max, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const markers: MarkerRecord[] = AIRLINE_SECOND_OFFER_HISTORY.map((record) => ({
    id: record.id,
    months: record.approximateMonths,
    logoSrcs: [record.logoSrc],
    label: record.airline,
    modalContent: <AirlineTooltipBody record={record} />,
  }))

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <label className="block text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
          If we receive a second offer, how many months from July will it take until it is ratified and implemented?
        </label>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
          style={{ color: 'var(--accent)', background: 'var(--chip-bg)', border: '1px solid var(--chip-border)' }}
          aria-label="View historical airline second-offer timelines"
        >
          <InfoIcon />
        </button>
      </div>

      <SliderWithMarkers
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={onChange}
        formatValue={(v) => `${v} months`}
        markers={markers}
        footnote="Click a logo to jump the slider to that timeline and see historical details. * FedEx excluded from the 13.3-month industry average as an outlier."
      />

      <AirlineHistoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
