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
      marginTop: 6,
      lineHeight: 20,
    },
    stage: {
      height: 320,
      marginHorizontal: 16,
      marginTop: 10,
      borderRadius: 32,
      overflow: 'hidden',
      backgroundColor: c.clayDeep,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
      elevation: 8,
    },
    caption: {
      position: 'absolute',
      left: 14,
      right: 14,
      bottom: 14,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: c.glassStrong,
      borderWidth: 1,
      borderColor: c.glassBorder,
    },
    captionKicker: {
      fontSize: 10,
      fontWeight: '700',
      color: c.primary,
      marginBottom: 3,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    captionText: {
      fontSize: 16,
      fontWeight: '700',
      color: c.textPrimary,
    },
    spokenActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      paddingHorizontal: 24,
      marginTop: 10,
    },
    clearBtn: {
      fontSize: 13,
      color: c.errorText,
      fontWeight: '700',
    },
    errorBlock: {
      paddingHorizontal: 24,
      marginTop: 14,
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
    signsBlock: {
      marginTop: 22,
      paddingLeft: 24,
    },
    signsKicker: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 4,
    },
    sectionHint: {
      fontSize: 13,
      color: c.textMuted,
      marginBottom: 12,
      lineHeight: 18,
      paddingRight: 24,
    },
    practiceBlock: {
      marginBottom: 14,
      paddingRight: 24,
    },
    practiceLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.primary,
      marginBottom: 4,
    },
    practiceEn: {
      fontSize: 26,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.4,
    },
    practiceUr: {
      fontSize: 20,
      fontWeight: '700',
      color: c.textPrimary,
      marginTop: 2,
      marginBottom: 8,
    },
    signRail: {
      paddingRight: 24,
      gap: 8,
      paddingVertical: 4,
    },
    signPill: {
      minHeight: 40,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: c.clay,
      justifyContent: 'center',
    },
    signPillOn: {
      backgroundColor: c.primaryMuted,
    },
    signPillText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      marginTop: 28,
    },
    micLabel: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 14,
      paddingHorizontal: 28,
    },
    textAction: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
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
      textAlign: 'center',
      paddingBottom: 16,
    },
  })

export { createStyles }
