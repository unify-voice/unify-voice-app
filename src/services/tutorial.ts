import AsyncStorage from '@react-native-async-storage/async-storage'

import { STORAGE_KEYS } from '../config/storageKeys'

export async function hasCompletedTutorial(uid: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.tutorial(uid))) === '1'
  } catch {
    return false
  }
}

export async function markTutorialComplete(uid: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.tutorial(uid), '1')
}
