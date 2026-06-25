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

function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '' || trimmed === '-') return 0
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function NumberInput({ value, onChange, prefix, suffix, min, max, placeholder, step = 1 }: Props) {
  const clamp = (n: number) => {
    let next = n
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    return next
  }

  const handleChange = (raw: string) => {
    const parsed = parseNumericInput(raw)
    if (parsed === null) return
    onChange(clamp(parsed))
  }

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
        type="text"
        inputMode={step % 1 === 0 ? 'numeric' : 'decimal'}
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value || ''}
        placeholder={placeholder ?? '0'}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        className="wizard-text-input flex-1 bg-transparent px-4 py-4 text-lg font-semibold outline-none placeholder:opacity-30"
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
