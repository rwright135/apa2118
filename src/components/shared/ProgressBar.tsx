interface Props { currentStep: number; totalSteps: number }
export function ProgressBar({ currentStep, totalSteps }: Props) {
  const pct = Math.round((currentStep / totalSteps) * 100)
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
