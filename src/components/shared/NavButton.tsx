interface Props {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}
export function NavButton({ onClick, disabled, children, variant = 'primary', className = '' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
        variant === 'primary'
          ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
          : 'bg-white/10 hover:bg-white/15 active:bg-white/5 text-gray-300'
      } ${className}`}
    >
      {children}
    </button>
  )
}
