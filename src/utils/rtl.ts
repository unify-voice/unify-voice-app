import type { FlexStyle } from 'react-native'

export const directionStyle = (isRTL: boolean): Pick<FlexStyle, 'direction'> => ({
  direction: isRTL ? 'rtl' : 'ltr',
})
