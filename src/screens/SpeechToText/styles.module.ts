import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screenTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.6,
    },
    screenSub: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: '400',
      marginTop: 6,
      lineHeight: 20,
    },
    stage: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 8,
    },
    waveRow: {
      height: 36,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 5,
      marginBottom: 18,
    },
    waveBar: {
      width: 3.5,
      height: 32,
      borderRadius: 3,
    },
    micLabel: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: '600',
      marginTop: 14,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 28,
      paddingTop: 10,
      alignItems: 'center',
      gap: 8,
    },
    transcriptSection: {
      flex: 1,
      marginHorizontal: 24,
      marginTop: 20,
    },
    transcriptLabel: {
      fontSize: 12,
      color: c.textSecondary,
      fontWeight: '700',
    },
    clearBtn: {
      fontSize: 13,
      color: c.errorText,
      fontWeight: '700',
    },
    transcriptScroll: {
      flex: 1,
    },
    transcriptEmpty: {
      fontSize: 15,
      color: c.textMuted,
      fontWeight: '400',
      lineHeight: 22,
    },
    transcriptText: {
      fontSize: 22,
      fontWeight: '600',
      color: c.textPrimary,
      lineHeight: 32,
      letterSpacing: -0.3,
      marginBottom: 16,
    },
    errorBlock: {
      marginHorizontal: 24,
      marginTop: 12,
    },
    errorTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.errorText,
      marginBottom: 4,
    },
    errorBody: {
      fontSize: 13,
      color: c.textSecondary,
      lineHeight: 19,
    },
    textAction: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    textActionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: c.primary,
    },
    textActionMuted: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textSecondary,
    },
  })

export { createStyles }
