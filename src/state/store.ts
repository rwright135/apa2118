import { create } from 'zustand'
import { buildAllScenarios } from '../lib/scenarios'
import type { UserInputs, ComparisonResult } from '../lib/types'
import { saveToLocalStorage } from './persistence'

export type WizardStep =
  | 'welcome'
  | 'seat'
  | 'longevity'
  | 'anniversary'
  | 'lineType'
  | 'extraHours'
  | 'dob'
  | 'profitSharing'
  | 'retention'
  | 'investmentRate'
  | 'voteNo'
  | 'jcba'
  | 'advanced'
  | 'review'
  | 'results'

export const WIZARD_STEPS: WizardStep[] = [
  'welcome',
  'seat',
  'longevity',
  'anniversary',
  'lineType',
  'extraHours',
  'dob',
  'profitSharing',
  'retention',
  'investmentRate',
  'voteNo',
  'jcba',
  'advanced',
  'review',
  'results',
]

export const DEFAULT_INPUTS: Partial<UserInputs> = {
  longevityAsOfJul2026: 1,
  anniversaryMonth: 0,
  lineType: 'FLYING',
  extraHoursAboveMMG: 0,
  investmentRate: 0.0795,
  profitSharingLastYear: 0,
  retentionCurrentBalance: 0,
  retentionPayoutProbability: 0.95,
  voteNoOffer: {
    probability: 0.25,
    arrivalMonths: 18,
    percentAboveTA: 0.03,
  },
  jcbaDurationMonths: 24,
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
  results: ComparisonResult | null
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
        const result = buildAllScenarios(inputs as UserInputs)
        set({ results: result, isComputing: false, currentStep: 'results' })
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
