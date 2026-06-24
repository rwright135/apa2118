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
      onBack={prevStep}
    >
      <div className="mb-8 space-y-6">

        {/* ── Year slider ── */}
        <div>
          <div className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>
            Year of birth
          </div>
          <div
            className="rounded-xl px-6 py-5 flex flex-col items-center gap-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="text-5xl font-black tabular-nums" style={{ color: 'var(--gold)' }}>
              {selectedYear}
            </div>
            <input
              type="range"
              min={1960}
              max={MAX_YEAR}
              value={selectedYear}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            <div className="flex justify-between w-full text-xs" style={{ color: 'var(--text-faint)' }}>
              <span>1960</span>
              <span style={{ color: 'var(--text-muted)' }}>age {CURRENT_YEAR - selectedYear} in {CURRENT_YEAR}</span>
              <span>{MAX_YEAR}</span>
            </div>
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
