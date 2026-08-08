import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 52,
      paddingBottom: 36,
    },

    ambientGlow: {
      position: 'absolute',
      width: 380,
      height: 280,
      borderRadius: 190,
      top: -60,
      alignSelf: 'center',
      backgroundColor: 'transparent',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.22,
      shadowRadius: 80,
    },

    brandUnify: {
      fontSize: 22,
      fontWeight: '900',
      color: c.textPrimary,
      letterSpacing: 1,
    },

    brandVoice: {
      fontSize: 22,
      fontWeight: '900',
      color: c.primary,
      letterSpacing: 1,
      textShadowColor: c.primaryGlow,
      textShadowRadius: 14,
      textShadowOffset: { width: 0, height: 0 },
    },

    brandSub: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: '300',
      marginTop: 5,
      lineHeight: 18,
    },

    card: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: 20,
      padding: 22,
    },

    cardTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: c.textPrimary,
      marginBottom: 4,
    },

    cardSub: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: '300',
      marginBottom: 18,
      lineHeight: 18,
    },

    generalErr: {
      backgroundColor: c.errorMuted,
      borderLeftWidth: 3,
      borderLeftColor: c.errorBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
    },

    errText: {
      fontSize: 12,
      color: c.errorText,
    },

    fieldLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: c.primary,
      opacity: 0.8,
      marginBottom: 6,
    },

    input: {
      backgroundColor: c.controlBg,
      fontSize: 13,
      height: 48,
    },

    fieldErr: {
      fontSize: 11,
      color: c.errorText,
      marginTop: 4,
      marginBottom: 2,
    },

    primaryBtn: {
      backgroundColor: c.primaryMuted,
      borderWidth: 1,
      borderColor: c.primaryBorderStrong,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 18,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },

      shadowOpacity: 0.2,
      shadowRadius: 12,
    },

    primaryBtnText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: c.primary,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.divider,
    },

    dividerText: {
      fontSize: 9,
      color: c.textFaint,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },

    socialBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor: c.controlBg,
      borderWidth: 1,
      borderColor: c.inputOutline,
      borderRadius: 10,
      paddingVertical: 11,
    },

    socialBtnText: {
      fontSize: 12,
      color: c.inputOnSurfaceVariant,
    },

    footerText: {
      fontSize: 12,
      color: c.textFaint,
    },

    footerLink: {
      fontSize: 12,
      fontWeight: '700',
      color: c.primary,
    },
  })

export { createStyles }
