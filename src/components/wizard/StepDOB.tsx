import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

const CURRENT_YEAR = new Date().getFullYear()
// Allegiant pilots: youngest ~21 (born 2005), mandatory retirement at 65 (born no earlier than 1961)
const MIN_YEAR = 1959
const MAX_YEAR = CURRENT_YEAR - 21
const DEFAULT_YEAR = 1985

export function StepDOB() {
  const { inputs, setInput, nextStep, prevStep } = useStore()

  // Parse existing DOB or use defaults
  // Guard: localStorage may deserialize dates as strings from a prior session
  const rawDob = inputs.dateOfBirth
  const dob = rawDob instanceof Date ? rawDob : undefined
  const selectedMonth = dob ? dob.getMonth() : -1          // 0-indexed, -1 = unset
  const selectedYear  = dob ? dob.getFullYear() : DEFAULT_YEAR

  const setMonth = (month: number) => {
    const year = selectedYear ?? DEFAULT_YEAR
    setInput('dateOfBirth', new Date(year, month, 1))
  }

  const setYear = (year: number) => {
    const month = selectedMonth >= 0 ? selectedMonth : 0
    setInput('dateOfBirth', new Date(year, month, 1))
  }

  const stepYear = (delta: number) => {
    const next = Math.min(MAX_YEAR, Math.max(MIN_YEAR, selectedYear + delta))
    setYear(next)
  }

  const yearsToRetirement = dob
    ? Math.max(0, 65 - (CURRENT_YEAR - dob.getFullYear()))
    : null

  const isComplete = selectedMonth >= 0

  return (
    <WizardLayout
      step="dob"
      title="When were you born?"
      subtitle="Select your birth month and year. We use this to calculate how long your cash flows run to mandatory retirement at age 65."
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">

        {/* ── Year stepper ── */}
        <div>
          <div className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>
            Year of birth
          </div>
          <div
            className="flex items-center justify-between rounded-xl px-4 py-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            {/* Decrement */}
            <button
              onClick={() => stepYear(-1)}
              className="w-11 h-11 flex items-center justify-center rounded-lg transition-all active:scale-90"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              aria-label="Previous year"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 4L6 9l5 5"/>
              </svg>
            </button>

            {/* Year display */}
            <div className="text-center">
              <div className="text-4xl font-black tabular-nums" style={{ color: 'var(--gold)' }}>
                {selectedYear}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                age {CURRENT_YEAR - selectedYear} in {CURRENT_YEAR}
              </div>
            </div>

            {/* Increment */}
            <button
              onClick={() => stepYear(1)}
              className="w-11 h-11 flex items-center justify-center rounded-lg transition-all active:scale-90"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              aria-label="Next year"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M7 4l5 5-5 5"/>
              </svg>
            </button>
          </div>

          {/* Year quick-jumps */}
          <div className="flex gap-2 mt-2">
            {[1970, 1975, 1980, 1985, 1990, 1995, 2000].map(yr => (
              <button
                key={yr}
                onClick={() => setYear(yr)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={
                  selectedYear === yr
                    ? { background: 'var(--sel-bg)', border: '1px solid var(--sel-border)', color: 'var(--gold)' }
                    : { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-faint)' }
                }
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* ── Month grid ── */}
        <div>
          <div className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>
            Birth month
          </div>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((m, idx) => (
              <button
                key={m}
                onClick={() => setMonth(idx)}
                className="py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                style={
                  selectedMonth === idx
                    ? { background: 'var(--btn-bg)', color: 'var(--btn-text)', outline: '2px solid var(--gold)', outlineOffset: '2px' }
                    : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── Retirement callout — only when both are set ── */}
        {isComplete && yearsToRetirement !== null && (
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: 'var(--chip-bg)', border: '1px solid var(--chip-border)' }}
          >
            <div>
              <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Years to mandatory retirement (age 65)</div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {MONTH_FULL[selectedMonth]} {selectedYear}
              </div>
            </div>
            <div className="text-3xl font-black" style={{ color: 'var(--gold)' }}>
              {yearsToRetirement}
              <span className="text-sm font-semibold ml-1" style={{ color: 'var(--text-faint)' }}>yrs</span>
            </div>
          </div>
        )}

      </div>
      <NavButton onClick={nextStep} disabled={!isComplete}>
        Continue
      </NavButton>
    </WizardLayout>
  )
}
