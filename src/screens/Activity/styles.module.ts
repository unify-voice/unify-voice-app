import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    ambientGlow: {
      position: 'absolute',
      width: 380,
      height: 260,
      borderRadius: 190,
      top: -80,
      alignSelf: 'center',
      backgroundColor: 'transparent',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.18,
      shadowRadius: 80,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: c.textPrimary,
    },
    sub: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 4,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    emptyCard: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginTop: 12,
    },
    emptyText: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 21,
    },
    row: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 8,
    },
    rowType: {
      flex: 1,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: c.primary,
      fontWeight: '700',
    },
    rowText: {
      fontSize: 15,
      color: c.textPrimary,
      fontWeight: '600',
      lineHeight: 21,
    },
    rowMeta: {
      fontSize: 11,
      color: c.textFaint,
      marginTop: 8,
    },
    clearBtn: {
      alignSelf: 'flex-end',
      marginTop: 8,
      marginBottom: 12,
    },
    clearText: {
      fontSize: 12,
      color: c.errorClear,
      fontWeight: '700',
    },
  })

export { createStyles }
