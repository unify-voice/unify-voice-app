import { Platform } from 'react-native'
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions'

export async function ensureMicrophonePermission(): Promise<'granted' | 'denied' | 'blocked'> {
  const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO

  const current = await check(permission)
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) return 'granted'
  if (current === RESULTS.UNAVAILABLE) return 'denied'
  if (current === RESULTS.BLOCKED) return 'blocked'

  const next = await request(permission)
  if (next === RESULTS.GRANTED || next === RESULTS.LIMITED) return 'granted'
  if (next === RESULTS.BLOCKED) return 'blocked'
  return 'denied'
}

export async function openAppSettings(): Promise<void> {
  await openSettings()
}

export function toUploadUri(path: string): string {
  if (!path) return path
  if (path.startsWith('file://') || path.startsWith('content://') || path.startsWith('ph://')) return path
  return `file://${path}`
}
