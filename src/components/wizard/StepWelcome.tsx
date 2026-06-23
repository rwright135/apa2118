import { useStore } from '../../state/store'

export function StepWelcome() {
  const { nextStep } = useStore()

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-8">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 30L20 8l12 22H8z" stroke="#3b82f6" strokeWidth="2" fill="none"/>
            <path d="M12 26h16M20 8v4" stroke="#3b82f6" strokeWidth="1.5"/>
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-xs text-blue-400 font-medium mb-4">
          APA LOCAL 2118
        </div>

        <h1 className="text-3xl font-bold mb-4 leading-tight">
          Contract Comparison<br />Calculator
        </h1>

        <p className="text-gray-400 text-base leading-relaxed max-w-sm mb-6">
          Make an informed decision on the Tentative Agreement.
          We'll walk you through a few questions and show you exactly
          what each path means for <span className="text-white font-medium">your</span> career and retirement.
        </p>

        <div className="space-y-2 text-sm text-gray-500 mb-10">
          <div className="flex items-center gap-2 justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span>~3 minutes to complete</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span>Personalized to your seat &amp; longevity</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span>Month-by-month transparent breakdown</span>
          </div>
        </div>

        <button
          onClick={nextStep}
          className="w-full max-w-sm py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl font-bold text-lg transition-all duration-200"
        >
          Get Started
        </button>

        <p className="text-xs text-gray-600 mt-4">
          Your data stays on your device and is never sent to a server.
        </p>
      </div>
    </div>
  )
}
