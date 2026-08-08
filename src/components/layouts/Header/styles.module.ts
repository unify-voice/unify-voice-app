import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    brandUnify: {
      fontSize: 20,
      fontWeight: '900',
      color: c.textPrimary,
      letterSpacing: 1,
    },
    brandVoice: {
      fontSize: 20,
      fontWeight: '900',
      color: c.primary,
      letterSpacing: 1,
      textShadowColor: c.primaryGlow,
      textShadowRadius: 12,
      textShadowOffset: { width: 0, height: 0 },
    },

    profileBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.primaryMuted,
      borderWidth: 1.5,
      borderColor: c.primaryBorderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },

    profileInitials: {
      fontSize: 12,
      fontWeight: '700',
      color: c.primary,
    },
  })

export { createStyles }
