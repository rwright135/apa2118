interface Props {
  selected: boolean
  onClick: () => void
  icon?: React.ReactNode
  title: string
  description?: string
}

export function SelectCard({ selected, onClick, icon, title, description }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border-2 transition-all duration-200"
      style={{
        borderColor: selected ? 'var(--sel-border)' : 'var(--border)',
        background: selected ? 'var(--sel-bg)' : 'var(--bg-subtle)',
      }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-2xl shrink-0" style={{ color: selected ? 'var(--accent)' : 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold"
            style={{ color: 'var(--text-base)' }}
          >
            {title}
          </div>
          {description && (
            <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {description}
            </div>
          )}
        </div>
        {selected && (
          <div className="ml-auto shrink-0" style={{ color: 'var(--accent)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}
