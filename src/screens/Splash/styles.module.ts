import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    glowCore: {
      position: 'absolute',
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: 'transparent',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 80,
    },

    ring: {
      position: 'absolute',
      borderRadius: 999,
      borderWidth: 1,
    },

    ring1: {
      width: 240,
      height: 240,
      borderColor: c.primaryBorder,
    },

    ring2: {
      width: 360,
      height: 360,
      borderColor: c.primaryMuted,
    },

    ring3: {
      width: 480,
      height: 480,
      borderColor: c.primaryRing,
    },

    logoBadge: {
      width: 88,
      height: 88,
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoBadgeInner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.primaryMuted,
      borderWidth: 1.5,
      borderColor: c.primaryGlow,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
    },

    logoBadgeOuter: {
      position: 'absolute',
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 1,
      borderColor: c.primaryRing,
    },

    divider: {
      width: 48,
      height: 1,
      backgroundColor: c.primaryBorderStrong,
      marginVertical: 4,
    },

    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.primaryBorderStrong,
    },

    dotActive: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: c.primaryTextMuted,
    },
  })

export { createStyles }
