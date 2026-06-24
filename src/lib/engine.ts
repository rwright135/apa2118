import {
  getRate,
} from '../data/payScales'
import { CONTRACT_PARAMS } from '../data/contractParams'
import type { UserInputs, MonthlyRow, ScenarioSummary, ScenarioId } from './types'

// ─── Date helpers ────────────────────────────────────────────────────────────

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function monthsDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}

export function getRetirementDate(dob: Date): Date {
  const ret = new Date(dob)
  ret.setFullYear(ret.getFullYear() + CONTRACT_PARAMS.RETIREMENT_AGE)
  return ret
}

// ─── Longevity ────────────────────────────────────────────────────────────────

/**
 * Compute pilot's longevity at a given date.
 * Longevity increments on the anniversaryMonth each year, capped at 12.
 */
export function getLongevityAt(
  baseLongevity: number,
  anniversaryMonth: number, // 0=Jan
  baseDate: Date,           // July 1, 2026
  targetDate: Date
): number {
  let longevity = baseLongevity
  const startYear = baseDate.getFullYear()
  const startMonth = baseDate.getMonth()
  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth()

  for (let year = startYear; year <= targetYear; year++) {
    const annivMonth = anniversaryMonth
    const annivYear = year

    if (
      (annivYear > startYear || (annivYear === startYear && annivMonth > startMonth)) &&
      (annivYear < targetYear || (annivYear === targetYear && annivMonth <= targetMonth))
    ) {
      longevity = Math.min(longevity + 1, 12)
    }
  }

  return longevity
}

// ─── Rate tier lookup ─────────────────────────────────────────────────────────

export function getTATier(date: Date): 'TA_DOS_EOY2026' | 'TA_JAN2027' | 'TA_JAN2028' {
  if (date >= CONTRACT_PARAMS.TA_JAN2028_DATE) return 'TA_JAN2028'
  if (date >= CONTRACT_PARAMS.TA_JAN2027_DATE) return 'TA_JAN2027'
  return 'TA_DOS_EOY2026'
}

// ─── Monthly hours ────────────────────────────────────────────────────────────

export function getMonthlyHours(
  inputs: UserInputs,
  isTA: boolean
): number {
  const mmg =
    inputs.lineType === 'FLYING'
      ? CONTRACT_PARAMS.MMG_FLYING
      : isTA
      ? CONTRACT_PARAMS.MMG_RESERVE_TA
      : CONTRACT_PARAMS.MMG_RESERVE_CBA
  return mmg + inputs.extraHoursAboveMMG
}

// ─── 401k rate ────────────────────────────────────────────────────────────────

export function get401kRate(scenarioId: ScenarioId, date: Date): number {
  if (scenarioId === 'A' || scenarioId === 'B') {
    if (date >= CONTRACT_PARAMS.K401_TA_PHASE2_DATE) return CONTRACT_PARAMS.K401_TA_PHASE2
    return CONTRACT_PARAMS.K401_TA_PHASE1
  }
  return CONTRACT_PARAMS.K401_CURRENT
}

// ─── Discounting ──────────────────────────────────────────────────────────────

export function discountFactor(annualRate: number, months: number): number {
  return 1 / Math.pow(1 + annualRate, months / 12)
}

export function futureValue(
  presentAmount: number,
  annualRate: number,
  months: number
): number {
  return presentAmount * Math.pow(1 + annualRate, months / 12)
}

// ─── Profit sharing ───────────────────────────────────────────────────────────

/**
 * PS for a given year = PS_base × (scenarioAnnualRate / baseAnnualRate)
 * Base annual rate = rate at longevity as of Jul 2026 on current CBA
 */
export function getProfitSharingForYear(
  inputs: UserInputs,
  date: Date,
  scenarioId: ScenarioId,
  longevityAtDate: number
): number {
  const baseRate = getRate(inputs.seat, inputs.longevityAsOfJul2026, 'CBA')

  let scenarioRate: number
  if (scenarioId === 'C') {
    scenarioRate = getRate(inputs.seat, longevityAtDate, 'CBA')
  } else {
    const tier = getTATier(date)
    scenarioRate = getRate(inputs.seat, longevityAtDate, tier)
  }

  return inputs.profitSharingLastYear * (scenarioRate / baseRate)
}

// ─── Retention bonus ──────────────────────────────────────────────────────────

export function getMonthlyRetentionAccrual(rate: number): number {
  return rate * CONTRACT_PARAMS.RETENTION_ACCRUAL_HOURS * CONTRACT_PARAMS.RETENTION_ACCRUAL_FACTOR
}

// ─── Core stream builder ──────────────────────────────────────────────────────

export function buildMonthlyStream(
  inputs: UserInputs,
  scenarioId: ScenarioId
): MonthlyRow[] {
  const startDate = CONTRACT_PARAMS.TA_EFFECTIVE_DATE // July 1, 2026
  const retirementDate = getRetirementDate(inputs.dateOfBirth)
  const totalMonths = monthsDiff(startDate, retirementDate)
  const rate = inputs.investmentRate

  const offerArrivalMonth =
    scenarioId === 'B' ? inputs.voteNoOffer.arrivalMonths : Infinity
  const jcbaMonth = inputs.jcbaDurationMonths

  // ── Retention payout month index (months from startDate) ─────────────────
  // A: Oct 1, 2026 = month 3 from Jul 1, 2026 (fixed — 60 days after ratification)
  // B: offer arrival date + 60 days after ratification
  // C: JCBA conclusion month
  const RETENTION_PAYOUT_MONTH_A = monthsDiff(startDate, new Date(2026, 9, 1)) // Oct 1 = index 3
  const retentionPayoutMonth =
    scenarioId === 'A' ? RETENTION_PAYOUT_MONTH_A :
    scenarioId === 'B'
      ? monthsDiff(
          startDate,
          addDays(
            addMonths(startDate, inputs.voteNoOffer.arrivalMonths),
            CONTRACT_PARAMS.RETENTION_PAYOUT_DAYS_AFTER_RATIFICATION
          )
        )
      : jcbaMonth  // Scenario C: accrues until JCBA

  const rows: MonthlyRow[] = []
  let cumulativePV = 0
  let cumulativePV401k = 0

  let retentionAccruedBalance = inputs.retentionCurrentBalance

  for (let m = 0; m < totalMonths; m++) {
    const date = addMonths(startDate, m)
    const year = date.getFullYear()
    const month = date.getMonth()

    const longevity = getLongevityAt(
      inputs.longevityAsOfJul2026,
      inputs.anniversaryMonth,
      startDate,
      date
    )

    let hourlyRate: number
    let isTA: boolean
    let k401Rate: number

    // Post-JCBA: ALL scenarios converge to the same TA Jan-2028 rates.
    // Only the pre-JCBA window drives the comparison; the tail cancels.
    if (m >= jcbaMonth) {
      isTA = true
      hourlyRate = getRate(inputs.seat, longevity, 'TA_JAN2028')
      k401Rate = CONTRACT_PARAMS.K401_TA_PHASE2
    } else if (scenarioId === 'A') {
      // Vote Yes: TA rates from day one through each effective-date tier
      isTA = true
      const tier = getTATier(date)
      hourlyRate = getRate(inputs.seat, longevity, tier)
      k401Rate = get401kRate('A', date)
    } else if (scenarioId === 'B') {
      // Vote No + 2nd offer: CBA until offer arrives, then uplifted TA until JCBA
      if (m < offerArrivalMonth) {
        isTA = false
        hourlyRate = getRate(inputs.seat, longevity, 'CBA')
        k401Rate = CONTRACT_PARAMS.K401_CURRENT
      } else {
        // Offer arrived, between offer and JCBA: TA + uplift
        isTA = true
        const tier = getTATier(date)
        const taRate = getRate(inputs.seat, longevity, tier)
        hourlyRate = taRate * (1 + inputs.voteNoOffer.percentAboveTA)
        k401Rate = get401kRate('A', date)
      }
    } else {
      // Scenario C: CBA until JCBA (handled by post-JCBA guard above)
      isTA = false
      hourlyRate = getRate(inputs.seat, longevity, 'CBA')
      k401Rate = CONTRACT_PARAMS.K401_CURRENT
    }

    const totalHours = getMonthlyHours(inputs, isTA)
    const grossPay = hourlyRate * totalHours

    const k401Contribution = grossPay * k401Rate

    let profitSharingCash = 0
    if (month === 5 || month === 10) {
      const annualPS = getProfitSharingForYear(inputs, date, scenarioId, longevity)
      profitSharingCash = annualPS / 2
    }

    let retentionCashFlow = 0
    let retentionAccrualNote = 0

    if (scenarioId === 'A') {
      if (m === retentionPayoutMonth) {
        retentionCashFlow = inputs.retentionCurrentBalance
      }
    } else {
      const currentRate = getRate(inputs.seat, longevity, 'CBA')
      const monthlyAccrual = getMonthlyRetentionAccrual(currentRate)
      retentionAccruedBalance += monthlyAccrual
      retentionAccrualNote = monthlyAccrual

      if (m === retentionPayoutMonth) {
        const prob = scenarioId === 'B'
          ? inputs.retentionPayoutProbabilityB
          : inputs.retentionPayoutProbabilityC
        retentionCashFlow = retentionAccruedBalance * prob
      }
    }

    const df = discountFactor(rate, m)
    const pv = (grossPay + profitSharingCash + retentionCashFlow) * df

    const fv401kAtRetirement = k401Contribution * Math.pow(1 + rate, (totalMonths - m) / 12)
    const pv401kFromRetirement = fv401kAtRetirement * discountFactor(rate, totalMonths)

    cumulativePV += pv
    cumulativePV401k += pv401kFromRetirement

    rows.push({
      date,
      monthIndex: m,
      year,
      month,
      scenarioId,
      hourlyRate,
      totalHours,
      grossPay,
      k401Contribution,
      k401Rate,
      profitSharingCash,
      retentionCashFlow,
      retentionAccrualNote,
      discountFactor: df,
      presentValue: pv,
      presentValue401k: pv401kFromRetirement,
      cumulativePV,
      cumulativePV401k,
    })
  }

  return rows
}

// ─── Steady-state detection ───────────────────────────────────────────────────

/**
 * Returns the month index of the first month after which every subsequent
 * 12-month block has identical gross pay (longevity capped + rates flat).
 */
export function detectSteadyState(rows: MonthlyRow[]): number {
  if (rows.length < 24) return rows.length

  for (let i = rows.length - 12; i >= 12; i--) {
    const curr = rows[i].grossPay
    const prev = rows[i - 12].grossPay
    if (Math.abs(curr - prev) > 0.01) {
      return i + 12
    }
  }
  return 12
}

// ─── Scenario summary builder ─────────────────────────────────────────────────

export function buildScenarioSummary(
  rows: MonthlyRow[],
  scenarioId: ScenarioId,
  label: string,
  description: string,
  inputs: UserInputs
): ScenarioSummary {
  const retirementDate = getRetirementDate(inputs.dateOfBirth)
  const startDate = CONTRACT_PARAMS.TA_EFFECTIVE_DATE
  const totalMonths = monthsDiff(startDate, retirementDate)

  const jcbaMonth = inputs.jcbaDurationMonths

  const presentValueTotal = rows.reduce((sum, r) => sum + r.presentValue, 0)
  const retirementBalancePV = rows.reduce((sum, r) => sum + r.presentValue401k, 0)

  const retirementBalanceAt65 = rows.reduce((sum, r) => {
    const monthsToRetirement = totalMonths - r.monthIndex
    return sum + r.k401Contribution * Math.pow(1 + inputs.investmentRate, monthsToRetirement / 12)
  }, 0)

  // Pre-JCBA window only — this is the only period that differs between scenarios.
  // Everything after JCBA converges to identical rates, so only these months drive the comparison.
  const preJcbaRows = rows.filter(r => r.monthIndex < jcbaMonth)

  const interimEarningsPV = preJcbaRows.reduce((sum, r) => sum + r.presentValue, 0)

  // preJcbaTotal = PV of all pre-JCBA cash flows + PV of pre-JCBA 401k contributions
  // (401k contributions made before JCBA keep compounding post-JCBA, so they're still
  //  meaningfully different between scenarios)
  const preJcbaTotal =
    preJcbaRows.reduce((sum, r) => sum + r.presentValue + r.presentValue401k, 0)

  const total401kCompoundingGain = retirementBalanceAt65 - rows.reduce((sum, r) => sum + r.k401Contribution, 0)

  const totalGrossPay        = preJcbaRows.reduce((sum, r) => sum + r.grossPay, 0)
  const totalProfitSharing   = preJcbaRows.reduce((sum, r) => sum + r.profitSharingCash, 0)
  const totalRetention       = rows.reduce((sum, r) => sum + r.retentionCashFlow, 0) // may span JCBA
  const total401kContributions = preJcbaRows.reduce((sum, r) => sum + r.k401Contribution, 0)

  const steadyStateIndex = detectSteadyState(rows)

  return {
    scenarioId,
    label,
    description,
    rows,
    totalRows: rows.length,
    steadyStateIndex,
    preJcbaTotal,
    presentValueTotal,
    retirementBalanceAt65,
    retirementBalancePV,
    interimEarningsPV,
    total401kCompoundingGain,
    totalGrossPay,
    totalProfitSharing,
    totalRetention,
    total401kContributions,
  }
}
