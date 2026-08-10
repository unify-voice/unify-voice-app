import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

type GlyphProps = {
  color?: string
  size?: number
}

/** Home feature tile icon for Sign to Text. */
export const SignToTextGlyph = ({ color = '#22c55e', size = 26 }: GlyphProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Path
      d='M8 13.2V7.2a1.6 1.6 0 1 1 3.2 0v5.4'
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <Path
      d='M11.2 12.2V5.8a1.6 1.6 0 1 1 3.2 0v6.4'
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <Path
      d='M14.4 12.6V7a1.6 1.6 0 1 1 3.2 0v6.4'
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <Path
      d='M17.6 13.5v-2.2a1.45 1.45 0 1 1 2.9 0V14a6.5 6.5 0 0 1-13 0v-3.1A1.45 1.45 0 0 1 10 9.45'
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Svg>
)

/** Home feature tile icon for Speech to Sign. */
export const SpeechToSignGlyph = ({ color = '#22c55e', size = 26 }: GlyphProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Rect x='3' y='5' width='18' height='14' rx='3.5' stroke={color} strokeWidth={2.15} />
    <Path d='M10.2 9.4v5.2l4.8-2.6-4.8-2.6Z' fill={color} />
  </Svg>
)

/** Home feature tile icon for Speech to Text. */
export const SpeechToTextGlyph = ({ color = '#22c55e', size = 26 }: GlyphProps) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Path
      d='M12 3.2a3.1 3.1 0 0 0-3.1 3.1v5.4a3.1 3.1 0 1 0 6.2 0V6.3A3.1 3.1 0 0 0 12 3.2Z'
      fill={color}
    />
    <Path
      d='M18.7 11.2v.9a6.7 6.7 0 0 1-13.4 0v-.9'
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap='round'
    />
    <Path d='M12 18.8v2.2M9.2 21h5.6' stroke={color} strokeWidth={2.2} strokeLinecap='round' />
  </Svg>
)
