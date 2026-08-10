/**
 * Lightweight online/offline signal for the OfflineBanner.
 * Driven by API fetch success/failure (not NetInfo).
 */
import { API_BASE_URLS } from '../../config'

type Listener = (offline: boolean) => void

let listener: Listener | null = null

/** Register (or clear) the single UI listener for connectivity changes. */
export const setNetworkListener = (next: Listener | null) => {
  listener = next
}

export const reportOffline = () => listener?.(true)
export const reportOnline = () => listener?.(false)

/**
 * Probe Speech-to-Text host reachability.
 * Any HTTP response means TLS/DNS worked; only transport failures count as offline.
 */
export async function probeConnection(): Promise<boolean> {
  try {
    await fetch(API_BASE_URLS.speechToText, { method: 'GET' })
    reportOnline()
    return true
  } catch {
    reportOffline()
    return false
  }
}
