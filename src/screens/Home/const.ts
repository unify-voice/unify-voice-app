import { AudioLines, HandMetal, Mic } from '@tamagui/lucide-icons-2'
import type { ComponentType } from 'react'

type FeatureIcon = ComponentType<{ size?: number; color?: string }>

const WEEKLY_DATA = [
  { day: 'Mon', height: 28 },
  { day: 'Tue', height: 44 },
  { day: 'Wed', height: 20 },
  { day: 'Thu', height: 56, active: true },
  { day: 'Fri', height: 36 },
  { day: 'Sat', height: 16 },
  { day: 'Sun', height: 8 },
]

const FEATURES: {
  key: string
  Icon: FeatureIcon
  titleKey: string
  subtitleKey: string
  route: 'SignToTextScreen' | 'SpeechToSignScreen' | 'SpeechToTextScreen'
}[] = [
  {
    key: 'sign-to-text',
    Icon: HandMetal,
    titleKey: 'feature.signToText',
    subtitleKey: 'feature.signToTextSub',
    route: 'SignToTextScreen',
  },
  {
    key: 'speech-to-sign',
    Icon: AudioLines,
    titleKey: 'feature.speechToSign',
    subtitleKey: 'feature.speechToSignSub',
    route: 'SpeechToSignScreen',
  },
  {
    key: 'speech-to-text',
    Icon: Mic,
    titleKey: 'feature.speechToText',
    subtitleKey: 'feature.speechToTextSub',
    route: 'SpeechToTextScreen',
  },
]

export { WEEKLY_DATA, FEATURES }
