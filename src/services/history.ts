import AsyncStorage from '@react-native-async-storage/async-storage'
import auth from '@react-native-firebase/auth'

import { STORAGE_KEYS } from '../config/storageKeys'
import type { AppLanguage } from '../i18n/translations'

export type ConversionType = 'speech-to-text' | 'speech-to-sign' | 'sign-to-text'

export type HistoryItem = {
  id: string
  type: ConversionType
  createdAt: number
  text: string
  status: 'success' | 'unsupported'
  videoUrl?: string
  conversionLang: AppLanguage
  confidence?: number
}

const MAX_ITEMS = 50

const currentUid = () => auth().currentUser?.uid ?? null

async function migrateLegacyHistory(uid: string): Promise<void> {
  try {
    const key = STORAGE_KEYS.history(uid)
    const [existing, legacy] = await Promise.all([
      AsyncStorage.getItem(key),
      AsyncStorage.getItem(STORAGE_KEYS.historyLegacy),
    ])
    if (!legacy) return
    if (!existing) {
      await AsyncStorage.setItem(key, legacy)
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.historyLegacy)
  } catch {
    // keep per-user reads working even if migration fails
  }
}

async function historyKey(): Promise<string | null> {
  const uid = currentUid()
  if (!uid) return null
  await migrateLegacyHistory(uid)
  return STORAGE_KEYS.history(uid)
}

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const key = await historyKey()
    if (!key) return []
    const raw = await AsyncStorage.getItem(key)
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
  const key = await historyKey()
  if (!key) return entry
  const current = await loadHistory()
  const next = [entry, ...current].slice(0, MAX_ITEMS)
  await AsyncStorage.setItem(key, JSON.stringify(next))
  return entry
}

export async function updateHistoryItem(
  id: string,
  patch: Partial<Pick<HistoryItem, 'text' | 'status' | 'confidence'>>,
): Promise<void> {
  const key = await historyKey()
  if (!key) return
  const current = await loadHistory()
  const next = current.map((item) => (item.id === id ? { ...item, ...patch } : item))
  await AsyncStorage.setItem(key, JSON.stringify(next))
}

export async function clearHistory(): Promise<void> {
  const uid = currentUid()
  if (uid) await clearUserHistory(uid)
}

export async function clearUserHistory(uid: string): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.history(uid))
}

export function historyTypeKey(type: ConversionType): string {
  if (type === 'speech-to-text') return 'activity.speechToText'
  if (type === 'speech-to-sign') return 'activity.speechToSign'
  return 'activity.signToText'
}

export function startOfLocalWeek(now = new Date()): number {
  const d = new Date(now)
  const day = d.getDay()
  const mondayOffset = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - mondayOffset)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function countHistoryThisWeek(items: HistoryItem[]): number {
  const from = startOfLocalWeek()
  return items.filter((item) => item.createdAt >= from).length
}

export type WeekDayStat = {
  index: number
  startMs: number
  count: number
  isToday: boolean
}

const DAY_MS_KEYS = ['home.day.mon', 'home.day.tue', 'home.day.wed', 'home.day.thu', 'home.day.fri', 'home.day.sat', 'home.day.sun'] as const

export function weekDayLabelKey(index: number): string {
  return DAY_MS_KEYS[index] ?? DAY_MS_KEYS[0]
}

export function weekDayStats(items: HistoryItem[], now = new Date()): WeekDayStat[] {
  const weekStart = startOfLocalWeek(now)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()

  return Array.from({ length: 7 }, (_, i) => {
    const start = new Date(weekStart)
    start.setDate(start.getDate() + i)
    start.setHours(0, 0, 0, 0)
    const startMs = start.getTime()
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    const count = items.filter((item) => item.createdAt >= startMs && item.createdAt < end.getTime()).length
    return { index: i, startMs, count, isToday: startMs === todayMs }
  })
}
