import type { UserInputs } from '../lib/types'

const STORAGE_KEY = 'apa2118_inputs'
const URL_PARAM = 'd'

export function encodeToURL(inputs: Partial<UserInputs>): string {
  try {
    const serializable = JSON.parse(JSON.stringify(inputs, (_key, value) => {
      if (value instanceof Date) return { __type: 'Date', value: value.toISOString() }
      return value
    }))
    const json = JSON.stringify(serializable)
    const encoded = btoa(encodeURIComponent(json))
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
    const json = decodeURIComponent(atob(encoded))
    const parsed = JSON.parse(json, (_key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value)
      }
      return value
    })
    return parsed
  } catch {
    return null
  }
}

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
