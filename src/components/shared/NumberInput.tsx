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
    <div className="flex items-center bg-white/5 border-2 border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
      {prefix && <span className="px-4 py-4 text-gray-400 text-lg font-medium border-r border-white/10">{prefix}</span>}
      <input
        type="number"
        value={value || ''}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder ?? '0'}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 bg-transparent px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-gray-600"
      />
      {suffix && <span className="px-4 py-4 text-gray-400 text-lg font-medium border-l border-white/10">{suffix}</span>}
    </div>
  )
}
