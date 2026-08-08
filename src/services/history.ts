import AsyncStorage from '@react-native-async-storage/async-storage'

import { STORAGE_KEYS } from '../config/storageKeys'
import type { AppLanguage } from '../i18n/translations'

export type ConversionType = 'speech-to-text' | 'speech-to-sign'

export type HistoryItem = {
  id: string
  type: ConversionType
  createdAt: number
  text: string
  status: 'success' | 'unsupported'
  videoUrl?: string
  conversionLang: AppLanguage
}

const MAX_ITEMS = 50

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.history)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function addHistoryItem(item: Omit<HistoryItem, 'id' | 'createdAt'>): Promise<HistoryItem> {
  const entry: HistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  }
  const current = await loadHistory()
  const next = [entry, ...current].slice(0, MAX_ITEMS)
  await AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next))
  return entry
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.history)
}
