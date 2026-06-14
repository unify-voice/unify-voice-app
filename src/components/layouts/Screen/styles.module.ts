import { StyleSheet } from 'react-native'

import { spacing } from '../../../theme'

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },

  container: {
    flex: 1,
    position: 'relative',
  },

  padding: {
    paddingHorizontal: spacing.lg,
  },
})

export { styles }
