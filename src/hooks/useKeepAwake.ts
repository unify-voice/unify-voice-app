import { useEffect } from 'react'

import { setKeepAwake } from '../services/keepAwake'

export function useKeepAwake(enabled: boolean) {
  useEffect(() => {
    setKeepAwake(enabled)
    return () => setKeepAwake(false)
  }, [enabled])
}
