import { NativeModules } from 'react-native'

type KeepAwakeNative = {
  setEnabled?: (enabled: boolean) => void
}

const native = NativeModules.KeepAwake as KeepAwakeNative | undefined

export function setKeepAwake(enabled: boolean) {
  try {
    native?.setEnabled?.(enabled)
  } catch {
    // optional native module — no-op if missing until the next native rebuild
  }
}
