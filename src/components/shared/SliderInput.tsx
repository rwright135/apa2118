interface Props {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  formatValue?: (v: number) => string
  label?: string
  showMinMax?: boolean
  accentColor?: string
}

export function SliderInput({ value, min, max, step, onChange, formatValue, label, showMinMax, accentColor }: Props) {
  const fmt = formatValue ?? ((v: number) => v.toString())
  const accent = accentColor ?? 'var(--gold)'
  return (
    <div className="space-y-3">
      {label && (
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
      )}
      <div className="text-center">
        <span className="text-4xl font-bold" style={{ color: accent }}>
          {fmt(value)}
        </span>
      </div>
      <input
        type="range"
        tabIndex={-1}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: 'var(--bg-elevated)', accentColor: accent }}
      />
      {showMinMax && (
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
          <span>{fmt(min)}</span>
          <span>{fmt(max)}</span>
        </div>
      )}
    </div>
  )
}
