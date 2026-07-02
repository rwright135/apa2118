import type { RetentionOutcomeId } from '../../lib/retentionOutcomes'
import { RETENTION_OUTCOME_COLORS, RETENTION_OUTCOME_TITLES } from '../../lib/retentionOutcomes'

interface Props {
  scenarioId: RetentionOutcomeId
  children: React.ReactNode
}

export function ScenarioColorCard({ scenarioId, children }: Props) {
  const color = RETENTION_OUTCOME_COLORS[scenarioId]

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${color}`, background: 'var(--bg-surface)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="font-bold text-sm" style={{ color }}>
          {RETENTION_OUTCOME_TITLES[scenarioId]}
        </span>
      </div>
      <div className="px-4 py-5">
        {children}
      </div>
    </div>
  )
}
