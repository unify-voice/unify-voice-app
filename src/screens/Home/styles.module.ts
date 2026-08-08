import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1 },
    hero: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 8,
    },
    greetingLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.primary,
      marginBottom: 6,
    },
    welcomeName: {
      fontSize: 36,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -1,
    },
    welcomeSub: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: 6,
      lineHeight: 20,
      fontWeight: '400',
      maxWidth: 280,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 110,
    },
    weekBlock: {
      marginBottom: 32,
    },
    weekHead: {
      marginBottom: 18,
    },
    weekKicker: {
      fontSize: 13,
      fontWeight: '700',
      color: c.primary,
      marginBottom: 6,
    },
    weekTotal: {
      fontSize: 48,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -1.6,
      lineHeight: 52,
    },
    weekUnit: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textSecondary,
      letterSpacing: 0,
    },
    weekHint: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 6,
    },
    sparkRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      height: 108,
      direction: 'ltr',
      paddingBottom: 2,
    },
    sparkSlot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    spark: {
      width: '70%',
      maxWidth: 18,
      minWidth: 10,
      borderRadius: 8,
      elevation: 2,
    },
    sparkDay: {
      marginTop: 8,
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    hintLine: {
      fontSize: 13,
      lineHeight: 20,
      color: c.textSecondary,
      marginBottom: 32,
      fontWeight: '500',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 18,
      letterSpacing: 0.4,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingVertical: 14,
    },
    featureOrb: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: c.clay,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 5,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.primaryBorder,
    },
    featureTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.35,
      marginBottom: 3,
    },
    featureSub: {
      fontSize: 13,
      color: c.textSecondary,
      lineHeight: 18,
      fontWeight: '400',
    },
    featureRule: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.divider,
      marginLeft: 64,
    },
  })

export { createStyles }
