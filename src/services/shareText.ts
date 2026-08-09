import { Clipboard, NativeModules, Platform, Share } from 'react-native'

type ShareMediaNative = {
  share?: (options: { text?: string; url?: string; title?: string }) => Promise<boolean>
}

const native = NativeModules.ShareMedia as ShareMediaNative | undefined

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
  await shareResult({ text, title })
}

export async function shareResult(opts: {
  text?: string
  videoUrl?: string | null
  title?: string
}): Promise<void> {
  const text = (opts.text || '').trim()
  const videoUrl = (opts.videoUrl || '').trim()
  const title = opts.title || 'Unify Voice'
  if (!text && !videoUrl) return

  if (videoUrl && native?.share) {
    await native.share({ text, url: videoUrl, title })
    return
  }

  if (videoUrl && Platform.OS === 'ios') {
    await Share.share({ title, message: text || undefined, url: videoUrl })
    return
  }

  const message = videoUrl ? (text ? `${text}\n${videoUrl}` : videoUrl) : text
  if (message) await Share.share({ title, message })
}
