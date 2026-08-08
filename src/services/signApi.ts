import { API_BASE_URLS } from '../../config'

import { reportOffline, reportOnline } from './networkStatus'
import { SpeechApiError } from './speechApi'

export type SignPrediction = {
  word: string
  confidence: number
}

export async function predictSignVideo(videoPath: string): Promise<SignPrediction[]> {
  const formData = new FormData()
  const uri = videoPath.startsWith('file://') ? videoPath : `file://${videoPath}`
  formData.append('video', {
    uri,
    type: 'video/mp4',
    name: 'sign.mp4',
  } as any)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URLS.signToText}/predict`, { method: 'POST', body: formData })
    reportOnline()
  } catch {
    reportOffline()
    throw new SpeechApiError('Could not reach the server. Check your connection.', 'network')
  }

  let data: { error?: string; predictions?: SignPrediction[] }
  try {
    data = (await res.json()) as { error?: string; predictions?: SignPrediction[] }
  } catch {
    throw new SpeechApiError('The server returned an unexpected response.', 'server')
  }

  if (!res.ok || data.error) {
    throw new SpeechApiError(typeof data.error === 'string' ? data.error : 'Prediction failed. Please try again.', 'server')
  }

  const preds = Array.isArray(data.predictions) ? data.predictions : []
  return preds
    .filter((p) => p && typeof p.word === 'string' && p.word.trim())
    .map((p) => ({
      word: p.word.trim(),
      confidence: typeof p.confidence === 'number' ? p.confidence : 0,
    }))
}
