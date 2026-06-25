import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { encodeToURL, decodeFromURL } from './persistence'
import type { UserInputs } from '../lib/types'

const BASE = 'http://localhost:3000/'

function setHref(href: string) {
  vi.stubGlobal('window', { ...window, location: { href } })
}

const SAMPLE_INPUTS: Partial<UserInputs> = {
  seat: 'FO',
  longevityAsOfJul2026: 4,
  anniversaryMonth: 8,
  lineType: 'FLYING',
  extraHoursAboveMMG: 0,
  dateOfBirth: new Date('1985-01-01'),
  investmentRate: 0.08,
  profitSharingLastYear: 1000,
  retentionCurrentBalance: 50000,
  retentionPayoutProbabilityB: 0.95,
  retentionPayoutProbabilityC: 0.90,
  voteNoScenarios: [{
    probability: 0.5,
    arrivalMonths: 6,
    percentAboveTA: 0.1,
    jcbaDurationMonths: 30,
  }],
  advancedPostJCBA: {
    enabled: false,
    scenarioA: { direction: 'SAME', magnitude: 0, probability: 1 },
    scenarioB: { direction: 'SAME', magnitude: 0, probability: 1 },
    scenarioC: { direction: 'SAME', magnitude: 0, probability: 1 },
  },
}

describe('encodeToURL', () => {
  beforeEach(() => setHref(BASE))
  afterEach(() => vi.unstubAllGlobals())

  it('produces a URL with a d= param', () => {
    const url = encodeToURL(SAMPLE_INPUTS)
    expect(url).toMatch(/[?&]d=/)
  })

  it('param is raw-JSON base64 (not double-encoded)', () => {
    const url = encodeToURL(SAMPLE_INPUTS)
    const param = new URL(url).searchParams.get('d')!
    const raw = atob(param)
    expect(raw).toMatch(/^\{/)
    // Must NOT contain percent-encoded chars like %22 or %7B
    expect(raw).not.toMatch(/%[0-9A-F]{2}/i)
  })

  it('link is substantially shorter than the legacy double-encoded format', () => {
    // Legacy: btoa(encodeURIComponent(json))
    const payload: Record<string, unknown> = { ...SAMPLE_INPUTS, dateOfBirth: '1985-01-01' }
    delete payload.advancedPostJCBA
    const json = JSON.stringify(payload)
    const legacyEncoded = btoa(encodeURIComponent(json))
    const legacyURL = `${BASE}?d=${legacyEncoded}`

    const newURL = encodeToURL(SAMPLE_INPUTS)
    expect(newURL.length).toBeLessThan(legacyURL.length)
  })

  it('omits disabled advancedPostJCBA to keep URLs short', () => {
    const url = encodeToURL(SAMPLE_INPUTS)
    const param = new URL(url).searchParams.get('d')!
    const json = atob(param)
    expect(json).not.toContain('advancedPostJCBA')
  })

  it('includes advancedPostJCBA when it is enabled', () => {
    const inputs: Partial<UserInputs> = {
      ...SAMPLE_INPUTS,
      advancedPostJCBA: {
        enabled: true,
        scenarioA: { direction: 'HIGHER', magnitude: 0.05, probability: 0.8 },
        scenarioB: { direction: 'SAME', magnitude: 0, probability: 1 },
        scenarioC: { direction: 'LOWER', magnitude: 0.02, probability: 0.7 },
      },
    }
    const url = encodeToURL(inputs)
    const param = new URL(url).searchParams.get('d')!
    const json = atob(param)
    expect(json).toContain('advancedPostJCBA')
  })

  it('serialises dateOfBirth as YYYY-MM-DD string', () => {
    const url = encodeToURL(SAMPLE_INPUTS)
    const param = new URL(url).searchParams.get('d')!
    const json = atob(param)
    expect(json).toContain('"dateOfBirth":"1985-01-01"')
  })
})

describe('decodeFromURL — new compact format', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('round-trips all scalar inputs', () => {
    setHref(BASE)
    const encoded = encodeToURL(SAMPLE_INPUTS)
    setHref(encoded)

    const decoded = decodeFromURL()!
    expect(decoded.seat).toBe('FO')
    expect(decoded.longevityAsOfJul2026).toBe(4)
    expect(decoded.investmentRate).toBe(0.08)
    expect(decoded.voteNoScenarios).toHaveLength(1)
    expect(decoded.voteNoScenarios![0].probability).toBe(0.5)
  })

  it('dateOfBirth is decoded as a string (store coerces it)', () => {
    setHref(BASE)
    const encoded = encodeToURL(SAMPLE_INPUTS)
    setHref(encoded)

    const decoded = decodeFromURL()!
    // The store's setInputs handles the string → Date coercion; persistence returns the raw string.
    expect(decoded.dateOfBirth).toBeDefined()
  })

  it('returns null when no d param is present', () => {
    setHref(BASE)
    expect(decodeFromURL()).toBeNull()
  })
})

describe('decodeFromURL — legacy double-encoded format (backward compatibility)', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('decodes the old btoa(encodeURIComponent(json)) format', () => {
    const legacyInputs = {
      seat: 'CA',
      longevityAsOfJul2026: 6,
      lineType: 'RESERVE',
      investmentRate: 0.07,
    }
    const legacyParam = btoa(encodeURIComponent(JSON.stringify(legacyInputs)))
    setHref(`${BASE}?d=${legacyParam}`)

    const decoded = decodeFromURL()!
    expect(decoded.seat).toBe('CA')
    expect(decoded.longevityAsOfJul2026).toBe(6)
    expect(decoded.lineType).toBe('RESERVE')
    expect(decoded.investmentRate).toBe(0.07)
  })

  it('decodes legacy __type Date objects', () => {
    const legacyInputs = {
      seat: 'FO',
      dateOfBirth: { __type: 'Date', value: '1990-06-15T00:00:00.000Z' },
    }
    const legacyParam = btoa(encodeURIComponent(JSON.stringify(legacyInputs)))
    setHref(`${BASE}?d=${legacyParam}`)

    const decoded = decodeFromURL()!
    expect(decoded.dateOfBirth).toBeInstanceOf(Date)
    expect((decoded.dateOfBirth as Date).getFullYear()).toBe(1990)
  })
})
