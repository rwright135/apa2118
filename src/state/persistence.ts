import type { UserInputs, AdvancedPostJCBA } from '../lib/types'

const STORAGE_KEY = 'apa2118_inputs'
const URL_PARAM = 'd'

// ── helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_SCENARIO_C_PENALTY = 0.15

/** True when advancedPostJCBA matches the out-of-box default (no user customisation needed). */
function isDefaultAdvanced(adv: AdvancedPostJCBA): boolean {
  return adv.scenarioCPenalty === DEFAULT_SCENARIO_C_PENALTY
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

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage may be unavailable
  }
}

/** Strip the shared-link `?d=` param from the address bar without a navigation. */
function clearURLParam(): void {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(URL_PARAM)) return
    url.searchParams.delete(URL_PARAM)
    window.history.replaceState(null, '', url.toString())
  } catch {
    // history API may be unavailable (e.g. some sandboxed iframes)
  }
}

function clearSessionStorage(): void {
  try {
    sessionStorage.clear()
  } catch {
    // sessionStorage may be unavailable
  }
}

/** Best-effort clear of any cookies scoped to this page — the app itself sets
 *  none, but third-party embeds/analytics loaded on the page might. */
function clearCookies(): void {
  try {
    if (!document.cookie) return
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0]?.trim()
      if (!name) continue
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  } catch {
    // document.cookie may be unavailable (e.g. sandboxed iframe)
  }
}

/**
 * Full "hard reset" — clears every place a previous session could be hiding:
 * the app's localStorage key, any lingering `?d=` share-link param in the
 * URL bar, sessionStorage, and cookies. Clearing localStorage alone isn't
 * enough: if the page was opened from (or a Share link later populated) a
 * `?d=` URL, that encoded state survives a soft in-app reset and silently
 * re-hydrates the wizard on the next reload — which looks like "reset
 * randomly stops working" to a user.
 */
export function clearAllStoredData(): void {
  clearLocalStorage()
  clearURLParam()
  clearSessionStorage()
  clearCookies()
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
