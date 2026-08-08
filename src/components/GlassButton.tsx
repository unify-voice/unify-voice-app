import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { useAppTheme } from '../context/Theme'

import GlassSurface from './GlassSurface'

type Props = {
  label: string
  onPress: () => void
  accessibilityLabel?: string
}

const GlassButton = ({ label, onPress, accessibilityLabel }: Props) => {
  const { colors } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.hit, pressed && { opacity: 0.78, transform: [{ scale: 0.98 }] }]}
    >
      <GlassSurface style={styles.pill} contentStyle={styles.inner}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      </GlassSurface>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hit: {
    alignSelf: 'center',
    minWidth: 168,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  pill: {
    borderRadius: 999,
  },
  inner: {
    minHeight: 48,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
})

export default GlassButton
