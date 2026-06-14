import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 36,
  },

  ambientGlow: {
    position: 'absolute',
    width: 380,
    height: 280,
    borderRadius: 190,
    top: -60,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 80,
  },

  brandUnify: {
    fontSize: 22,
    fontWeight: '900',
    color: '#f0f0f0',
    letterSpacing: 1,
  },

  brandVoice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#22c55e',
    letterSpacing: 1,
    textShadowColor: 'rgba(34,197,94,0.5)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },

  brandSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '300',
    marginTop: 5,
    lineHeight: 18,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 22,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f0f0f0',
    marginBottom: 4,
  },

  cardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '300',
    marginBottom: 18,
    lineHeight: 18,
  },

  generalErr: {
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(220,38,38,0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },

  errText: {
    fontSize: 12,
    color: '#f87171',
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#22c55e',
    opacity: 0.8,
    marginBottom: 6,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    fontSize: 13,
    height: 48,
  },

  fieldErr: {
    fontSize: 11,
    color: '#f87171',
    marginTop: 4,
    marginBottom: 2,
  },

  forgotText: {
    fontSize: 11,
    color: 'rgba(34,197,94,0.6)',
    letterSpacing: 0.3,
  },

  primaryBtn: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  primaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#22c55e',
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  dividerText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 11,
  },

  socialBtnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },

  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },

  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22c55e',
  },
})

export { styles }
