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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.clay,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 10,
      elevation: 3,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.primaryBorder,
    },

    profileInitials: {
      fontSize: 12,
      fontWeight: '700',
      color: c.primary,
    },
  })

export { createStyles }
