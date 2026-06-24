interface Props {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  formatValue?: (v: number) => string
  label?: string
  showMinMax?: boolean
}

export function SliderInput({ value, min, max, step, onChange, formatValue, label, showMinMax }: Props) {
  const fmt = formatValue ?? ((v: number) => v.toString())
  return (
    <div className="space-y-3">
      {label && (
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
      )}
      <div className="text-center">
        <span className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>
          {fmt(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: 'var(--bg-elevated)' }}
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
