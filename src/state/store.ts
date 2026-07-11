import { create } from 'zustand'
import { buildAllScenarios } from '../lib/scenarios'
import type { UserInputs, ComparisonResult } from '../lib/types'
import { saveToLocalStorage, clearAllStoredData, loadFromLocalStorage, decodeFromURL } from './persistence'
import {
  AVERAGE_ARRIVAL_MONTHS_ROUNDED,
  AVERAGE_ECONOMIC_INCREASE_PERCENT,
} from '../data/airlineSecondOfferHistory'
import {
  AVERAGE_JCBA_MONTHS_ROUNDED,
} from '../data/jcbaMergerHistory'

export type WizardStep =
  | 'welcome'
  | 'seat'
  | 'upgrade'
  | 'longevity'
  | 'anniversary'
  | 'dob'
  | 'lineType'
  | 'extraHours'
  | 'profitSharing'
  | 'investmentRate'
  | 'scenariosIntro'
  | 'voteNo'
  | 'retention'
  | 'payRaise'
  | 'advanced'
  | 'results'

export const WIZARD_STEPS: WizardStep[] = [
  'welcome',
  'seat',
  'upgrade',
  'longevity',
  'anniversary',
  'dob',
  'lineType',
  'extraHours',
  'profitSharing',
  'investmentRate',
  'scenariosIntro',
  'retention',
  'voteNo',
  'payRaise',
  'advanced',
  'results',
]

export const DEFAULT_VOTE_NO_SCENARIO = {
  probability: 0.50,
  arrivalMonths: AVERAGE_ARRIVAL_MONTHS_ROUNDED,
  percentAboveTA: AVERAGE_ECONOMIC_INCREASE_PERCENT / 100,
  jcbaDurationMonths: AVERAGE_JCBA_MONTHS_ROUNDED,
}

export const AVERAGE_SCENARIO = {
  probability: 0.50,
  arrivalMonths: AVERAGE_ARRIVAL_MONTHS_ROUNDED,
  percentAboveTA: AVERAGE_ECONOMIC_INCREASE_PERCENT / 100,
  jcbaDurationMonths: AVERAGE_JCBA_MONTHS_ROUNDED,
}

export const WORST_CASE_SCENARIO = {
  probability: 0.25,
  arrivalMonths: 18,
  percentAboveTA: 0.10,
  jcbaDurationMonths: 65,
}

export const DEFAULT_INPUTS: Partial<UserInputs> = {
  lineType: 'FLYING',
  investmentRate: 0.08,
  brokerageSavingsPct: 0.33,
  retentionPayoutProbabilityB: 0.90,
  retentionPayoutProbabilityC: 0.50,
  voteNoScenarios: [{ ...DEFAULT_VOTE_NO_SCENARIO }],
  advancedPostJCBA: { scenarioCPenalty: 0.15 },
}

/** Apply the same coercions and legacy migrations used by setInputs so we can
 *  safely apply them during synchronous store initialization. */
function sanitizeInputs(raw: Partial<UserInputs>): Partial<UserInputs> {
  const s = { ...raw }

  // Coerce date strings to Date objects
  if (s.dateOfBirth && !(s.dateOfBirth instanceof Date)) {
    const d = new Date(s.dateOfBirth as unknown as string)
    s.dateOfBirth = isNaN(d.getTime()) ? undefined : d
  }

  // Migrate legacy advancedPostJCBA format
  if (s.advancedPostJCBA && 'enabled' in (s.advancedPostJCBA as object)) {
    s.advancedPostJCBA = { scenarioCPenalty: 0.15 }
  }

  // Migrate legacy voteNoOffer + jcbaDurationMonths fields
  if (!s.voteNoScenarios) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacy = s as any
    if (legacy.voteNoOffer) {
      s.voteNoScenarios = [{
        probability: legacy.voteNoOffer.probability ?? DEFAULT_VOTE_NO_SCENARIO.probability,
        arrivalMonths: legacy.voteNoOffer.arrivalMonths ?? DEFAULT_VOTE_NO_SCENARIO.arrivalMonths,
        percentAboveTA: legacy.voteNoOffer.percentAboveTA ?? DEFAULT_VOTE_NO_SCENARIO.percentAboveTA,
        jcbaDurationMonths: legacy.jcbaDurationMonths ?? DEFAULT_VOTE_NO_SCENARIO.jcbaDurationMonths,
      }]
      delete legacy.voteNoOffer
      delete legacy.jcbaDurationMonths
    }
  }

  return s
}

/** Load and merge saved inputs synchronously so the very first render already
 *  has the correct state. This prevents the double-render flash caused by
 *  calling setInputs() in a useEffect after the initial paint. */
function loadInitialInputs(): Partial<UserInputs> {
  try {
    const fromURL = decodeFromURL()
    if (fromURL) return { ...DEFAULT_INPUTS, ...sanitizeInputs(fromURL) }
    const fromStorage = loadFromLocalStorage()
    if (fromStorage) return { ...DEFAULT_INPUTS, ...sanitizeInputs(fromStorage) }
  } catch {
    // Fall through to defaults on any error
  }
  return { ...DEFAULT_INPUTS }
}

const INITIAL_INPUTS = loadInitialInputs()

interface AppState {
  currentStep: WizardStep
  inputs: Partial<UserInputs>
  results: ComparisonResult[] | null
  isComputing: boolean

  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: WizardStep) => void
  setInput: <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => void
  setInputs: (partial: Partial<UserInputs>) => void
  compute: () => void
  recalculate: () => void
  reset: () => void
}

export const useStore = create<AppState>((set, get) => ({
  currentStep: 'welcome',
  inputs: { ...INITIAL_INPUTS },
  results: null,
  isComputing: false,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get()
    const idx = WIZARD_STEPS.indexOf(currentStep)
    if (idx < WIZARD_STEPS.length - 1) {
      set({ currentStep: WIZARD_STEPS[idx + 1] })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    const idx = WIZARD_STEPS.indexOf(currentStep)
    if (idx > 0) {
      set({ currentStep: WIZARD_STEPS[idx - 1] })
    }
  },

  goToStep: (step) => set({ currentStep: step }),

  setInput: (key, value) => {
    set((state) => {
      const newInputs = { ...state.inputs, [key]: value }
      saveToLocalStorage(newInputs)
      return { inputs: newInputs }
    })
  },

  setInputs: (partial) => {
    set((state) => {
      // Ensure any Date-typed fields that arrive as strings (e.g. from old
      // localStorage sessions or URL params) are coerced back to real Dates.
      const sanitized = { ...partial }
      if (sanitized.dateOfBirth && !(sanitized.dateOfBirth instanceof Date)) {
        const d = new Date(sanitized.dateOfBirth as unknown as string)
        sanitized.dateOfBirth = isNaN(d.getTime()) ? undefined : d
      }
      // Migrate legacy advancedPostJCBA format (old: { enabled, scenarioA, scenarioB, scenarioC })
      if (sanitized.advancedPostJCBA && 'enabled' in (sanitized.advancedPostJCBA as object)) {
        sanitized.advancedPostJCBA = { scenarioCPenalty: 0.15 }
      }

      // Migrate legacy localStorage: if old voteNoOffer + jcbaDurationMonths exist, convert
      if (!sanitized.voteNoScenarios) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const legacy = sanitized as any
        if (legacy.voteNoOffer) {
          sanitized.voteNoScenarios = [{
            probability: legacy.voteNoOffer.probability ?? DEFAULT_VOTE_NO_SCENARIO.probability,
            arrivalMonths: legacy.voteNoOffer.arrivalMonths ?? DEFAULT_VOTE_NO_SCENARIO.arrivalMonths,
            percentAboveTA: legacy.voteNoOffer.percentAboveTA ?? DEFAULT_VOTE_NO_SCENARIO.percentAboveTA,
            jcbaDurationMonths: legacy.jcbaDurationMonths ?? DEFAULT_VOTE_NO_SCENARIO.jcbaDurationMonths,
          }]
          delete legacy.voteNoOffer
          delete legacy.jcbaDurationMonths
        }
      }
      const newInputs = { ...state.inputs, ...sanitized }
      saveToLocalStorage(newInputs)
      return { inputs: newInputs }
    })
  },

  compute: () => {
    const { inputs } = get()
    if (
      !inputs.seat ||
      !inputs.longevityAsOfJul2026 ||
      inputs.anniversaryMonth === undefined ||
      !inputs.lineType ||
      !inputs.dateOfBirth ||
      inputs.investmentRate === undefined
    ) {
      console.error('Missing required inputs')
      return
    }
    set({ isComputing: true })
    const start = Date.now()
    setTimeout(() => {
      try {
        const fullInputs = inputs as UserInputs
        const userScenario = (fullInputs.voteNoScenarios ?? [])[0] ?? { ...DEFAULT_VOTE_NO_SCENARIO }
        const multiResults = [
          buildAllScenarios(fullInputs, userScenario),
          buildAllScenarios(fullInputs, AVERAGE_SCENARIO),
          buildAllScenarios(fullInputs, WORST_CASE_SCENARIO),
        ]
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 3000 - elapsed)
        setTimeout(() => {
          set({ results: multiResults, isComputing: false, currentStep: 'results' })
        }, remaining)
      } catch (e) {
        console.error('Computation error', e)
        set({ isComputing: false })
      }
    }, 50)
  },

  recalculate: () => {
    const { inputs } = get()
    if (
      !inputs.seat ||
      !inputs.longevityAsOfJul2026 ||
      inputs.anniversaryMonth === undefined ||
      !inputs.lineType ||
      !inputs.dateOfBirth ||
      inputs.investmentRate === undefined
    ) return
    try {
      const fullInputs = inputs as UserInputs
      const userScenario = (fullInputs.voteNoScenarios ?? [])[0] ?? { ...DEFAULT_VOTE_NO_SCENARIO }
      const multiResults = [
        buildAllScenarios(fullInputs, userScenario),
        buildAllScenarios(fullInputs, AVERAGE_SCENARIO),
        buildAllScenarios(fullInputs, WORST_CASE_SCENARIO),
      ]
      set({ results: multiResults })
    } catch (e) {
      console.error('Recalculation error', e)
    }
  },

  reset: () => {
    clearAllStoredData()
    set({
      currentStep: 'welcome',
      inputs: { ...DEFAULT_INPUTS },
      results: null,
      isComputing: false,
    })
  },
}))
