import AsyncStorage from '@react-native-async-storage/async-storage'
import storage from '@react-native-firebase/storage'
import { Platform } from 'react-native'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'

const cacheKey = (uid: string) => `@unifyvoice/avatar/${uid}`

export const toDataUri = (base64: string, mime = 'image/jpeg') => {
  const clean = base64.includes(',') ? base64.split(',').pop()! : base64
  return `data:${mime};base64,${clean}`
}

export async function getCachedAvatar(uid: string): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(cacheKey(uid))) || null
  } catch {
    return null
  }
}

export async function setCachedAvatar(uid: string, uri: string): Promise<void> {
  await AsyncStorage.setItem(cacheKey(uid), uri)
}

export async function clearCachedAvatar(uid: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKey(uid))
}

export async function ensurePhotoLibraryPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
    if (status === RESULTS.DENIED) {
      await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
    }
    // PHPicker still works without full library access
    return true
  }

  const permission =
    Number(Platform.Version) >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE

  const current = await check(permission)
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED || current === RESULTS.UNAVAILABLE) {
    return true
  }
  const next = await request(permission)
  return next === RESULTS.GRANTED || next === RESULTS.LIMITED || next === RESULTS.UNAVAILABLE
}

export function mapStorageError(err: unknown): string {
  const code = (err as { code?: string })?.code || ''
  const message = (err as { message?: string })?.message || ''

  if (code === 'storage/unauthorized' || message.toLowerCase().includes('unauthorized')) {
    return 'Firebase Storage denied the upload. In Firebase Console → Storage → Rules, allow authenticated writes to avatars/{userId}.jpg (see storage.rules in the project).'
  }
  if (code === 'storage/unauthenticated') {
    return 'You need to be signed in to upload a profile photo.'
  }
  if (code === 'storage/object-not-found' || code === 'storage/bucket-not-found' || code === 'storage/project-not-found') {
    return 'Firebase Storage is not enabled or the bucket is missing. Enable Storage in the Firebase Console.'
  }
  if (code === 'storage/retry-limit-exceeded' || code === 'storage/canceled') {
    return 'Upload timed out. Check your connection and try again.'
  }
  if (message.includes('No Firebase App') || message.toLowerCase().includes('native module')) {
    return 'Storage native module is unavailable. Rebuild the iOS/Android app after installing Firebase Storage.'
  }
  return message || 'Could not upload photo. Try again.'
}

async function readUriAsBase64(uri: string): Promise<string | null> {
  try {
    const res = await fetch(uri)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = typeof reader.result === 'string' ? reader.result : ''
        const data = result.includes(',') ? result.split(',').pop()! : result
        resolve(data || null)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function uploadAvatarImage(uid: string, base64: string, mime = 'image/jpeg'): Promise<string> {
  const clean = base64.includes(',') ? base64.split(',').pop()! : base64
  const contentType = mime.startsWith('image/') ? mime : 'image/jpeg'
  const ref = storage().ref(`avatars/${uid}.jpg`)
  await ref.putString(clean, 'base64', { contentType })
  return ref.getDownloadURL()
}

export async function uploadAvatarFromAsset(
  uid: string,
  asset: { base64?: string; uri?: string; type?: string },
): Promise<{ preview: string; remoteUrl: string }> {
  const mime = asset.type?.startsWith('image/') ? asset.type : 'image/jpeg'
  let base64 = asset.base64 || null
  if (!base64 && asset.uri) {
    base64 = await readUriAsBase64(asset.uri)
  }

  const preview = base64 ? toDataUri(base64, mime) : asset.uri || ''
  if (!preview) {
    throw new Error('No image data returned from the picker.')
  }

  if (base64) {
    const remoteUrl = await uploadAvatarImage(uid, base64, mime)
    return { preview, remoteUrl }
  }

  const ref = storage().ref(`avatars/${uid}.jpg`)
  const uri = asset.uri!
  try {
    await ref.putFile(uri)
  } catch {
    const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri
    await ref.putFile(path)
  }
  return { preview, remoteUrl: await ref.getDownloadURL() }
}
