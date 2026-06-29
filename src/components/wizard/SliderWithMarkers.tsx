/**
 * Generic slider with logo markers that cluster when they'd overlap.
 * Clusters expand on hover/click to show all entries.
 */
import { useEffect, useRef, useState } from 'react'

export interface MarkerRecord {
  id: string
  months: number
  logoSrcs: string[]
  label: string
  tooltipContent: React.ReactNode
}

interface Props {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  formatValue: (v: number) => string
  markers: MarkerRecord[]
  footnote?: string
}

const CHIP = 32          // px — square chip side
const GAP  = 4           // min px between chip edges
const ROW_H = CHIP + 6   // row height including spacing

function monthToPct(months: number, min: number, max: number) {
  return ((months - min) / (max - min)) * 100
}

/** Build pixel-aware clusters from a flat list of markers. */
function buildClusters(
  markers: MarkerRecord[],
  min: number,
  max: number,
  sliderPx: number,
): { members: MarkerRecord[]; avgMonths: number }[] {
  if (sliderPx === 0) return markers.map((m) => ({ members: [m], avgMonths: m.months }))

  const toPixels = (mo: number) => ((mo - min) / (max - min)) * sliderPx
  const sorted = [...markers].sort((a, b) => a.months - b.months)

  const clusters: { members: MarkerRecord[]; avgMonths: number }[] = []

  for (const marker of sorted) {
    const px = toPixels(marker.months)
    const last = clusters[clusters.length - 1]
    const lastCenter = last ? toPixels(last.avgMonths) : -Infinity
    const lastHalfWidth = last ? (last.members.length * CHIP + (last.members.length - 1) * 2) / 2 : 0
    const thisHalfWidth = CHIP / 2

    if (last && px - (lastCenter + lastHalfWidth) < thisHalfWidth + GAP) {
      last.members.push(marker)
      last.avgMonths =
        last.members.reduce((s, m) => s + m.months, 0) / last.members.length
    } else {
      clusters.push({ members: [marker], avgMonths: marker.months })
    }
  }

  return clusters
}

function ClusterTooltip({
  cluster,
  onClose,
}: {
  cluster: { members: MarkerRecord[] }
  onClose: () => void
}) {
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-xl shadow-lg z-30"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        width: cluster.members.length === 1 ? '15rem' : '18rem',
      }}
      role="tooltip"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs z-10"
        style={{ color: 'var(--text-faint)', background: 'var(--bg-elevated)' }}
        aria-label="Close"
      >
        ×
      </button>

      {cluster.members.length === 1 ? (
        <div className="p-3 pr-6">{cluster.members[0].tooltipContent}</div>
      ) : (
        <div>
          {cluster.members.map((m, i) => (
            <div
              key={m.id}
              className="p-3 pr-6"
              style={
                i < cluster.members.length - 1
                  ? { borderBottom: '1px solid var(--border-subtle)' }
                  : undefined
              }
            >
              {m.tooltipContent}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ClusterChip({
  cluster,
  min,
  max,
  isActive,
  onSelect,
}: {
  cluster: { members: MarkerRecord[]; avgMonths: number }
  min: number
  max: number
  isActive: boolean
  onSelect: (id: string | null) => void
}) {
  const multi = cluster.members.length > 1
  const chipW = multi ? cluster.members.length * (CHIP - 4) + (cluster.members.length - 1) * 2 + 8 : CHIP
  const left = monthToPct(cluster.avgMonths, min, max)
  const clusterId = cluster.members.map((m) => m.id).join('+')

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ left: `${left}%`, top: `${CHIP / 2 + 4}px`, transform: 'translateX(-50%)' }}
    >
      <div className="relative pointer-events-auto">
        {isActive && (
          <ClusterTooltip cluster={cluster} onClose={() => onSelect(null)} />
        )}
        <button
          type="button"
          onClick={() => onSelect(isActive ? null : clusterId)}
          onMouseEnter={() => onSelect(clusterId)}
          className="flex items-center justify-center gap-0.5 rounded-lg transition-all hover:scale-105 focus:outline-none"
          style={{
            width: `${chipW}px`,
            height: `${CHIP}px`,
            background: '#ffffff',
            border: isActive ? '2px solid var(--gold)' : '1px solid rgba(0,0,0,0.14)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            padding: '3px',
          }}
          aria-label={cluster.members.map((m) => m.label).join(' & ')}
          aria-expanded={isActive}
        >
          {cluster.members.map((m) => (
            <img
              key={m.id}
              src={m.logoSrcs[0]}
              alt=""
              style={{
                height: '100%',
                width: multi ? `${CHIP - 8}px` : '100%',
                objectFit: 'contain',
                flexShrink: 0,
              }}
              draggable={false}
            />
          ))}
          {multi && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: 'var(--gold)', color: '#000' }}
            >
              {cluster.members.length}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export function SliderWithMarkers({
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  markers,
  footnote,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderWidth, setSliderWidth] = useState(0)
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSliderWidth(el.offsetWidth))
    ro.observe(el)
    setSliderWidth(el.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const clusters = buildClusters(markers, min, max, sliderWidth)

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>
          {formatValue(value)}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative"
        style={{ paddingBottom: `${CHIP + ROW_H}px` }}
        onMouseLeave={() => setActiveClusterId(null)}
      >
        <input
          type="range"
          tabIndex={-1}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: 'var(--bg-elevated)', accentColor: 'var(--gold)' }}
        />

        {clusters.map((cluster) => {
          const clusterId = cluster.members.map((m) => m.id).join('+')
          return (
            <ClusterChip
              key={clusterId}
              cluster={cluster}
              min={min}
              max={max}
              isActive={activeClusterId === clusterId}
              onSelect={setActiveClusterId}
            />
          )
        })}
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
      {footnote && (
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          {footnote}
        </p>
      )}
    </div>
  )
}
