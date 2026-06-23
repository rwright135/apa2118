import type { Seat } from '../data/payScales'

export type { Seat }

export type LineType = 'FLYING' | 'RESERVE'

export type ScenarioId = 'A' | 'B' | 'C' | 'VOTE_NO_EXPECTED'

export interface VoteNoOffer {
  probability: number      // 0.05–0.50 in 0.025 steps
  arrivalMonths: number    // months from Jul 1 2026
  percentAboveTA: number   // % above TA Jan2028 rates (e.g. 0.05 = 5% above)
}

export interface AdvancedPostJCBA {
  enabled: boolean
  // Per scenario: what do you expect post-JCBA pay to be relative to TA Jan2028
  scenarioA: { direction: 'HIGHER' | 'SAME' | 'LOWER'; magnitude: number; probability: number }
  scenarioB: { direction: 'HIGHER' | 'SAME' | 'LOWER'; magnitude: number; probability: number }
  scenarioC: { direction: 'HIGHER' | 'SAME' | 'LOWER'; magnitude: number; probability: number }
}

export interface UserInputs {
  // Identity
  seat: Seat
  longevityAsOfJul2026: number           // 1–12
  anniversaryMonth: number               // 0=January, 11=December
  lineType: LineType
  extraHoursAboveMMG: number            // additional hours above MMG, default 0
  dateOfBirth: Date                     // to compute horizon to age 65

  // Financial
  investmentRate: number                 // default 0.0795
  profitSharingLastYear: number          // $ amount

  // Retention bonus
  retentionCurrentBalance: number        // current accrued balance $
  // Payout dates are computed automatically per scenario (no user input):
  //   A: Oct 1, 2026 (fixed — ~60 days after ratification)
  //   B: startDate + offerArrivalMonths + 50 days
  //   C: startDate + jcbaDurationMonths
  retentionPayoutProbability: number     // 0–1, probability it's paid if vote no (bankruptcy risk)

  // Vote-No assumptions
  voteNoOffer: VoteNoOffer
  jcbaDurationMonths: number            // months until JCBA concluded (12–84, default 24)

  // Advanced
  advancedPostJCBA: AdvancedPostJCBA
}

export interface MonthlyRow {
  // Time
  date: Date
  monthIndex: number    // months from start (0 = July 2026)
  year: number
  month: number         // 0-indexed

  // Scenario
  scenarioId: ScenarioId

  // Pay
  hourlyRate: number
  totalHours: number
  grossPay: number

  // 401k
  k401Contribution: number    // $ contributed this month
  k401Rate: number            // rate used (0.10 or 0.15)

  // Profit sharing (0 unless June or November)
  profitSharingCash: number

  // Retention (0 unless payout month, or accrual note)
  retentionCashFlow: number   // actual $ flowing this month (payout lump)
  retentionAccrualNote: number // monthly accrual amount (for transparency, not discounted separately)

  // Discounting
  discountFactor: number
  presentValue: number        // PV of (grossPay + profitSharingCash + retentionCashFlow) this month
  presentValue401k: number    // PV of 401k contribution compounded to retirement then discounted back

  // Running totals
  cumulativePV: number
  cumulativePV401k: number
}

export interface ScenarioSummary {
  scenarioId: ScenarioId
  label: string
  description: string
  rows: MonthlyRow[]
  totalRows: number
  steadyStateIndex: number    // rows index after which annual pattern repeats

  // Headlines
  presentValueTotal: number          // sum of all PV cash flows (pay + PS + retention)
  retirementBalanceAt65: number      // 401k balance projected at age 65
  retirementBalancePV: number        // that balance discounted back to today
  interimEarningsPV: number          // PV of pay before JCBA conclusion
  total401kCompoundingGain: number   // extra $ from compounding vs no-contribution baseline

  // For comparison
  totalGrossPay: number
  totalProfitSharing: number
  totalRetention: number
  total401kContributions: number
}

export interface ComparisonResult {
  scenarios: ScenarioSummary[]
  voteNoExpected: ScenarioSummary
  baselineScenarioId: ScenarioId   // 'A' is usually the baseline
  inputs: UserInputs
  computedAt: Date
}
