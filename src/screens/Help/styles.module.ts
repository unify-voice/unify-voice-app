import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
    backHit: {
      minHeight: 44,
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    backText: {
      fontSize: 15,
      fontWeight: '700',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: c.textPrimary,
      marginTop: 4,
      letterSpacing: -0.5,
    },
    sub: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 6,
      lineHeight: 19,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 8,
    },
    card: {
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.divider,
    },
    qRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 44,
    },
    qText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
      lineHeight: 21,
    },
    aText: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 20,
      color: c.textMuted,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.primary,
      marginBottom: 2,
    },
  })

export { createStyles }
