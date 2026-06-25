import type { UserInputs, AdvancedPostJCBA } from '../lib/types'

const STORAGE_KEY = 'apa2118_inputs'
const URL_PARAM = 'd'

// ── helpers ───────────────────────────────────────────────────────────────────

/** True when advancedPostJCBA is disabled *and* all scenario values are default. */
function isDefaultAdvanced(adv: AdvancedPostJCBA): boolean {
  if (adv.enabled) return false
  const isDefaultScenario = (s: { direction: string; magnitude: number; probability: number }) =>
    s.direction === 'SAME' && s.magnitude === 0 && s.probability === 1
  return isDefaultScenario(adv.scenarioA) && isDefaultScenario(adv.scenarioB) && isDefaultScenario(adv.scenarioC)
}

// ── URL encode / decode ───────────────────────────────────────────────────────

export function encodeToURL(inputs: Partial<UserInputs>): string {
  try {
    const payload: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(inputs)) {
      // Skip disabled advanced settings — they are verbose and always restored to defaults on decode
      if (key === 'advancedPostJCBA' && value && isDefaultAdvanced(value as AdvancedPostJCBA)) continue

      if (value instanceof Date) {
        // Store as YYYY-MM-DD — the store's setInputs coerces date strings back to Date objects
        payload[key] = value.toISOString().slice(0, 10)
      } else {
        payload[key] = value
      }
    }

    // btoa(json) directly — all payload values are ASCII-safe numbers / strings / booleans
    // This is ~50% shorter than the previous btoa(encodeURIComponent(json)) scheme
    const encoded = btoa(JSON.stringify(payload))
    const url = new URL(window.location.href)
    url.searchParams.set(URL_PARAM, encoded)
    return url.toString()
  } catch {
    return window.location.href
  }
}

export function decodeFromURL(): Partial<UserInputs> | null {
  try {
    const url = new URL(window.location.href)
    const encoded = url.searchParams.get(URL_PARAM)
    if (!encoded) return null

    const raw = atob(encoded)
    let json: string

    if (raw.startsWith('{')) {
      // New compact format: btoa(json)
      json = raw
    } else {
      // Legacy format: btoa(encodeURIComponent(json)) — keep decoding old shared links
      json = decodeURIComponent(raw)
    }

    const parsed = JSON.parse(json, (_key, value) => {
      // Legacy links used { __type: 'Date', value: '...' } wrappers
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value)
      }
      return value
      // Plain YYYY-MM-DD date strings are left as strings here;
      // the store's setInputs() coerces dateOfBirth to a Date object.
    })

    return parsed
  } catch {
    return null
  }
}

// ── localStorage ──────────────────────────────────────────────────────────────

export function saveToLocalStorage(inputs: Partial<UserInputs>): void {
  try {
    const json = JSON.stringify(inputs, (_key, value) => {
      if (value instanceof Date) return { __type: 'Date', value: value.toISOString() }
      return value
    })
    localStorage.setItem(STORAGE_KEY, json)
  } catch {
    // localStorage may be unavailable (e.g., in iframe sandbox)
  }
}

export function loadFromLocalStorage(): Partial<UserInputs> | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return null
    return JSON.parse(json, (_key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value)
      }
      return value
    })
  } catch {
    return null
  }
}
