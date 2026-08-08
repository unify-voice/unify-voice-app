import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { STORAGE_KEYS } from '../config/storageKeys'
import type { AppLanguage } from '../i18n/translations'

import { useLanguage } from './Language'

type PreferencesContextValue = {
  conversionLang: AppLanguage
  setConversionLang: (lang: AppLanguage) => Promise<void>
  isReady: boolean
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage()
  const [conversionLang, setConversionLangState] = useState<AppLanguage>('en')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.conversionLang)
        if (!mounted) return
        if (stored === 'en' || stored === 'ur') {
          setConversionLangState(stored)
        } else {
          setConversionLangState(language)
        }
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

  const value = useMemo(
    () => ({
      conversionLang,
      setConversionLang,
      isReady,
    }),
    [conversionLang, setConversionLang, isReady],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
