import { useStore } from '../../state/store'

export function ResultsPlaceholder() {
  const { results, goToStep } = useStore()

  if (!results) return null

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-xs text-blue-400 font-medium mb-3">
            Results Ready
          </div>
          <h1 className="text-2xl font-bold">Your Contract Comparison</h1>
          <p className="text-gray-400 text-sm mt-2">Full results UI coming in the next build phase.</p>
        </div>

        <div className="space-y-4">
          {results.scenarios.map(s => (
            <div key={s.scenarioId} className="bg-[#1a2235] rounded-2xl p-4 border border-white/5">
              <div className="font-semibold text-white mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-blue-400">
                ${Math.round(s.presentValueTotal).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Present Value</div>
              <div className="mt-2 text-sm text-gray-400">
                401(k) at 65: <span className="text-green-400">${Math.round(s.retirementBalanceAt65).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => goToStep('review')}
          className="mt-6 w-full py-3 bg-white/10 rounded-xl text-gray-300 font-medium hover:bg-white/15 transition-colors"
        >
          ← Edit Inputs
        </button>
      </div>
    </div>
  )
}
