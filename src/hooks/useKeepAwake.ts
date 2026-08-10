import { useEffect } from 'react'

import { setKeepAwake } from '../services/keepAwake'

/** Keeps the screen awake while `enabled` (e.g. during recording / camera sessions). */
export function useKeepAwake(enabled: boolean) {
  useEffect(() => {
    setKeepAwake(enabled)
    return () => setKeepAwake(false)
  }, [enabled])
}
