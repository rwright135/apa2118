import type { UserInputs } from '../../lib/types'
import { getFinancialInputItems, getProfileInputItems } from '../../lib/inputDisplay'

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

function InputCardGroup({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(({ label, value }) => (
          <InputCard key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  )
}

export function BaselineInputCards({ inputs }: Props) {
  const profileItems = getProfileInputItems(inputs)
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
