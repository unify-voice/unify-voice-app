import { AudioLines, HandMetal, Mic } from '@tamagui/lucide-icons-2'
import type { ComponentType } from 'react'

type FeatureIcon = ComponentType<{ size?: number; color?: string }>

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

export { FEATURES }
