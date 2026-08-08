import { API_BASE_URLS } from '../../config'
import type { AppLanguage } from '../i18n/translations'

import { toUploadUri } from './mic'

export type SpeechToTextResult = {
  language?: string
  roman_urdu?: string
  text?: string
}

export type SpeechToSignResult = {
  detected_language?: string
  language?: string
  roman_urdu?: string
  text?: string
  found?: boolean
  video?: string
  message?: string
}

const audioFile = (uri: string) =>
  ({
    uri: toUploadUri(uri),
    name: 'recording.m4a',
    type: 'audio/m4a',
  }) as any

export class SpeechApiError extends Error {
  constructor(
    message: string,
    public kind: 'network' | 'server' | 'empty' = 'server',
  ) {
    super(message)
  }
}

async function postTranscribe<T>(base: string, uri: string, language: AppLanguage): Promise<T> {
  const formData = new FormData()
  formData.append('file', audioFile(uri))
  formData.append('language', language)

  let res: Response
  try {
    res = await fetch(`${base}/transcribe`, { method: 'POST', body: formData })
  } catch {
    throw new SpeechApiError('Could not reach the server. Check your connection.', 'network')
  }

  let data: T
  try {
    data = (await res.json()) as T
  } catch {
    throw new SpeechApiError('The server returned an unexpected response.', 'server')
  }

  if (!res.ok) {
    throw new SpeechApiError('Transcription failed. Please try again.', 'server')
  }

  return data
}

export const transcribeSpeechToText = (uri: string, language: AppLanguage) =>
  postTranscribe<SpeechToTextResult>(API_BASE_URLS.speechToText, uri, language)

export const transcribeSpeechToSign = (uri: string, language: AppLanguage) =>
  postTranscribe<SpeechToSignResult>(API_BASE_URLS.speechToSign, uri, language)

export function displaySpeechText(result: { language?: string; detected_language?: string; roman_urdu?: string; text?: string }): string {
  const lang = result.detected_language || result.language
  const value = lang === 'ur' ? result.roman_urdu || result.text : result.text || result.roman_urdu
  return (value || '').trim()
}

export function signVideoUrl(path?: string): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URLS.speechToSign}${path}`
}
