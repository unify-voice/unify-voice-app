import { Platform } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'

let player: AudioRecorderPlayer | null = null

const getPlayer = () => {
  if (!player) player = new AudioRecorderPlayer()
  return player
}

export async function startAppRecorder(): Promise<string> {
  const path = Platform.OS === 'ios' ? 'recording.m4a' : undefined
  return getPlayer().startRecorder(path as any)
}

export async function stopAppRecorder(): Promise<string> {
  return getPlayer().stopRecorder()
}

/** Stop the mic if it is open. Safe to call when not recording. */
export async function discardAppRecorder(): Promise<void> {
  try {
    await getPlayer().stopRecorder()
  } catch {
    // not recording
  }
}
