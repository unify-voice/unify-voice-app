import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: c.background,
      borderTopWidth: 1,
      borderTopColor: c.rowBorder,
      paddingTop: 10,
      paddingBottom: 6,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    navLabel: {
      fontSize: 11,
      color: c.textSecondary,
      marginTop: 3,
      fontWeight: '600',
    },
    dotContainer: {
      height: 6,
      marginTop: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.primary,
    },
  })

export { createStyles }
