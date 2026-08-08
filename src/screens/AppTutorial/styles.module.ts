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
      minHeight: 44,
    },
    skipHit: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 4,
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
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: c.primary,
    },
    body: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
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
      marginBottom: 24,
    },
    iconBubbleCompact: {
      width: 72,
      height: 72,
      borderRadius: 36,
      marginBottom: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: '900',
      color: c.textPrimary,
      textAlign: 'center',
      letterSpacing: -0.4,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    copy: {
      fontSize: 15,
      lineHeight: 23,
      color: c.textMuted,
      textAlign: 'center',
      fontWeight: '400',
      paddingHorizontal: 8,
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
      paddingBottom: 12,
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
    langWrap: {
      flexDirection: 'row',
      width: '100%',
      gap: 10,
      marginTop: 22,
    },
    langPill: {
      flex: 1,
      minHeight: 64,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.controlBorder,
      backgroundColor: c.controlBg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    langPillSelected: {
      borderColor: c.primary,
      backgroundColor: c.primaryMuted,
    },
    langPillText: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    langPillCode: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textFaint,
      marginTop: 4,
      letterSpacing: 1,
    },
  })

export { createStyles }
