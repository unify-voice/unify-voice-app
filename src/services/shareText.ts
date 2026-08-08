import { Clipboard, Share } from 'react-native'

export async function copyText(text: string): Promise<boolean> {
  const value = text.trim()
  if (!value) return false
  try {
    Clipboard.setString(value)
    return true
  } catch {
    return false
  }
}

export async function shareText(text: string, title = 'Unify Voice'): Promise<void> {
  const value = text.trim()
  if (!value) return
  await Share.share({ title, message: value })
}
