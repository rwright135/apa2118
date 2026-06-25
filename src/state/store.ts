import { create } from 'zustand'
import { buildAllScenarios } from '../lib/scenarios'
import type { UserInputs, ComparisonResult } from '../lib/types'
import { saveToLocalStorage } from './persistence'

export type WizardStep =
  | 'welcome'
  | 'seat'
  | 'longevity'
  | 'anniversary'
  | 'dob'
  | 'lineType'
  | 'extraHours'
  | 'profitSharing'
  | 'investmentRate'
  | 'voteNo'
  | 'retention'
  | 'advanced'
  | 'review'
  | 'results'

export const WIZARD_STEPS: WizardStep[] = [
  'welcome',
  'seat',
  'longevity',
  'anniversary',
  'dob',
  'lineType',
  'extraHours',
  'profitSharing',
  'investmentRate',
  'retention',
  'voteNo',
  'advanced',
  'review',
  'results',
]

export const DEFAULT_VOTE_NO_SCENARIO = {
  probability: 0.50,
  arrivalMonths: 6,
  percentAboveTA: 0.10,
  jcbaDurationMonths: 30,
}

export const DEFAULT_INPUTS: Partial<UserInputs> = {
  longevityAsOfJul2026: 1,
  anniversaryMonth: 0,
  lineType: 'FLYING',
  investmentRate: 0.08,
  profitSharingLastYear: 0,
  retentionCurrentBalance: 0,
  retentionPayoutProbabilityB: 0.95,
  retentionPayoutProbabilityC: 0.75,
  voteNoScenarios: [{ ...DEFAULT_VOTE_NO_SCENARIO }],
  advancedPostJCBA: {
    enabled: false,
    scenarioA: { direction: 'SAME', magnitude: 0, probability: 1 },
    scenarioB: { direction: 'SAME', magnitude: 0, probability: 1 },
    scenarioC: { direction: 'SAME', magnitude: 0, probability: 1 },
  },
}

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
  reset: () => void
}

export const useStore = create<AppState>((set, get) => ({
  currentStep: 'welcome',
  inputs: { ...DEFAULT_INPUTS },
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
    setTimeout(() => {
      try {
        const fullInputs = inputs as UserInputs
        const scenarios = fullInputs.voteNoScenarios ?? [{ ...DEFAULT_VOTE_NO_SCENARIO }]
        const multiResults = scenarios.map(vns => buildAllScenarios(fullInputs, vns))
        set({ results: multiResults, isComputing: false, currentStep: 'results' })
      } catch (e) {
        console.error('Computation error', e)
        set({ isComputing: false })
      }
    }, 50)
  },

  reset: () => set({
    currentStep: 'welcome',
    inputs: { ...DEFAULT_INPUTS },
    results: null,
    isComputing: false,
  }),
}))
