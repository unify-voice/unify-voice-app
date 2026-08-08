import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { I18nManager } from 'react-native'

import { AppLanguage, translate } from '../i18n/translations'

type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => Promise<void>
  t: (key: string) => string
  isReady: boolean
  isRTL: boolean
}

const STORAGE_KEY = '@unifyvoice/language'

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>('en')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (mounted && (stored === 'en' || stored === 'ur')) {
          setLanguageState(stored)
          const rtl = stored === 'ur'
          if (I18nManager.isRTL !== rtl) {
            I18nManager.allowRTL(rtl)
            I18nManager.forceRTL(rtl)
          }
        }
      } catch {
        // keep English
      } finally {
        if (mounted) setIsReady(true)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    setLanguageState(lang)
    await AsyncStorage.setItem(STORAGE_KEY, lang)
    const rtl = lang === 'ur'
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl)
      I18nManager.forceRTL(rtl)
      // Direction changes fully apply after reload; strings update immediately.
    }
  }, [])

  const t = useCallback((key: string) => translate(language, key), [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      isReady,
      isRTL: language === 'ur',
    }),
    [language, setLanguage, t, isReady],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
