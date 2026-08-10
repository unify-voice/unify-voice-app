import type { FlexStyle } from 'react-native'

/** Flex `direction` style so layouts flip with Urdu without remounting navigators. */
export const directionStyle = (isRTL: boolean): Pick<FlexStyle, 'direction'> => ({
  direction: isRTL ? 'rtl' : 'ltr',
})
