import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { probeConnection, setNetworkListener } from '../services/networkStatus'

type NetworkContextValue = {
  isOffline: boolean
  retryConnection: () => Promise<boolean>
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

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

export const useNetwork = () => {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider')
  return ctx
}
