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
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <div className={`text-2xl ${selected ? 'text-blue-400' : 'text-gray-400'}`}>{icon}</div>}
        <div>
          <div className={`font-semibold ${selected ? 'text-white' : 'text-gray-200'}`}>{title}</div>
          {description && <div className="text-sm text-gray-400 mt-0.5">{description}</div>}
        </div>
        {selected && (
          <div className="ml-auto text-blue-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}
