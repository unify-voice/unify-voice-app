import React from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { useAppTheme } from '../context/Theme'

type Props = {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  active?: boolean
  size?: number
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

/** Raised circular control used for record / primary action affordances. */
const ClayControl = ({ children, onPress, disabled, active, size = 88, accessibilityLabel, style }: Props) => {
  const { colors, isDark } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, busy: disabled }}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }, style]}
    >
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: active ? colors.primary : colors.clay,
            borderColor: active ? 'transparent' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
            shadowColor: active ? colors.primary : isDark ? colors.black : '#64748b',
            shadowOpacity: active ? 0.4 : isDark ? 0.45 : 0.16,
          },
          styles.face,
        ]}
      >
        {children}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 6,
  },
})

export default ClayControl
