import { useRef, type ChangeEvent } from 'react'

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

export function NumberInput({ value, onChange, prefix, suffix, min, max, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const cursorFromEnd = input.value.length - (input.selectionStart ?? input.value.length)

    const num = clamp(parseDigits(input.value), min, max)
    onChange(num)

    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      const formatted = num ? formatNumber(num) : ''
      const newPos = Math.max(0, formatted.length - cursorFromEnd)
      el.setSelectionRange(newPos, newPos)
    })
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
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value ? formatNumber(value) : ''}
        placeholder={placeholder ?? '0'}
        onChange={handleChange}
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
