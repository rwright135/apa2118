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

    if (scenarioId === 'A') {
      isTA = true
      const tier = getTATier(date)
      hourlyRate = getRate(inputs.seat, longevity, tier)
      k401Rate = get401kRate('A', date)
    } else if (scenarioId === 'B') {
      if (m < offerArrivalMonth) {
        isTA = false
        hourlyRate = getRate(inputs.seat, longevity, 'CBA')
        k401Rate = CONTRACT_PARAMS.K401_CURRENT
      } else {
        isTA = true
        const tier = getTATier(date)
        const taRate = getRate(inputs.seat, longevity, tier)
        hourlyRate = taRate * (1 + inputs.voteNoOffer.percentAboveTA)
        k401Rate = get401kRate('A', date)
      }
    } else {
      if (m < jcbaMonth) {
        isTA = false
        hourlyRate = getRate(inputs.seat, longevity, 'CBA')
        k401Rate = CONTRACT_PARAMS.K401_CURRENT
      } else {
        isTA = true
        hourlyRate = getRate(inputs.seat, longevity, 'TA_JAN2028')
        k401Rate = CONTRACT_PARAMS.K401_TA_PHASE2
      }
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
      const payoutMonth = monthsDiff(startDate, inputs.retentionPayoutDate)
      if (m === payoutMonth) {
        retentionCashFlow = inputs.retentionCurrentBalance
      }
    } else {
      const currentRate = getRate(inputs.seat, longevity, 'CBA')
      const monthlyAccrual = getMonthlyRetentionAccrual(currentRate)
      retentionAccruedBalance += monthlyAccrual
      retentionAccrualNote = monthlyAccrual

      const payoutTriggerMonth = scenarioId === 'B'
        ? Math.min(offerArrivalMonth, jcbaMonth)
        : jcbaMonth

      if (m === payoutTriggerMonth) {
        retentionCashFlow = retentionAccruedBalance * inputs.retentionPayoutProbability
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

  const interimEarningsPV = rows
    .filter(r => r.monthIndex < jcbaMonth)
    .reduce((sum, r) => sum + r.presentValue, 0)

  const total401kCompoundingGain = retirementBalanceAt65 - rows.reduce((sum, r) => sum + r.k401Contribution, 0)

  const totalGrossPay = rows.reduce((sum, r) => sum + r.grossPay, 0)
  const totalProfitSharing = rows.reduce((sum, r) => sum + r.profitSharingCash, 0)
  const totalRetention = rows.reduce((sum, r) => sum + r.retentionCashFlow, 0)
  const total401kContributions = rows.reduce((sum, r) => sum + r.k401Contribution, 0)

  const steadyStateIndex = detectSteadyState(rows)

  return {
    scenarioId,
    label,
    description,
    rows,
    totalRows: rows.length,
    steadyStateIndex,
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
