/**
 * Speech-to-Text and Speech-to-Sign HTTP client.
 * Posts audio + conversion `language` (`en` | `ur`) to each module's `/transcribe` endpoint.
 */
import { API_BASE_URLS } from '../../config'
import type { AppLanguage } from '../i18n/translations'

import { toUploadUri } from './mic'
import { reportOffline, reportOnline } from './networkStatus'

export type SpeechToTextResult = {
  success?: boolean
  text?: string
  language?: string
  detected_language?: string
  preferred_language?: string
}

export type SpeechToSignResult = {
  detected_language?: string
  language?: string
  preferred_language?: string
  roman_urdu?: string
  text?: string
  found?: boolean
  video?: string
  message?: string
}

type TranscribeErrorBody = {
  detail?:
    | string
    | {
        error?: string
        message?: string
        detected_language?: string
        preferred_language?: string
      }
}

/** RN FormData file part for multipart upload. */
const audioFile = (uri: string) =>
  ({
    uri: toUploadUri(uri),
    name: 'recording.m4a',
    type: 'audio/m4a',
  }) as any

/** Typed error so screens can distinguish network vs server failures. */
export class SpeechApiError extends Error {
  constructor(
    message: string,
    public kind: 'network' | 'server' | 'empty' = 'server',
  ) {
    super(message)
  }
}

/** Prefer FastAPI `detail.message` (or string detail) over a generic fallback. */
const messageFromDetail = (data: TranscribeErrorBody | null, fallback: string): string => {
  const detail = data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail
  if (detail && typeof detail === 'object' && typeof detail.message === 'string' && detail.message.trim()) {
    return detail.message
  }
  return fallback
}

async function postTranscribe<T>(base: string, uri: string, language: AppLanguage): Promise<T> {
  const formData = new FormData()
  formData.append('file', audioFile(uri))
  formData.append('language', language)

  let res: Response
  try {
    res = await fetch(`${base}/transcribe`, { method: 'POST', body: formData })
    reportOnline()
  } catch {
    reportOffline()
    throw new SpeechApiError('Could not reach the server. Check your connection.', 'network')
  }

  let data: T & TranscribeErrorBody
  try {
    data = (await res.json()) as T & TranscribeErrorBody
  } catch {
    throw new SpeechApiError('The server returned an unexpected response.', 'server')
  }

  if (!res.ok) {
    throw new SpeechApiError(messageFromDetail(data, 'Transcription failed. Please try again.'), 'server')
  }

  return data
}

/** Transcribe speech for the Speech-to-Text module. */
export const transcribeSpeechToText = (uri: string, language: AppLanguage) =>
  postTranscribe<SpeechToTextResult>(API_BASE_URLS.speechToText, uri, language)

/** Transcribe speech and resolve a supported sign clip for Speech-to-Sign. */
export const transcribeSpeechToSign = (uri: string, language: AppLanguage) =>
  postTranscribe<SpeechToSignResult>(API_BASE_URLS.speechToSign, uri, language)

/**
 * User-facing transcript text.
 * Prefers `text`; never falls back to Roman Urdu when conversion language is `ur`.
 */
export function displaySpeechText(
  result: { text?: string; roman_urdu?: string },
  lang?: AppLanguage,
): string {
  const text = (result.text || '').trim()
  if (text) return text
  if (lang === 'ur') return ''
  return (result.roman_urdu || '').trim()
}

/** Absolute URL for a sign video path returned by the STS API. */
export function signVideoUrl(path?: string): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URLS.speechToSign}${path}`
}
