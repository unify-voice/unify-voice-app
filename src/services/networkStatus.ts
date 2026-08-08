import { API_BASE_URLS } from '../../config'

type Listener = (offline: boolean) => void

let listener: Listener | null = null

export const setNetworkListener = (next: Listener | null) => {
  listener = next
}

export const reportOffline = () => listener?.(true)
export const reportOnline = () => listener?.(false)

export async function probeConnection(): Promise<boolean> {
  try {
    await fetch(API_BASE_URLS.speechToText, { method: 'HEAD' })
    reportOnline()
    return true
  } catch {
    try {
      await fetch(API_BASE_URLS.speechToText)
      reportOnline()
      return true
    } catch {
      reportOffline()
      return false
    }
  }
}
