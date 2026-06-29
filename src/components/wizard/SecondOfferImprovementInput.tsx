import { useEffect, useRef, useState } from 'react'
import { SliderInput } from '../shared/SliderInput'
import {
  AIRLINE_SECOND_OFFER_HISTORY,
  ECONOMIC_AVERAGE_MATH,
  ECONOMIC_INCREASE_INTRO,
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

function EconomicIncreaseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { unitedMidpointNote, sum, count, average } = ECONOMIC_AVERAGE_MATH
  const valueLabels = AIRLINE_SECOND_OFFER_HISTORY.map((record) => `${record.economicIncreasePercent}%`)

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
        aria-labelledby="economic-increase-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <h2 id="economic-increase-title" className="font-bold text-base" style={{ color: 'var(--text-base)' }}>
              Historical Offer Improvements
            </h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {ECONOMIC_INCREASE_INTRO}
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

          <CalculationBox title="How we get 13.5% (Average scenario default)">
            <p>{unitedMidpointNote}.</p>
            <p>
              ({valueLabels.join(' + ')}) ÷ {count} = {sum.toFixed(1)} ÷ {count} = <strong style={{ color: 'var(--text-base)' }}>{average}%</strong>
            </p>
          </CalculationBox>

          <AirlineHistorySources />
          <AirlineHistoryFootnote />
        </div>
      </div>
    </div>
  )
}

export function SecondOfferImprovementInput({ value, min, max, step, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <label className="block text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
          How much better would that offer be vs. the TA?
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
          aria-label="View historical airline offer improvement data"
        >
          <InfoIcon />
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
        A positive number means the new offer beats the current TA rates.
      </p>

      <SliderInput
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        formatValue={(v) => `+${v.toFixed(1)}%`}
        showMinMax
      />

      <EconomicIncreaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
