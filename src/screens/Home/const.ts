const WEEKLY_DATA = [
  { day: 'Mon', height: 28 },
  { day: 'Tue', height: 44 },
  { day: 'Wed', height: 20 },
  { day: 'Thu', height: 56, active: true },
  { day: 'Fri', height: 36 },
  { day: 'Sat', height: 16 },
  { day: 'Sun', height: 8 },
]

const FEATURES = [
  {
    key: 'sign-to-text',
    icon: '🤟',
    title: 'Sign to Text',
    subtitle: 'Camera-based sign detection',
    route: 'SignToTextScreen' as const,
  },
  {
    key: 'speech-to-sign',
    icon: '🗣️',
    title: 'Speech to Sign',
    subtitle: 'Translate spoken words visually',
    route: 'SpeechToSignScreen' as const,
  },
  {
    key: 'speech-to-text',
    icon: '🎙️',
    title: 'Speech to Text',
    subtitle: 'Instant voice transcription',
    route: 'SpeechToTextScreen' as const,
  },
]

export { WEEKLY_DATA, FEATURES }
