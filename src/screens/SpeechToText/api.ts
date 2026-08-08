import { API_BASE_URLS } from '../../../config'

export const transcribeAudio = async (audioPath: string) => {
  const formData = new FormData()

  formData.append('file', {
    uri: `file://${audioPath}`,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as any)

  const response = await fetch(`${API_BASE_URLS.speechToText}/transcribe`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  return response.json()
}
