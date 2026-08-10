/**
 * System share / clipboard helpers.
 * Speech-to-Sign prefers the native ShareMedia module so text + video ship together.
 */
import { Clipboard, NativeModules, Platform, Share } from 'react-native'

type ShareMediaNative = {
  share?: (options: { text?: string; url?: string; title?: string }) => Promise<boolean>
}

/** Copy trimmed text to the clipboard. Returns false for empty input. */
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

/** Share plain text via the system sheet. */
export async function shareText(text: string, title = 'Unify Voice'): Promise<void> {
  await shareResult({ text, title })
}

/**
 * Share conversion output. When `videoUrl` is set, downloads/attaches the clip on
 * native (ShareMedia) or falls back to Share / text+URL.
 */
export async function shareResult(opts: {
  text?: string
  videoUrl?: string | null
  title?: string
}): Promise<void> {
  const text = (opts.text || '').trim()
  const videoUrl = (opts.videoUrl || '').trim()
  const title = opts.title || 'Unify Voice'
  if (!text && !videoUrl) return

  const native = NativeModules.ShareMedia as ShareMediaNative | undefined
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
