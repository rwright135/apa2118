import { useStore } from '../../state/store'
import { WizardLayout } from '../shared/WizardLayout'
import { NavButton } from '../shared/NavButton'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

const CURRENT_YEAR = new Date().getFullYear()
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

        {/* ── Year grid ── */}
        <div>
          <div className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>
            Year of birth
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: MAX_YEAR - 1960 + 1 }, (_, i) => 1960 + i).map(yr => (
              <button
                key={yr}
                onClick={() => setYear(yr)}
                className="py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                style={
                  selectedYear === yr
                    ? { background: 'var(--btn-bg)', color: 'var(--btn-text)', outline: '2px solid var(--gold)', outlineOffset: '2px' }
                    : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
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
              <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Years until Mandatory Retirement (Age 65)</div>
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
