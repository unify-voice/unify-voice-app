import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ColorSchemeName, StatusBar, useColorScheme } from 'react-native'

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

const STORAGE_KEY = '@unifyvoice/theme-mode'

const ThemeContext = createContext<ThemeContextValue | null>(null)

const resolveIsDark = (mode: ThemeMode, systemScheme: ColorSchemeName) => {
  if (mode === 'system') return systemScheme !== 'light'
  return mode === 'dark'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('dark')
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
        // keep default dark
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

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider')
  }
  return ctx
}
