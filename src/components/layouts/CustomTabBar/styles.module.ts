import { StyleSheet } from 'react-native'

import type { ThemeColors } from '../../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: c.rowBorder,
      paddingTop: 10,
    },

    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },

    navIcon: {
      fontSize: 18,
      color: c.textPrimary,
    },

    navLabel: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },

    dotContainer: {
      height: 6,
      marginTop: 4,
    },

    navDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.primary,
    },
  })

export { createStyles }
