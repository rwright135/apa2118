interface Props {
  value: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  placeholder?: string
  step?: number
}

export function NumberInput({ value, onChange, prefix, suffix, min, max, placeholder, step = 1 }: Props) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden transition-colors border-2"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}
      onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)')}
      onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
    >
      {prefix && (
        <span
          className="px-4 py-4 text-lg font-medium border-r"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value || ''}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder ?? '0'}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 bg-transparent px-4 py-4 text-lg font-semibold outline-none placeholder:opacity-30"
        style={{ color: 'var(--text-base)' }}
      />
      {suffix && (
        <span
          className="px-4 py-4 text-base font-medium border-l"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}
