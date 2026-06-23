import { useState } from 'react'
import { useStore } from '../../state/store'
import { HeroCards } from './HeroCards'
import { ScenarioBreakdown } from './ScenarioBreakdown'
import { ComparisonBarChart } from './ComparisonBarChart'
import { CumulativeLineChart } from './CumulativeLineChart'
import { TransparentTable } from './TransparentTable'
import { ExportButton } from './ExportButton'
import { ThemeToggle } from '../shared/ThemeToggle'
import { encodeToURL } from '../../state/persistence'

export function ResultsScreen() {
  const { results, goToStep, inputs } = useStore()
  const [viewMode, setViewMode] = useState<'today' | 'age65'>('today')
  const [copiedURL, setCopiedURL] = useState(false)

  if (!results) return null

  const handleShare = () => {
    const url = encodeToURL(inputs)
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedURL(true)
      setTimeout(() => setCopiedURL(false), 2000)
    })
  }

  return (
    <div
      id="results-container"
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 backdrop-blur border-b px-4 py-3"
        style={{
          background: 'color-mix(in srgb, var(--bg-base) 94%, transparent)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => goToStep('review')}
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
              src="/teamsters-logo.png"
              alt=""
              className="w-6 h-6 object-contain opacity-80"
              onError={(e) => { e.currentTarget.src = '/teamsters-logo.svg'; e.currentTarget.onerror = null }}
            />
            <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
              APA2118
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: copiedURL ? 'var(--positive)' : 'var(--accent)',
                background: 'var(--chip-bg)',
                border: '1px solid var(--chip-border)',
              }}
            >
              {copiedURL ? '✓ Copied!' : 'Share'}
            </button>
            <ExportButton />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* View toggle */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {(['today', 'age65'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={
                viewMode === mode
                  ? { background: 'var(--btn-bg)', color: 'var(--btn-text)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {mode === 'today' ? "Today's Dollars" : 'Value at Age 65'}
            </button>
          ))}
        </div>

        <HeroCards results={results} viewMode={viewMode} />

        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="font-semibold mb-4 text-sm uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Present Value Comparison
          </h2>
          <ComparisonBarChart results={results} viewMode={viewMode} />
        </div>

        <ScenarioBreakdown results={results} viewMode={viewMode} />

        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="font-semibold mb-4 text-sm uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Cumulative Discounted Cash Flow
          </h2>
          <CumulativeLineChart results={results} />
        </div>

        <TransparentTable results={results} />
      </div>
    </div>
  )
}
