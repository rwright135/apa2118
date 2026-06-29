/**
 * Generic slider with logo markers that cluster when they'd overlap.
 * Click a chip to open a centered modal with details.
 */
import { useEffect, useRef, useState } from 'react'

export interface MarkerRecord {
  id: string
  months: number
  logoSrcs: string[]
  label: string
  modalContent: React.ReactNode
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

const CHIP = 32
const GAP  = 4
const ROW_H = CHIP + 6
const TRACK_GAP = 16   // px clearance between slider thumb and first chip row

function monthToPct(months: number, min: number, max: number) {
  return ((months - min) / (max - min)) * 100
}

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

    if (last && px - (lastCenter + lastHalfWidth) < CHIP / 2 + GAP) {
      last.members.push(marker)
      last.avgMonths = last.members.reduce((s, m) => s + m.months, 0) / last.members.length
    } else {
      clusters.push({ members: [marker], avgMonths: marker.months })
    }
  }

  return clusters
}

function ClusterModal({
  cluster,
  onClose,
}: {
  cluster: { members: MarkerRecord[] }
  onClose: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            {cluster.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-center rounded overflow-hidden"
                style={{ width: 40, height: 28, background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                <img src={m.logoSrcs[0]} alt={m.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
              </div>
            ))}
            <span className="font-semibold text-sm" style={{ color: 'var(--text-base)' }}>
              {cluster.members.map((m) => m.label).join(' & ')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-base"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-auto">
          {cluster.members.map((m, i) => (
            <div
              key={m.id}
              className="px-5 py-4"
              style={i < cluster.members.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : undefined}
            >
              {m.modalContent}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClusterChip({
  cluster,
  min,
  max,
  isActive,
  onOpen,
}: {
  cluster: { members: MarkerRecord[]; avgMonths: number }
  min: number
  max: number
  isActive: boolean
  onOpen: (id: string) => void
}) {
  const multi = cluster.members.length > 1
  const chipW = multi ? cluster.members.length * (CHIP - 4) + (cluster.members.length - 1) * 2 + 8 : CHIP
  const left = monthToPct(cluster.avgMonths, min, max)
  const clusterId = cluster.members.map((m) => m.id).join('+')

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ left: `${left}%`, top: `${TRACK_GAP}px`, transform: 'translateX(-50%)' }}
    >
      <div className="pointer-events-auto">
        <button
          type="button"
          onClick={() => onOpen(clusterId)}
          className="flex items-center justify-center gap-0.5 rounded-lg transition-all hover:scale-110 hover:shadow-md focus:outline-none"
          style={{
            width: `${chipW}px`,
            height: `${CHIP}px`,
            background: '#ffffff',
            border: isActive ? '2px solid var(--gold)' : '1px solid rgba(0,0,0,0.14)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            padding: '3px',
          }}
          aria-label={`${cluster.members.map((m) => m.label).join(' & ')} — click for details`}
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
  const activeCluster = activeClusterId
    ? clusters.find((c) => c.members.map((m) => m.id).join('+') === activeClusterId) ?? null
    : null

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
        style={{ paddingBottom: `${TRACK_GAP + CHIP + ROW_H}px` }}
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
              onOpen={setActiveClusterId}
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

      {activeCluster && (
        <ClusterModal
          cluster={activeCluster}
          onClose={() => setActiveClusterId(null)}
        />
      )}
    </div>
  )
}
