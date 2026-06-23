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
      {label && <div className="text-gray-400 text-sm">{label}</div>}
      <div className="text-center">
        <span className="text-4xl font-bold text-blue-400">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer"
      />
      {showMinMax && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{fmt(min)}</span>
          <span>{fmt(max)}</span>
        </div>
      )}
    </div>
  )
}
