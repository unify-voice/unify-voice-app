import React from 'react'
import { View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useThemedStyles } from '../../../theme'

import { createStyles } from './styles.module'

interface ScreenProps {
  children: React.ReactNode
  style?: ViewStyle
  padded?: boolean
}

const Screen = ({ children, style, padded = true }: ScreenProps) => {
  const styles = useThemedStyles(createStyles)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, padded && styles.padding, style]}>{children}</View>
    </SafeAreaView>
  )
}

export default Screen
