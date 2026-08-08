import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.background,
      paddingHorizontal: 24,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: 8,
      minHeight: 36,
    },
    skip: {
      color: c.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: c.divider,
      marginTop: 16,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: c.primary,
    },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    iconBubble: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.primaryMuted,
      borderWidth: 1.5,
      borderColor: c.primaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },
    title: {
      fontSize: 26,
      fontWeight: '900',
      color: c.textPrimary,
      textAlign: 'center',
      letterSpacing: -0.4,
      marginBottom: 12,
    },
    copy: {
      fontSize: 15,
      lineHeight: 23,
      color: c.textMuted,
      textAlign: 'center',
      fontWeight: '400',
      maxWidth: 320,
    },
    counter: {
      textAlign: 'center',
      color: c.textFaint,
      fontSize: 12,
      marginBottom: 16,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      paddingBottom: 28,
    },
    btn: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: {
      backgroundColor: c.primary,
    },
    btnPrimaryText: {
      color: c.textOnPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    btnSecondary: {
      backgroundColor: c.controlBg,
      borderWidth: 1,
      borderColor: c.controlBorder,
    },
    btnSecondaryText: {
      color: c.textMuted,
      fontSize: 15,
      fontWeight: '600',
    },
  })

export { createStyles }
