import { StyleSheet } from 'react-native'

import { colors } from '../../../theme'

const styles = StyleSheet.create({
  brandUnify: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f0f0f0',
    letterSpacing: 1,
  },
  brandVoice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
    textShadowColor: 'rgba(34,197,94,0.45)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },

  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(34,197,94,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  profileInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
})

export { styles }
