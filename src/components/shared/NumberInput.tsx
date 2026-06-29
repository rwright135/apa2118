import { useRef, useState, useEffect, type ChangeEvent } from 'react'

interface Props {
  value: number | undefined
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  placeholder?: string
  step?: number
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function parseDigits(raw: string): number {
  const digits = raw.replace(/\D/g, '')
  if (digits === '') return 0
  return Number(digits)
}

function clamp(n: number, min?: number, max?: number): number {
  let result = n
  if (min !== undefined) result = Math.max(result, min)
  if (max !== undefined) result = Math.min(result, max)
  return result
}

export function NumberInput({ value, onChange, prefix, suffix, min, max, placeholder, step = 1 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isFocused = useRef(false)

  // Internal display string — decoupled from the numeric value while focused
  // so that clearing the field doesn't immediately restore "0"
  const [displayStr, setDisplayStr] = useState(() =>
    value !== undefined ? formatNumber(value) : ''
  )

  // Sync external value changes into the display only when not focused
  useEffect(() => {
    if (!isFocused.current) {
      setDisplayStr(value !== undefined ? formatNumber(value) : '')
    }
  }, [value])

  const handleFocus = () => {
    isFocused.current = true
    // When the displayed value is "0" treat it like an empty field so the
    // user can start typing immediately without having to backspace first.
    if (!value) {
      setDisplayStr('')
    }
  }

  const handleBlur = () => {
    isFocused.current = false
    // Restore the committed value (even if display was temporarily empty)
    setDisplayStr(value !== undefined ? formatNumber(value) : '')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const raw = input.value
    const cursorFromEnd = raw.length - (input.selectionStart ?? raw.length)
    const isEmpty = raw.replace(/\D/g, '') === ''

    if (isEmpty) {
      // Let the field be visually empty while typing — don't force "0" back
      setDisplayStr('')
      return
    }

    const num = clamp(parseDigits(raw), min, max)
    const formatted = formatNumber(num)
    setDisplayStr(formatted)
    onChange(num)

    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      const newPos = Math.max(0, formatted.length - cursorFromEnd)
      el.setSelectionRange(newPos, newPos)
    })
  }

  return (
    <div
      className="flex w-full min-w-0 items-center rounded-xl overflow-hidden transition-colors border-2"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}
      onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)')}
      onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
    >
      {prefix && (
        <span
          className="shrink-0 px-4 py-4 text-lg font-medium border-r"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          {prefix}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode={step % 1 === 0 ? 'numeric' : 'decimal'}
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={displayStr}
        placeholder={placeholder ?? '0'}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        className="wizard-text-input min-w-0 w-full flex-1 bg-transparent px-4 py-4 text-lg font-semibold outline-none placeholder:opacity-30"
        style={{ color: 'var(--text-base)' }}
      />
      {suffix && (
        <span
          className="shrink-0 px-4 py-4 text-base font-medium border-l"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}
