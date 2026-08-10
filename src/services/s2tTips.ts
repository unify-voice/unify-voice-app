/** Persist dismissal of the one-time Sign-to-Text tips sheet. */
import AsyncStorage from '@react-native-async-storage/async-storage'

import { STORAGE_KEYS } from '../config/storageKeys'

export async function hasDismissedS2tTips(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.s2tTipsDismissed)) === '1'
  } catch {
    return false
  }
}

export async function dismissS2tTips(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.s2tTipsDismissed, '1')
}
