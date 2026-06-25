import type { UserInputs } from '../../lib/types'
import {
  formatLongevity,
  formatSeatName,
  getBaselineFinancialInputItems,
  getProfileInputItems,
} from '../../lib/inputDisplay'
import { EpauletCA, EpauletFO } from '../shared/EpauletIcon'

interface Props {
  inputs: UserInputs
}

function InputCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: 'var(--bg-elevated)' }}
    >
      <div className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-base)' }}>
        {value}
      </div>
    </div>
  )
}

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
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: 'var(--bg-elevated)' }}
    >
      <div className="text-xs mb-1.5" style={{ color: 'var(--text-faint)' }}>
        {longevity}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-base)' }}>
          {seatName}
        </div>
      </div>
    </div>
  )
}

export function BaselineInputCards({ inputs }: Props) {
  const epauletProps = {
    size: 28,
    boardColor: 'var(--bg-surface)',
    stripeColor: 'var(--gold)',
  }

  const seatIcon = inputs.seat === 'FO'
    ? <EpauletFO {...epauletProps} />
    : inputs.seat === 'CA'
      ? <EpauletCA {...epauletProps} />
      : undefined

  const profileItems = getProfileInputItems(inputs)
  const financialItems = getBaselineFinancialInputItems(inputs)

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        Baseline Inputs
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <SeatProfileCard
          longevity={formatLongevity(inputs.longevityAsOfJul2026)}
          seatName={formatSeatName(inputs.seat)}
          icon={seatIcon}
        />
        <div aria-hidden="true" />
        {profileItems.map(({ label, value }) => (
          <InputCard key={label} label={label} value={value} />
        ))}
        {financialItems.map(({ label, value }) => (
          <InputCard key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  )
}
