import { useState } from 'react'
import { useStore } from '../../state/store'
import { HeroCards } from './HeroCards'
import { ScenarioBreakdown } from './ScenarioBreakdown'
import { ComparisonBarChart } from './ComparisonBarChart'
import { CumulativeLineChart } from './CumulativeLineChart'
import { TransparentTable } from './TransparentTable'
import { ExportButton } from './ExportButton'
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
    <div id="results-container" className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => goToStep('review')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 4L6 8l4 4"/>
            </svg>
            Edit Inputs
          </button>

          <div className="text-sm font-semibold text-white">APA2118 Results</div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              {copiedURL ? '✓ Copied!' : 'Share'}
            </button>
            <ExportButton />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* View toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('today')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'today'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Today's Dollars
          </button>
          <button
            onClick={() => setViewMode('age65')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'age65'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Value at Age 65
          </button>
        </div>

        {/* Hero comparison */}
        <HeroCards results={results} viewMode={viewMode} />

        {/* Bar chart */}
        <div className="bg-[#1a2235] rounded-2xl p-4 border border-white/5">
          <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Present Value Comparison</h2>
          <ComparisonBarChart results={results} viewMode={viewMode} />
        </div>

        {/* Four-line breakdown per scenario */}
        <ScenarioBreakdown results={results} viewMode={viewMode} />

        {/* Cumulative line chart */}
        <div className="bg-[#1a2235] rounded-2xl p-4 border border-white/5">
          <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Cumulative Discounted Cash Flow</h2>
          <CumulativeLineChart results={results} />
        </div>

        {/* Transparent table */}
        <TransparentTable results={results} />
      </div>
    </div>
  )
}
