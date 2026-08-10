/**
 * Haptic + short WAV cues for recording and conversion outcomes.
 * Respects Profile preferences; never throws if Vibration or audio fails.
 */
import { Image, Platform, Vibration } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'

import cueErrorWav from '../assets/cue-error.wav'
import cueStartWav from '../assets/cue-start.wav'
import cueSuccessWav from '../assets/cue-success.wav'

const cuePlayer = new AudioRecorderPlayer()

let hapticsEnabled = true
let soundEnabled = true

/** Sync cue flags from Preferences (called when settings load or change). */
export const configureFeedback = (next: { haptics: boolean; sound: boolean }) => {
  hapticsEnabled = next.haptics
  soundEnabled = next.sound
}

const playAsset = async (asset: number) => {
  if (!soundEnabled) return
  try {
    const resolved = Image.resolveAssetSource(asset)
    if (!resolved?.uri) return
    await cuePlayer.stopPlayer().catch(() => undefined)
    await cuePlayer.startPlayer(resolved.uri)
  } catch {
    // sound is optional
  }
}

const tap = (pattern: number | number[]) => {
  if (!hapticsEnabled) return
  try {
    if (typeof Vibration?.vibrate !== 'function') return
    Vibration.vibrate(pattern)
  } catch {
    // missing VIBRATE permission or no vibrator — never crash recording
  }
}

/** Light tap only — avoid playing audio while the mic recorder is active. */
export const cueListenStart = () => {
  tap(Platform.OS === 'ios' ? 10 : 25)
}

export const cueListenStop = () => {
  tap(Platform.OS === 'ios' ? 15 : 35)
}

export const cueSuccess = () => {
  tap(Platform.OS === 'ios' ? [0, 20, 40, 20] : [0, 30, 50, 30])
  void playAsset(cueSuccessWav)
}

export const cueError = () => {
  tap(Platform.OS === 'ios' ? [0, 40, 40, 40] : [0, 50, 60, 50])
  void playAsset(cueErrorWav)
}

export const cueRecordStart = () => {
  tap(Platform.OS === 'ios' ? 10 : 25)
  void playAsset(cueStartWav)
}

export const cueRecordStop = () => {
  tap(Platform.OS === 'ios' ? 15 : 35)
}
