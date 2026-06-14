import { StyleSheet } from 'react-native'

import { colors } from '../../theme'

const styles = StyleSheet.create({
  glowCore: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'transparent',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 80,
  },

  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },

  ring1: {
    width: 240,
    height: 240,
    borderColor: 'rgba(34,197,94,0.2)',
  },

  ring2: {
    width: 360,
    height: 360,
    borderColor: 'rgba(34,197,94,0.1)',
  },

  ring3: {
    width: 480,
    height: 480,
    borderColor: 'rgba(34,197,94,0.05)',
  },

  logoBadge: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoBadgeInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(34,197,94,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },

  logoBadgeOuter: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.12)',
  },

  divider: {
    width: 48,
    height: 1,
    backgroundColor: 'rgba(34,197,94,0.3)',
    marginVertical: 4,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(34,197,94,0.3)',
  },

  dotActive: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(34,197,94,0.7)',
  },
})

export { styles }
