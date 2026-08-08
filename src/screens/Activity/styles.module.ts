import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.5,
    },
    sub: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 6,
      lineHeight: 19,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 110,
      paddingTop: 8,
    },
    emptyText: {
      fontSize: 15,
      color: c.textMuted,
      lineHeight: 22,
      marginTop: 20,
    },
    row: {
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.divider,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 6,
    },
    rowType: {
      flex: 1,
      fontSize: 11,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: c.primary,
      fontWeight: '700',
    },
    rowText: {
      fontSize: 16,
      color: c.textPrimary,
      fontWeight: '600',
      lineHeight: 22,
    },
    rowMeta: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 6,
    },
    clearBtn: {
      alignSelf: 'flex-end',
      marginBottom: 8,
      minHeight: 36,
      justifyContent: 'center',
    },
    clearText: {
      fontSize: 13,
      color: c.errorText,
      fontWeight: '700',
    },
  })

export { createStyles }
