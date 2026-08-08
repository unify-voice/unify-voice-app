import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useAppTheme } from '../context/Theme'

const Atmosphere = () => {
  const { colors, isDark } = useAppTheme()
  return (
    <View pointerEvents='none' style={StyleSheet.absoluteFill}>
      <View style={[styles.wash, { backgroundColor: isDark ? 'transparent' : 'rgba(255,255,255,0.35)' }]} />
      <View style={[styles.orbA, { backgroundColor: colors.primary, opacity: isDark ? 0.22 : 0.18 }]} />
      <View style={[styles.orbB, { backgroundColor: isDark ? '#4ade80' : '#86efac', opacity: isDark ? 0.1 : 0.22 }]} />
      <View style={[styles.orbC, { backgroundColor: isDark ? '#166534' : '#bbf7d0', opacity: isDark ? 0.18 : 0.35 }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  wash: {
    ...StyleSheet.absoluteFillObject,
  },
  orbA: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -130,
    left: '18%',
  },
  orbB: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: 220,
    right: -80,
  },
  orbC: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 40,
    left: -60,
  },
})

export default Atmosphere
