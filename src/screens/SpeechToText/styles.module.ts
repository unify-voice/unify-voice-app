import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
      shadowOpacity: 0.2,
      shadowRadius: 80,
    },
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
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.controlBg,
      borderWidth: 1,
      borderColor: c.controlBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    screenTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: c.textPrimary,
    },
    screenSub: {
      fontSize: 11,
      color: c.textMuted,
      fontWeight: '300',
      marginTop: 2,
    },

    // Mic card
    micCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: 20,
      padding: 22,
      alignItems: 'center',
    },
    waveBar: {
      width: 4,
      height: 40,
      borderRadius: 2,
    },
    micBtn: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: c.controlBg,
      borderWidth: 2,
      borderColor: c.textDisabled,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    micBtnActive: {
      borderColor: c.primary,
      backgroundColor: c.primaryMuted,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
    },
    micBtnRing: {
      position: 'absolute',
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 1,
      borderColor: c.primaryBorder,
    },
    micLabel: {
      fontSize: 11,
      color: c.textFaint,
      fontWeight: '400',
      marginTop: 12,
      letterSpacing: 0.3,
    },
    langBadge: {
      backgroundColor: c.controlBg,
      borderWidth: 1,
      borderColor: c.controlBorder,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    langBadgeText: {
      fontSize: 10,
      color: c.inputPlaceholder,
      fontWeight: '400',
    },

    // Transcript
    transcriptSection: {
      flex: 1,
      marginHorizontal: 20,
      marginTop: 14,
    },
    transcriptLabel: {
      fontSize: 9,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      color: c.textFaint,
      fontWeight: '400',
    },
    clearBtn: {
      fontSize: 11,
      color: c.errorClear,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    transcriptScroll: {
      flex: 1,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: 14,
    },
    transcriptEmpty: {
      fontSize: 13,
      color: c.textDisabled,
      fontWeight: '300',
      textAlign: 'center',
      marginTop: 24,
      lineHeight: 20,
    },
    transcriptLine: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 12,
    },
    transcriptDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.textFaint,
      marginTop: 7,
      flexShrink: 0,
    },
    transcriptText: {
      fontSize: 14,
      fontWeight: '400',
      color: c.textPrimary,
      lineHeight: 21,
      flex: 1,
    },

    // Button
    primaryBtn: {
      backgroundColor: c.primaryMuted,
      borderWidth: 1,
      borderColor: c.primaryBorderStrong,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
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
  })

export { createStyles }
