import React from 'react'
import { View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useLanguage } from '../../../context/Language'
import { useThemedStyles } from '../../../theme'
import { directionStyle } from '../../../utils/rtl'

import { createStyles } from './styles.module'

interface ScreenProps {
  children: React.ReactNode
  style?: ViewStyle
  padded?: boolean
  /** Set false when wrapping a native navigator — RTL on that parent blanks screens. */
  applyDirection?: boolean
}

/** Safe-area screen shell with optional padding and RTL direction. */
const Screen = ({ children, style, padded = true, applyDirection = true }: ScreenProps) => {
  const styles = useThemedStyles(createStyles)
  const { isRTL } = useLanguage()

  return (
    <SafeAreaView style={[styles.safeArea, applyDirection && directionStyle(isRTL)]}>
      <View style={[styles.container, padded && styles.padding, style]}>{children}</View>
    </SafeAreaView>
  )
}

export default Screen
