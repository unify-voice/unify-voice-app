import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { STORAGE_KEYS } from '../config/storageKeys'
import type { AppLanguage } from '../i18n/translations'
import { configureFeedback } from '../services/feedback'

import { useLanguage } from './Language'

const readFlag = async (key: string, fallback: boolean) => {
  try {
    const stored = await AsyncStorage.getItem(key)
    if (stored === '0') return false
    if (stored === '1') return true
  } catch {
    // keep fallback
  }
  return fallback
}

type PreferencesContextValue = {
  conversionLang: AppLanguage
  setConversionLang: (lang: AppLanguage) => Promise<void>
  hapticsEnabled: boolean
  setHapticsEnabled: (on: boolean) => Promise<void>
  soundCuesEnabled: boolean
  setSoundCuesEnabled: (on: boolean) => Promise<void>
  isReady: boolean
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

/** Persists conversion language, haptics, and sound cues; wires feedback config. */
export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage()
  const [conversionLang, setConversionLangState] = useState<AppLanguage>('en')
  const [hapticsEnabled, setHapticsState] = useState(true)
  const [soundCuesEnabled, setSoundState] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    configureFeedback({ haptics: hapticsEnabled, sound: soundCuesEnabled })
  }, [hapticsEnabled, soundCuesEnabled])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [storedLang, haptics, sound] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.conversionLang),
          readFlag(STORAGE_KEYS.haptics, true),
          readFlag(STORAGE_KEYS.soundCues, true),
        ])
        if (!mounted) return
        if (storedLang === 'en' || storedLang === 'ur') setConversionLangState(storedLang)
        else setConversionLangState(language)
        setHapticsState(haptics)
        setSoundState(sound)
      } catch {
        if (mounted) setConversionLangState(language)
      } finally {
        if (mounted) setIsReady(true)
      }
    })()
    return () => {
      mounted = false
    }
    // language is only a first-run fallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setConversionLang = useCallback(async (lang: AppLanguage) => {
    setConversionLangState(lang)
    await AsyncStorage.setItem(STORAGE_KEYS.conversionLang, lang)
  }, [])

  const setHapticsEnabled = useCallback(async (on: boolean) => {
    setHapticsState(on)
    await AsyncStorage.setItem(STORAGE_KEYS.haptics, on ? '1' : '0')
  }, [])

  const setSoundCuesEnabled = useCallback(async (on: boolean) => {
    setSoundState(on)
    await AsyncStorage.setItem(STORAGE_KEYS.soundCues, on ? '1' : '0')
  }, [])

  const value = useMemo(
    () => ({
      conversionLang,
      setConversionLang,
      hapticsEnabled,
      setHapticsEnabled,
      soundCuesEnabled,
      setSoundCuesEnabled,
      isReady,
    }),
    [conversionLang, setConversionLang, hapticsEnabled, setHapticsEnabled, soundCuesEnabled, setSoundCuesEnabled, isReady],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

/** Conversion/feedback prefs; must be under `PreferencesProvider`. */
export const usePreferences = () => {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
