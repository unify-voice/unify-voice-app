import { StyleSheet } from 'react-native'

import { spacing, type ThemeColors } from '../../../theme'

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },

    container: {
      flex: 1,
      position: 'relative',
    },

    padding: {
      paddingHorizontal: spacing.lg,
    },
  })

export { createStyles }
