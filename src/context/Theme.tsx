import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ColorSchemeName, StatusBar, useColorScheme } from 'react-native'

import { STORAGE_KEYS } from '../config/storageKeys'
import { darkColors, getInputTheme, lightColors, type ThemeColors } from '../theme/colors'

export type ThemeMode = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  mode: ThemeMode
  isDark: boolean
  colors: ThemeColors
  inputTheme: ReturnType<typeof getInputTheme>
  setMode: (mode: ThemeMode) => void
  toggleDark: () => void
  isReady: boolean
}

const STORAGE_KEY = STORAGE_KEYS.themeMode

const ThemeContext = createContext<ThemeContextValue | null>(null)

const resolveIsDark = (mode: ThemeMode, systemScheme: ColorSchemeName) => {
  if (mode === 'system') return systemScheme !== 'light'
  return mode === 'dark'
}

/** Persists light/dark/system preference and exposes the active palette + StatusBar sync. */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('light')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (mounted && (stored === 'light' || stored === 'dark' || stored === 'system')) {
          setModeState(stored)
        }
      } catch {
        // keep default light
      } finally {
        if (mounted) setIsReady(true)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {})
  }, [])

  const isDark = resolveIsDark(mode, systemScheme)
  const palette = isDark ? darkColors : lightColors

  const toggleDark = useCallback(() => {
    setMode(isDark ? 'light' : 'dark')
  }, [isDark, setMode])

  const inputTheme = useMemo(() => getInputTheme(palette), [palette])

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true)
    if (typeof StatusBar.setBackgroundColor === 'function') {
      StatusBar.setBackgroundColor(palette.background, true)
    }
  }, [isDark, palette.background])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark,
      colors: palette,
      inputTheme,
      setMode,
      toggleDark,
      isReady,
    }),
    [mode, isDark, palette, inputTheme, setMode, toggleDark, isReady],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Theme tokens and mode setters; must be under `ThemeProvider`. */
export const useAppTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider')
  }
  return ctx
}
