import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getCachedAvatar } from '../services/avatar'

type AuthUserContextValue = {
  user: FirebaseAuthTypes.User | null
  displayName: string
  email: string | null
  photoURL: string | null
  refreshUser: () => Promise<void>
  setLocalPhotoURL: (uri: string | null) => void
}

const snapshot = (user: FirebaseAuthTypes.User | null, photoOverride?: string | null) => ({
  user,
  displayName: user?.displayName?.trim() || 'User',
  email: user?.email ?? null,
  photoURL: photoOverride !== undefined ? photoOverride : user?.photoURL || null,
})

const AuthUserContext = createContext<AuthUserContextValue | null>(null)

export const AuthUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState(() => snapshot(auth().currentUser))

  const applyUser = useCallback(async (user: FirebaseAuthTypes.User | null) => {
    if (!user) {
      setState(snapshot(null))
      return
    }
    const cached = await getCachedAvatar(user.uid)
    setState(snapshot(user, cached || user.photoURL))
  }, [])

  const setLocalPhotoURL = useCallback((uri: string | null) => {
    setState((prev) => ({ ...prev, photoURL: uri }))
  }, [])

  const refreshUser = useCallback(async () => {
    const current = auth().currentUser
    if (!current) {
      await applyUser(null)
      return
    }
    try {
      await current.reload()
    } catch {
      // still publish whatever the SDK currently has
    }
    await applyUser(auth().currentUser)
  }, [applyUser])

  useEffect(() => {
    const unsubAuth = auth().onAuthStateChanged((user) => {
      void applyUser(user)
    })
    const unsubToken = auth().onIdTokenChanged((user) => {
      void applyUser(user)
    })
    return () => {
      unsubAuth()
      unsubToken()
    }
  }, [applyUser])

  const value = useMemo(
    () => ({
      ...state,
      refreshUser,
      setLocalPhotoURL,
    }),
    [state, refreshUser, setLocalPhotoURL],
  )

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

export const useAuthUser = () => {
  const ctx = useContext(AuthUserContext)
  if (!ctx) throw new Error('useAuthUser must be used within AuthUserProvider')
  return ctx
}
