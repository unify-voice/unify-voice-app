import { StyleSheet } from 'react-native'

import { colors } from '../../../theme'

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  navIcon: {
    fontSize: 18,
    color: '#fff',
  },

  navLabel: {
    fontSize: 12,
    color: '#aaa',
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
    backgroundColor: colors.primary,
  },
})

export { styles }
