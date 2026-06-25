interface Props {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export function NavButton({ onClick, disabled, children, variant = 'primary', className = '' }: Props) {
  const primary = variant === 'primary'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`wizard-nav-footer w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={
        primary
          ? { background: 'var(--btn-bg)', color: 'var(--btn-text)' }
          : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
      }
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = primary ? 'var(--btn-bg-hover)' : 'var(--bg-surface)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = primary ? 'var(--btn-bg)' : 'var(--bg-elevated)'
      }}
    >
      {children}
    </button>
  )
}
