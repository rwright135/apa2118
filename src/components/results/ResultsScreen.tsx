// useState no longer needed here — moved to ShareSheet
import { useEffect, useState } from 'react'
import { useStore } from '../../state/store'
import { BaselineInputCards } from './BaselineInputCards'
import { UserRiskRewardCard, IndustryBenchmarkCards } from './HeroCards'
import { BettingOddsCard } from './BettingOddsCard'
import { CumulativeLineChart } from './CumulativeLineChart'
import { TransparentTable } from './TransparentTable'
import { ShareSheet } from './ShareSheet'


function RecalculateOverlay() {
  const [colorProgress, setColorProgress] = useState(0)

  useEffect(() => {
    const DURATION = 2600
    const startTime = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / DURATION, 1)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setColorProgress(eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const saturation = Math.round(colorProgress * 100)
  const brightness = 0.6 + colorProgress * 0.4

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'color-mix(in srgb, var(--bg-base) 80%, transparent)',
      }}
    >
      <div className="relative flex items-center justify-center">
        <div
          className="absolute rounded-full"
          style={{
            width: 148,
            height: 148,
            background: `radial-gradient(circle, rgba(201,168,76,${colorProgress * 0.35}) 0%, transparent 70%)`,
          }}
        />
        <img
          src="/APA Teamsters Local 2118 Logo.webp"
          alt="APA Teamsters Local 2118"
          style={{
            width: 120,
            height: 120,
            objectFit: 'contain',
            filter: `saturate(${saturation}%) brightness(${brightness.toFixed(2)})`,
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>
      <div className="text-center space-y-2">
        <div className="text-lg font-semibold" style={{ color: 'var(--text-base)' }}>
          Recalculating…
        </div>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ width: 200, height: 3, background: 'var(--bg-elevated)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${colorProgress * 100}%`,
            background: `rgba(201,168,76,${0.4 + colorProgress * 0.6})`,
            transition: 'none',
          }}
        />
      </div>
    </div>
  )
}

export function ResultsScreen() {
  const { results, goToStep, isRecalculating } = useStore()

  if (!results || results.length === 0) return null

  return (
    <div
      id="results-container"
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      {isRecalculating && <RecalculateOverlay />}
      {/* Sticky header — id used by ShareSheet to hide during image capture */}
      <div
        id="results-toolbar"
        className="sticky top-0 z-10 backdrop-blur border-b px-4 py-3"
        style={{
          background: 'color-mix(in srgb, var(--bg-base) 94%, transparent)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => goToStep('advanced')}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-base)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 4L6 8l4 4"/>
            </svg>
            Edit Inputs
          </button>

          <div className="flex items-center gap-1">
            <img
              src="/APA Teamsters Local 2118 Logo.webp"
              alt=""
              className="w-6 h-6 object-contain opacity-80"
              onError={(e) => { e.currentTarget.src = '/teamsters-logo.svg'; e.currentTarget.onerror = null }}
            />
            <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>APA2118</span>
          </div>

          <div className="flex items-center gap-2">
            <ShareSheet />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <BaselineInputCards inputs={results[0].inputs} />

        <div className="space-y-4">
          <UserRiskRewardCard results={results} />
          <BettingOddsCard results={results} />
          <IndustryBenchmarkCards results={results} />
        </div>

        <div
          id="results-export-end"
          className="rounded-2xl p-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Cumulative Cash Flow Over Time
          </h2>
          <CumulativeLineChart results={results} />
        </div>

        <TransparentTable results={results} />
      </div>
    </div>
  )
}
