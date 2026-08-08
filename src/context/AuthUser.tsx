import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type AuthUserContextValue = {
  user: FirebaseAuthTypes.User | null
  displayName: string
  email: string | null
  photoURL: string | null
  refreshUser: () => Promise<void>
}

const snapshot = (user: FirebaseAuthTypes.User | null) => ({
  user,
  displayName: user?.displayName?.trim() || 'User',
  email: user?.email ?? null,
  photoURL: user?.photoURL ?? null,
})

const AuthUserContext = createContext<AuthUserContextValue | null>(null)

export const AuthUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState(() => snapshot(auth().currentUser))

  const applyUser = useCallback((user: FirebaseAuthTypes.User | null) => {
    setState(snapshot(user))
  }, [])

  const refreshUser = useCallback(async () => {
    const current = auth().currentUser
    if (!current) {
      applyUser(null)
      return
    }
    try {
      await current.reload()
    } catch {
      // still publish whatever the SDK currently has
    }
    applyUser(auth().currentUser)
  }, [applyUser])

  useEffect(() => {
    const unsubAuth = auth().onAuthStateChanged((user) => applyUser(user))
    const unsubToken = auth().onIdTokenChanged((user) => applyUser(user))
    return () => {
      unsubAuth()
      unsubToken()
    }
  }, [applyUser])

  const value = useMemo(
    () => ({
      ...state,
      refreshUser,
    }),
    [state, refreshUser],
  )

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

export const useAuthUser = () => {
  const ctx = useContext(AuthUserContext)
  if (!ctx) throw new Error('useAuthUser must be used within AuthUserProvider')
  return ctx
}
