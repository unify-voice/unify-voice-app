import { API_BASE_URLS } from '../../config'
import { normalizeConfidence, normalizeSignLabel } from '../constants/signToTextVocab'

import { toUploadUri } from './mic'
import { reportOffline, reportOnline } from './networkStatus'
import { SpeechApiError } from './speechApi'

export type SignPrediction = {
  word: string
  confidence: number
}

const mimeForPath = (path: string) => {
  const lower = path.toLowerCase()
  if (lower.endsWith('.mov')) return 'video/quicktime'
  if (lower.endsWith('.webm')) return 'video/webm'
  if (lower.endsWith('.mkv')) return 'video/x-matroska'
  if (lower.endsWith('.avi')) return 'video/x-msvideo'
  return 'video/mp4'
}

const fileNameForPath = (path: string) => {
  const base = path.split('/').pop() || 'sign.mp4'
  const clean = base.split('?')[0]
  return /\.[a-z0-9]+$/i.test(clean) ? clean : 'sign.mp4'
}

const messageFromBody = (raw: string, status: number): string => {
  if (status === 413 || /413|entity too large|too large/i.test(raw)) {
    return 'This clip is larger than the Sign to Text server allows (about 1 MB). Raise nginx client_max_body_size, or record a shorter clip.'
  }
  if (status === 504 || /gateway time/i.test(raw)) {
    return 'The Sign to Text server took too long to analyse this clip. Try a shorter sign, or raise nginx proxy_read_timeout.'
  }
  if (status === 502 || /bad gateway/i.test(raw)) {
    return 'The Sign to Text API is not running or crashed. Restart the FastAPI/uvicorn service behind nginx, then try again.'
  }

  try {
    const data = JSON.parse(raw) as { error?: unknown; detail?: unknown; message?: unknown }
    if (typeof data.error === 'string' && data.error.trim()) return data.error
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail
    if (Array.isArray(data.detail)) {
      const parts = data.detail
        .map((item) => (item && typeof item === 'object' && 'msg' in item ? String((item as { msg?: unknown }).msg || '') : ''))
        .filter(Boolean)
      if (parts.length) return parts.join(' ')
    }
  } catch {
    // not JSON — nginx/html/empty
  }

  if (!raw.trim()) return `The server returned an empty response (${status}).`
  return `Prediction failed (${status}). Please try again.`
}

export async function predictSignVideo(videoPath: string): Promise<SignPrediction[]> {
  const formData = new FormData()
  const uri = toUploadUri(videoPath)
  formData.append('video', {
    uri,
    type: mimeForPath(videoPath),
    name: fileNameForPath(videoPath),
  } as any)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URLS.signToText}/predict`, { method: 'POST', body: formData })
    reportOnline()
  } catch {
    reportOffline()
    throw new SpeechApiError('Could not reach the server. Check your connection.', 'network')
  }

  const raw = await res.text()
  let data: { error?: string; predictions?: SignPrediction[] } | null = null
  try {
    data = raw ? (JSON.parse(raw) as { error?: string; predictions?: SignPrediction[] }) : null
  } catch {
    throw new SpeechApiError(messageFromBody(raw, res.status), 'server')
  }

  if (!res.ok || data?.error || !data) {
    throw new SpeechApiError(messageFromBody(raw, res.status), 'server')
  }

  const preds = Array.isArray(data.predictions) ? data.predictions : []
  const seen = new Set<string>()
  return preds
    .filter((p) => p && typeof p.word === 'string' && p.word.trim())
    .map((p) => ({
      word: p.word.trim(),
      confidence: normalizeConfidence(typeof p.confidence === 'number' ? p.confidence : 0),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .filter((p) => {
      const key = normalizeSignLabel(p.word)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 3)
}
