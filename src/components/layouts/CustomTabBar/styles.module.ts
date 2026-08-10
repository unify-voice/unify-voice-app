import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bottomNav: {
      backgroundColor: 'transparent',
      paddingHorizontal: 18,
      paddingTop: 4,
      paddingBottom: 8,
    },
    dockShadow: {
      borderRadius: 30,
      shadowColor: c.black,
      shadowOpacity: 0.28,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 14,
    },
    dock: {
      borderRadius: 30,
    },
    dockInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 5,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minHeight: 52,
      borderRadius: 26,
      paddingVertical: 6,
    },
    navItemOn: {
      backgroundColor: c.primaryMuted,
    },
    navLabel: {
      fontSize: 10,
      color: c.textSecondary,
      marginTop: 3,
      fontWeight: '700',
    },
    dotContainer: {
      height: 0,
    },
    navDot: {
      width: 0,
      height: 0,
    },
  })

export { createStyles }
