import { describe, it, expect } from 'vitest'
import { getLongevityAt, getTATier, discountFactor, getMonthlyRetentionAccrual, detectSteadyState, buildMonthlyStream } from './engine'
import { CURRENT_CBA, getRate } from '../data/payScales'
import type { UserInputs } from './types'

const DEFAULT_VNS = { probability: 0.25, arrivalMonths: 18, percentAboveTA: 0.03, jcbaDurationMonths: 24 }

const makeInputs = (overrides: Partial<UserInputs> = {}): UserInputs => ({
  seat: 'FO',
  longevityAsOfJul2026: 4,
  anniversaryMonth: 8, // September
  lineType: 'FLYING',
  extraHoursAboveMMG: 0,
  dateOfBirth: new Date(1985, 0, 1), // Age 41 in 2026, retires 2050
  investmentRate: 0.08,
  profitSharingLastYear: 1000,
  retentionCurrentBalance: 50000,
  retentionPayoutProbabilityB: 0.95,
  retentionPayoutProbabilityC: 0.90,
  voteNoScenarios: [{ ...DEFAULT_VNS }],
  advancedPostJCBA: {
    enabled: false,
    scenarioA: { direction: 'SAME', magnitude: 0, probability: 1 },
    scenarioB: { direction: 'SAME', magnitude: 0, probability: 1 },
    scenarioC: { direction: 'SAME', magnitude: 0, probability: 1 },
  },
  ...overrides,
})

describe('getLongevityAt', () => {
  const baseDate = new Date(2026, 6, 1) // July 1 2026

  it('returns base longevity before first anniversary', () => {
    const target = new Date(2026, 7, 1) // August 2026 (before Sep anniversary)
    expect(getLongevityAt(4, 8, baseDate, target)).toBe(4)
  })

  it('increments at anniversary month', () => {
    const target = new Date(2026, 8, 1) // September 2026
    expect(getLongevityAt(4, 8, baseDate, target)).toBe(5)
  })

  it('increments again the following year', () => {
    const target = new Date(2027, 8, 1) // September 2027
    expect(getLongevityAt(4, 8, baseDate, target)).toBe(6)
  })

  it('caps at 12', () => {
    const target = new Date(2034, 8, 1) // Many years later
    expect(getLongevityAt(4, 8, baseDate, target)).toBe(12)
  })
})

describe('getTATier', () => {
  it('returns DOS_EOY2026 before Jan 2027', () => {
    expect(getTATier(new Date(2026, 11, 1))).toBe('TA_DOS_EOY2026')
  })
  it('returns JAN2027 from Jan 2027 to Dec 2027', () => {
    expect(getTATier(new Date(2027, 0, 1))).toBe('TA_JAN2027')
    expect(getTATier(new Date(2027, 6, 1))).toBe('TA_JAN2027')
  })
  it('returns JAN2028 from Jan 2028 onward', () => {
    expect(getTATier(new Date(2028, 0, 1))).toBe('TA_JAN2028')
    expect(getTATier(new Date(2035, 0, 1))).toBe('TA_JAN2028')
  })
})

describe('discountFactor', () => {
  it('returns 1 at month 0', () => {
    expect(discountFactor(0.08, 0)).toBeCloseTo(1, 5)
  })
  it('returns correct value at 12 months', () => {
    expect(discountFactor(0.08, 12)).toBeCloseTo(1 / 1.08, 4)
  })
})

describe('getRate', () => {
  it('returns correct CBA FO L4 rate', () => {
    expect(getRate('FO', 4, 'CBA')).toBe(116.99)
  })
  it('returns correct TA Jan2027 FO L4 rate', () => {
    expect(getRate('FO', 4, 'TA_JAN2027')).toBe(188.40)
  })
  it('clamps longevity at 12', () => {
    expect(getRate('FO', 15, 'CBA')).toBe(CURRENT_CBA['FO'][12])
  })
})

describe('getMonthlyRetentionAccrual', () => {
  it('computes correctly for FO L4 rate', () => {
    const rate = getRate('FO', 4, 'CBA') // 116.99
    const accrual = getMonthlyRetentionAccrual(rate)
    expect(accrual).toBeCloseTo(116.99 * 85 * 0.35, 2)
  })
})

describe('buildMonthlyStream - Scenario A', () => {
  it('returns rows from July 2026 to retirement', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'A', DEFAULT_VNS)
    expect(rows.length).toBeGreaterThan(200)
    expect(rows[0].month).toBe(6) // July = month index 6
    expect(rows[0].year).toBe(2026)
  })

  it('uses TA DOS_EOY2026 rate in first month', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'A', DEFAULT_VNS)
    // FO L4 DOS_EOY2026 = 161.37
    expect(rows[0].hourlyRate).toBeCloseTo(161.37, 2)
  })

  it('switches to TA Jan2027 rate in January 2027', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'A', DEFAULT_VNS)
    const jan2027 = rows.find(r => r.year === 2027 && r.month === 0)
    expect(jan2027).toBeDefined()
    expect(jan2027!.hourlyRate).toBeGreaterThan(161.37)
  })

  it('uses 10% 401k in Jul-Dec 2026 and 15% from Jan 2027', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'A', DEFAULT_VNS)
    const dec2026 = rows.find(r => r.year === 2026 && r.month === 11)
    const jan2027 = rows.find(r => r.year === 2027 && r.month === 0)
    expect(dec2026!.k401Rate).toBe(0.10)
    expect(jan2027!.k401Rate).toBe(0.15)
  })

  it('pays retention bonus on the payout date', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'A', DEFAULT_VNS)
    const oct2026 = rows.find(r => r.year === 2026 && r.month === 9)
    expect(oct2026!.retentionCashFlow).toBe(50000)
  })
})

describe('buildMonthlyStream - Scenario C', () => {
  it('uses CBA rates before JCBA', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'C', DEFAULT_VNS)
    // First row: FO L4 CBA = 116.99
    expect(rows[0].hourlyRate).toBeCloseTo(116.99, 2)
  })

  it('switches to TA Jan2028 rates after JCBA', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'C', DEFAULT_VNS)
    const postJCBA = rows[24]
    expect(postJCBA.hourlyRate).toBeGreaterThan(116.99)
  })

  it('maintains 10% 401k throughout pre-JCBA', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'C', DEFAULT_VNS)
    expect(rows[0].k401Rate).toBe(0.10)
    expect(rows[23].k401Rate).toBe(0.10)
  })
})

describe('post-JCBA convergence', () => {
  const customVns = { probability: 0.5, arrivalMonths: 12, percentAboveTA: 0.10, jcbaDurationMonths: 24 }

  it('all three scenarios use identical rates after JCBA concludes', () => {
    const inputs = makeInputs({ voteNoScenarios: [customVns] })
    const rowsA = buildMonthlyStream(inputs, 'A', customVns)
    const rowsB = buildMonthlyStream(inputs, 'B', customVns)
    const rowsC = buildMonthlyStream(inputs, 'C', customVns)
    // At month 30 (6 months past JCBA), all should have the same rate
    expect(rowsA[30].hourlyRate).toBeCloseTo(rowsB[30].hourlyRate, 2)
    expect(rowsA[30].hourlyRate).toBeCloseTo(rowsC[30].hourlyRate, 2)
  })

  it('Scenario B uplift only applies between offer arrival and JCBA', () => {
    const inputs = makeInputs({ voteNoScenarios: [customVns] })
    const rows = buildMonthlyStream(inputs, 'B', customVns)
    // Month 18 (between offer at 12 and JCBA at 24): should have uplift
    const rateAtMonth18 = rows[18].hourlyRate
    // Month 30 (post JCBA): should be back to plain TA rate, no uplift
    const rateAtMonth30 = rows[30].hourlyRate
    expect(rateAtMonth18).toBeGreaterThan(rateAtMonth30)
  })
})

describe('detectSteadyState', () => {
  it('detects steady state when pay stops changing', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'A', DEFAULT_VNS)
    const ss = detectSteadyState(rows)
    expect(ss).toBeGreaterThan(0)
    expect(ss).toBeLessThan(rows.length)
  })
})

describe('profit sharing', () => {
  it('pays profit sharing in June and November only', () => {
    const inputs = makeInputs()
    const rows = buildMonthlyStream(inputs, 'A', DEFAULT_VNS)
    const juneRows = rows.filter(r => r.month === 5)
    const nonPSRows = rows.filter(r => r.month !== 5 && r.month !== 10)
    expect(juneRows.every(r => r.profitSharingCash > 0)).toBe(true)
    expect(nonPSRows.every(r => r.profitSharingCash === 0)).toBe(true)
  })
})
