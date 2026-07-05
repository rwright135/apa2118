import { useEffect, useState } from 'react'

const PHASES = [
  'Building month-by-month timeline…',
  'Applying pay scale projections…',
  'Discounting future cash flows…',
  'Comparing Vote Yes vs. Vote No scenarios…',
  'Finalizing results…',
]

export function LoadingScreen() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  // 0 → grayscale, 1 → full color
  const [colorProgress, setColorProgress] = useState(0)

  useEffect(() => {
    // Cycle through phase labels every ~550 ms so all 5 show across ~3 s
    const phaseTimer = setInterval(() => {
      setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1))
    }, 550)

    // Animate grayscale → color over 2.6 s using rAF
    const DURATION = 2600
    const startTime = performance.now()
    let raf: number

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / DURATION, 1)
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setColorProgress(eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      clearInterval(phaseTimer)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Interpolate between grayscale and full color using CSS filter
  const saturation = Math.round(colorProgress * 100)
  const brightness = 0.6 + colorProgress * 0.4  // 60% → 100%

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      {/* Logo with grayscale→color animation */}
      <div className="relative flex items-center justify-center">
        {/* Glow ring that intensifies as color comes in */}
        <div
          className="absolute rounded-full"
          style={{
            width: 148,
            height: 148,
            background: `radial-gradient(circle, rgba(201,168,76,${colorProgress * 0.35}) 0%, transparent 70%)`,
            transform: 'scale(1)',
            transition: 'none',
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

      {/* Text */}
      <div className="text-center space-y-2">
        <div className="text-lg font-semibold" style={{ color: 'var(--text-base)' }}>
          Calculating your results…
        </div>
        <div
          className="text-sm min-h-[1.25rem] transition-all duration-300"
          style={{ color: 'var(--text-muted)' }}
        >
          {PHASES[phaseIndex]}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="rounded-full overflow-hidden"
        style={{ width: 200, height: 3, background: 'var(--bg-elevated)' }}
      >
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${colorProgress * 100}%`,
            background: `rgba(201,168,76,${0.4 + colorProgress * 0.6})`,
          }}
        />
      </div>
    </div>
  )
}
