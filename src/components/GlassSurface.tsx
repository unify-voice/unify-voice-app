import React from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { useAppTheme } from '../context/Theme'

type Props = {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
}

/** Translucent panel with highlight/stroke used by glass buttons and the tab dock. */
const GlassSurface = ({ children, style, contentStyle }: Props) => {
  const { colors } = useAppTheme()

  return (
    <View style={[styles.clip, { backgroundColor: colors.navGlass }, style]}>
      <View pointerEvents='none' style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
      <View pointerEvents='none' style={[styles.highlight, { backgroundColor: colors.glassHighlight }]} />
      <View pointerEvents='none' style={[styles.stroke, { borderColor: colors.glassBorder }]} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: StyleSheet.hairlineWidth * 2,
    borderRadius: 999,
    opacity: 0.35,
  },
  stroke: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
  content: {
    zIndex: 1,
  },
})

export default GlassSurface
