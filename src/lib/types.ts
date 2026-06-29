import type { Seat } from '../data/payScales'

export type { Seat }

export type LineType = 'FLYING' | 'RESERVE'

export type ScenarioId = 'A' | 'B' | 'C' | 'VOTE_NO_EXPECTED'

/** All Vote No assumptions for a single comparison scenario. */
export interface VoteNoScenario {
  probability: number         // 0–1: probability of a 2nd bridge offer
  arrivalMonths: number       // months from Jul 1 2026 until 2nd offer arrives
  percentAboveTA: number      // how much better the 2nd offer is vs the TA (e.g. 0.10 = 10% above)
  jcbaDurationMonths: number  // months until JCBA concluded (18–60, default 30)
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
  upgradeToCAInYears?: number            // FO only: years from Jul 2026 until upgrade (undefined = no upgrade)
  anniversaryMonth: number               // 0=January, 11=December
  lineType: LineType
  extraHoursAboveMMG: number            // additional hours above MMG, default 0
  dateOfBirth: Date                     // to compute horizon to age 65

  // Financial
  investmentRate: number                 // default 0.08
  profitSharingLastYear: number          // $ amount
  brokerageSavingsPct: number           // 0–1: fraction of monthly raise saved to brokerage, default 0.33

  // Retention bonus
  retentionCurrentBalance: number        // current accrued balance $
  // Payout dates are computed automatically per scenario (no user input):
  //   A: Oct 1, 2026 (fixed — 60 days after ratification)
  //   B: startDate + offerArrivalMonths + 60 days after ratification
  //   C: startDate + jcbaDurationMonths + 60 days after ratification
  retentionPayoutProbabilityB: number    // 0–1, probability paid if vote no + 2nd offer (Outcome B)
  retentionPayoutProbabilityC: number    // 0–1, probability paid if vote no + wait for JCBA (Outcome C)

  // Vote-No assumption sets (1–3). Each has its own JCBA duration, offer probability, arrival, and premium.
  voteNoScenarios: VoteNoScenario[]

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

  // Seat & longevity at this point in time
  effectiveSeat: Seat
  longevity: number

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
  retentionCashFlow: number      // actual $ flowing this month (payout lump)
  retentionAccrualNote: number   // monthly accrual amount (for transparency, not discounted separately)
  retentionAtRetirement: number  // FV of this month's payout compounded to age 65 at investment rate

  // Brokerage savings (fraction of the raise vs CBA invested externally)
  brokerageSavingsCash: number   // $ saved to brokerage this month
  brokerageSavingsPV: number     // PV of that contribution compounded to retirement then discounted back

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
  preJcbaTotal: number               // PV of all cash flows + 401k in the pre-JCBA window ONLY (the decision metric)
  presentValueTotal: number          // sum of all PV cash flows (pay + PS + retention) full career
  retirementBalanceAt65: number      // 401k balance projected at age 65
  retirementBalancePV: number        // that balance discounted back to today
  interimEarningsPV: number          // PV of pay before JCBA conclusion
  total401kCompoundingGain: number   // extra $ from compounding vs no-contribution baseline

  // Retention invested to retirement
  retirementRetentionBalance: number // retention payout(s) compounded to age 65 at investment rate

  // Brokerage savings (compounded to retirement, then discounted to PV)
  totalBrokerageSavings: number      // sum of monthly brokerage contributions (pre-JCBA)
  retirementBrokerageBalance: number // brokerage balance compounded to age 65
  brokerageSavingsPV: number         // PV of that retirement balance

  // For comparison
  totalGrossPay: number
  totalProfitSharing: number
  totalRetention: number
  total401kContributions: number
}

export interface ComparisonResult {
  scenarios: ScenarioSummary[]      // [A, B, C]
  voteNoExpected: ScenarioSummary   // probability-weighted blend of B and C
  baselineScenarioId: ScenarioId   // 'A' is usually the baseline
  inputs: UserInputs
  voteNoScenario: VoteNoScenario    // the specific scenario assumptions used for this result
  computedAt: Date
}
