import type { UserInputs } from '../../lib/types'
import { getFinancialInputItems, getProfileInputItems } from '../../lib/inputDisplay'
import { EpauletCA, EpauletFO } from '../shared/EpauletIcon'

interface Props {
  inputs: UserInputs
}

interface InputCardItem {
  label: string
  value: string
  icon?: React.ReactNode
}

function InputCard({ label, value, icon }: InputCardItem) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: 'var(--bg-elevated)' }}
    >
      <div className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-base)' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

function InputCardGroup({ title, items }: { title: string; items: InputCardItem[] }) {
  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(({ label, value, icon }) => (
          <InputCard key={label} label={label} value={value} icon={icon} />
        ))}
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

  const profileItems: InputCardItem[] = getProfileInputItems(inputs).map((item) => {
    if (item.label !== 'Seat') return item
    const icon = inputs.seat === 'FO'
      ? <EpauletFO {...epauletProps} />
      : inputs.seat === 'CA'
        ? <EpauletCA {...epauletProps} />
        : undefined
    return { ...item, icon }
  })
  const financialItems = getFinancialInputItems(inputs)

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Your Baseline Inputs
      </h2>
      <InputCardGroup title="Your Profile" items={profileItems} />
      <InputCardGroup title="Financial Assumptions" items={financialItems} />
    </div>
  )
}
