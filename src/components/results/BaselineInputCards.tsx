import { useState } from 'react'
import type { LineType, UserInputs } from '../../lib/types'
import {
  formatAnniversaryMonth,
  formatCurrency,
  formatLongevity,
  formatSeatName,
  formatYearsUntilRetirementValue,
  getExtraHoursColor,
  getLineTypeIcon,
} from '../../lib/inputDisplay'
import { EpauletCA, EpauletFO } from '../shared/EpauletIcon'
import { useStore } from '../../state/store'

interface Props {
  inputs: UserInputs
}

// ── Shared sub-components ────────────────────────────────────────────────────

function SeatProfileCard({
  longevity,
  seatName,
  icon,
}: {
  longevity: string
  seatName: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl px-3 py-2.5">
      <div className="flex items-start gap-2">
        {icon}
        <div className="min-w-0">
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-faint)' }}>
            {longevity}
          </div>
          <div className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-base)' }}>
            {seatName}
          </div>
        </div>
      </div>
    </div>
  )
}

function CombinedInputCard({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="rounded-xl px-3 py-2.5 space-y-1.5">
      {items.map(({ label, value }) => (
        <div key={label} className="text-sm leading-snug">
          <span style={{ color: 'var(--text-faint)' }}>{label}: </span>
          <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Pencil icon ──────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 2.5a2.121 2.121 0 013 3L5 15H1v-4L11.5 2.5z" />
    </svg>
  )
}

// ── Confirm / Cancel buttons ─────────────────────────────────────────────────

function EditActions({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-1.5 mt-2">
      <button
        onClick={onConfirm}
        className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors"
        style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
      >
        Recalculate
      </button>
      <button
        onClick={onCancel}
        className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors"
        style={{ background: 'var(--bg-base)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
      >
        Cancel
      </button>
    </div>
  )
}

// ── Line Type card ────────────────────────────────────────────────────────────

function LineTypeCard({ lineType }: { lineType: LineType }) {
  const { setInput, recalculate } = useStore()

  const toggle = () => {
    const next: LineType = lineType === 'FLYING' ? 'RESERVE' : 'FLYING'
    setInput('lineType', next)
    recalculate()
  }

  return (
    <button
      onClick={toggle}
      className="rounded-xl px-3 py-2.5 text-left w-full transition-colors group"
      style={{ background: 'var(--bg-elevated)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated-hover, color-mix(in srgb, var(--bg-elevated) 85%, var(--text-base)))')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
      title="Click to switch line type"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Line Type</span>
        <span className="opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-faint)' }}>
          <PencilIcon />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl shrink-0 leading-none" aria-hidden="true">{getLineTypeIcon(lineType)}</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>
          {lineType === 'FLYING' ? 'Flying Line Holder' : 'Reserve Line Holder'}
        </span>
      </div>
    </button>
  )
}

// ── Extra Hours card ──────────────────────────────────────────────────────────

function ExtraHoursCard({ hours }: { hours: number }) {
  const { setInput, recalculate } = useStore()
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(hours)

  const open = () => { setLocal(hours); setEditing(true) }
  const cancel = () => setEditing(false)
  const confirm = () => {
    setInput('extraHoursAboveMMG', local)
    recalculate()
    setEditing(false)
  }

  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-elevated)' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Extra Hours/Month</span>
        {!editing && (
          <button
            onClick={open}
            className="opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-faint)' }}
            aria-label="Edit extra hours"
          >
            <PencilIcon />
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={local}
              onChange={e => setLocal(Number(e.target.value))}
              className="flex-1 accent-[var(--gold)]"
            />
            <span className="text-sm font-bold tabular-nums w-10 text-right" style={{ color: getExtraHoursColor(local) }}>
              {local}
            </span>
          </div>
          <EditActions onConfirm={confirm} onCancel={cancel} />
        </>
      ) : (
        <button onClick={open} className="flex items-center gap-2 w-full text-left">
          <div className="text-sm font-semibold leading-snug">
            <span style={{ color: getExtraHoursColor(hours) }}>+{hours} hrs</span>
            <span style={{ color: 'var(--text-base)' }}> above MMG</span>
          </div>
        </button>
      )}
    </div>
  )
}

// ── Number edit card (Profit Sharing + Retention Balance) ────────────────────

function NumberEditCard({
  label,
  value,
  icon,
  inputKey,
  step,
  min,
}: {
  label: string
  value: number
  icon: React.ReactNode
  inputKey: 'profitSharingLastYear' | 'retentionCurrentBalance'
  step: number
  min: number
}) {
  const { setInput, recalculate } = useStore()
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value)

  const open = () => { setLocal(value); setEditing(true) }
  const cancel = () => setEditing(false)
  const confirm = () => {
    setInput(inputKey, Math.max(min, local))
    recalculate()
    setEditing(false)
  }

  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-elevated)' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</span>
        {!editing && (
          <button
            onClick={open}
            className="opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-faint)' }}
            aria-label={`Edit ${label}`}
          >
            <PencilIcon />
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm" style={{ color: 'var(--text-faint)' }}>$</span>
            <input
              type="number"
              min={min}
              step={step}
              value={local}
              onChange={e => setLocal(Number(e.target.value))}
              onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }}
              className="flex-1 text-sm font-semibold rounded-lg px-2 py-1 w-full"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                color: 'var(--text-base)',
                outline: 'none',
              }}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </div>
          <EditActions onConfirm={confirm} onCancel={cancel} />
        </>
      ) : (
        <button onClick={open} className="flex items-center gap-2 w-full text-left">
          {icon}
          <div className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-base)' }}>
            {formatCurrency(value)}
          </div>
        </button>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BaselineInputCards({ inputs }: Props) {
  const epauletProps = {
    size: 28,
    boardColor: 'var(--bg-base)',
    stripeColor: 'var(--gold)',
  }

  const seatIcon = inputs.seat === 'FO'
    ? <EpauletFO {...epauletProps} />
    : inputs.seat === 'CA'
      ? <EpauletCA {...epauletProps} />
      : undefined

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <SeatProfileCard
          longevity={formatLongevity(inputs.longevityAsOfJul2026)}
          seatName={formatSeatName(inputs.seat)}
          icon={seatIcon}
        />
        <CombinedInputCard
          items={[
            { label: 'Anniversary', value: formatAnniversaryMonth(inputs.anniversaryMonth) },
            { label: 'Years until Retirement', value: formatYearsUntilRetirementValue(inputs.dateOfBirth) },
          ]}
        />

        <LineTypeCard lineType={inputs.lineType} />

        <ExtraHoursCard hours={inputs.extraHoursAboveMMG ?? 0} />

        <NumberEditCard
          label="Annual Profit Sharing"
          value={inputs.profitSharingLastYear ?? 0}
          icon={<span className="text-xl shrink-0 leading-none" aria-hidden="true">💵</span>}
          inputKey="profitSharingLastYear"
          step={500}
          min={0}
        />
        <NumberEditCard
          label="Retention Bonus Balance"
          value={inputs.retentionCurrentBalance ?? 0}
          icon={<span className="text-xl shrink-0 leading-none" aria-hidden="true">💰</span>}
          inputKey="retentionCurrentBalance"
          step={1000}
          min={0}
        />
      </div>

      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
        *To change Seat, Longevity, or Advanced Scenario Assumptions, click <strong>Edit Inputs</strong> in the top left.
      </p>
    </div>
  )
}
