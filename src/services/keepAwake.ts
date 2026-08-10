/** Thin bridge to the KeepAwake native module (no-op until the app is rebuilt with it). */
import { NativeModules } from 'react-native'

type KeepAwakeNative = {
  setEnabled?: (enabled: boolean) => void
}

const native = NativeModules.KeepAwake as KeepAwakeNative | undefined

/** Keep the screen on while recording or processing. */
export function setKeepAwake(enabled: boolean) {
  try {
    native?.setEnabled?.(enabled)
  } catch {
    // optional native module — no-op if missing until the next native rebuild
  }
}
