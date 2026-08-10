import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { probeConnection, setNetworkListener } from '../services/networkStatus'

type NetworkContextValue = {
  isOffline: boolean
  retryConnection: () => Promise<boolean>
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

/** Subscribes to backend reachability probes for the offline banner. */
export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setNetworkListener(setIsOffline)
    void probeConnection()
    return () => setNetworkListener(null)
  }, [])

  const retryConnection = useCallback(() => probeConnection(), [])

  const value = useMemo(() => ({ isOffline, retryConnection }), [isOffline, retryConnection])

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

/** Offline flag and manual retry; must be under `NetworkProvider`. */
export const useNetwork = () => {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider')
  return ctx
}
