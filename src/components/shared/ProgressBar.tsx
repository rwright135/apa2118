interface Props { currentStep: number; totalSteps: number }

export function ProgressBar({ currentStep, totalSteps }: Props) {
  const pct = Math.round((Math.max(0, currentStep) / Math.max(1, totalSteps)) * 100)
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: 'var(--gold)' }}
      />
    </div>
  )
}
