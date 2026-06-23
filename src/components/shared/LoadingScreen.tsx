export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6 animate-pulse">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <path d="M8 30L20 8l12 22H8z" stroke="#3b82f6" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="text-lg font-semibold text-white mb-2">Calculating your results...</div>
      <div className="text-sm text-gray-400">Running month-by-month DCF analysis to age 65</div>
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
