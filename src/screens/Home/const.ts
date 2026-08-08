import type { ComponentType } from 'react'

import { SignToTextGlyph, SpeechToSignGlyph, SpeechToTextGlyph } from '../../components/FeatureGlyphs'

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
    Icon: SignToTextGlyph,
    titleKey: 'feature.signToText',
    subtitleKey: 'feature.signToTextSub',
    route: 'SignToTextScreen',
  },
  {
    key: 'speech-to-sign',
    Icon: SpeechToSignGlyph,
    titleKey: 'feature.speechToSign',
    subtitleKey: 'feature.speechToSignSub',
    route: 'SpeechToSignScreen',
  },
  {
    key: 'speech-to-text',
    Icon: SpeechToTextGlyph,
    titleKey: 'feature.speechToText',
    subtitleKey: 'feature.speechToTextSub',
    route: 'SpeechToTextScreen',
  },
]

export { FEATURES }
