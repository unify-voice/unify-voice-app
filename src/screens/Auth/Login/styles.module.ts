import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 40,
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
    },
    brandSub: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: '400',
      marginTop: 8,
      lineHeight: 20,
      maxWidth: 300,
    },
    screenTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.8,
      marginTop: 28,
      marginBottom: 8,
    },
    screenSub: {
      fontSize: 15,
      color: c.textSecondary,
      fontWeight: '400',
      lineHeight: 22,
      marginBottom: 28,
      maxWidth: 320,
    },
    errText: {
      fontSize: 13,
      color: c.errorText,
      marginBottom: 16,
      lineHeight: 18,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.primary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: c.clay,
      fontSize: 15,
      height: 52,
      borderRadius: 16,
      marginBottom: 4,
    },
    fieldErr: {
      fontSize: 12,
      color: c.errorText,
      marginTop: 4,
      marginBottom: 4,
    },
    forgotText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.primary,
    },
    primaryBtn: {
      backgroundColor: c.primary,
      borderRadius: 999,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 22,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 6,
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textOnPrimary,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.divider,
    },
    dividerText: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: '500',
    },
    socialBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.clay,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.primaryBorder,
      borderRadius: 999,
      minHeight: 48,
    },
    socialBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
    },
    footerText: {
      fontSize: 14,
      color: c.textSecondary,
    },
    footerLink: {
      fontSize: 14,
      fontWeight: '700',
      color: c.primary,
    },
    secondaryBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textSecondary,
    },
    successText: {
      fontSize: 14,
      color: c.primary,
      lineHeight: 20,
      marginBottom: 16,
    },
  })

export { createStyles }
