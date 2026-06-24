export function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-pulse"
        style={{ background: 'var(--chip-bg)', border: '2px solid var(--border)' }}
      >
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <path d="M8 30L20 8l12 22H8z" stroke="var(--gold)" strokeWidth="2" fill="none"/>
          <path d="M12 26h16M20 8v4" stroke="var(--gold)" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
        Calculating your results...
      </div>
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Running month-by-month DCF analysis to age 65
      </div>
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--gold)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
