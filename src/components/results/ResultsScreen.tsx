// useState no longer needed here — moved to ShareSheet
import { useStore } from '../../state/store'
import { BaselineInputCards } from './BaselineInputCards'
import { HeroCards } from './HeroCards'
import { ScenarioBreakdown } from './ScenarioBreakdown'
import { ComparisonBarChart } from './ComparisonBarChart'
import { CumulativeLineChart } from './CumulativeLineChart'
import { TransparentTable } from './TransparentTable'
import { ShareSheet } from './ShareSheet'
import { ThemeToggle } from '../shared/ThemeToggle'

export function ResultsScreen() {
  const { results, goToStep, inputs } = useStore()

  if (!results || results.length === 0) return null

  return (
    <div
      id="results-container"
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
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
              src="/APA Teamsters Local 2118 Logo.png"
              alt=""
              className="w-6 h-6 object-contain opacity-80"
              onError={(e) => { e.currentTarget.src = '/teamsters-logo.svg'; e.currentTarget.onerror = null }}
            />
            <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>APA2118</span>
          </div>

          <div className="flex items-center gap-2">
            <ShareSheet inputs={inputs} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <BaselineInputCards inputs={results[0].inputs} />
        <HeroCards results={results} />

        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Total Compensation Comparison
          </h2>
          <ComparisonBarChart results={results} />
        </div>

        <ScenarioBreakdown results={results} />

        <div
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
