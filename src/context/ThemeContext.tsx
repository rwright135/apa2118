import { createContext, useContext, useEffect, useState, useRef } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

const ANIMATION_DURATION = 420   // ms — must match @keyframes theme-breathe total
const CROSSOVER_POINT    = 0.42  // fraction — where opacity hits 0 (matches 42% keyframe)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem('apa2118-theme') as Theme) || 'light' } catch { return 'light' }
  })

  const isAnimating = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('apa2118-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => {
    if (isAnimating.current) return   // block double-tap during animation
    isAnimating.current = true

    const html = document.documentElement

    // Start the whole-page breathe animation
    html.classList.add('theme-transitioning')

    // Swap CSS variables exactly when opacity hits 0 — the change is invisible
    const crossoverMs = ANIMATION_DURATION * CROSSOVER_POINT
    const swapTimer = setTimeout(() => {
      setTheme(t => (t === 'dark' ? 'light' : 'dark'))
    }, crossoverMs)

    // Clean up after the animation finishes
    const cleanupTimer = setTimeout(() => {
      html.classList.remove('theme-transitioning')
      isAnimating.current = false
    }, ANIMATION_DURATION + 20)   // small buffer past animation end

    return () => { clearTimeout(swapTimer); clearTimeout(cleanupTimer) }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
