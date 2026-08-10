/**
 * Semantic color tokens shared by dark and light themes.
 * Brand greens are identical across themes to preserve the design system.
 */
export type ThemeColors = {
  primary: string
  primaryDark: string

  background: string
  surface: string
  surfaceElevated: string
  navBackground: string

  textPrimary: string
  textSecondary: string
  textHint: string
  textMuted: string
  textFaint: string
  textDisabled: string
  textOnPrimary: string

  border: string
  card: string
  cardBorder: string
  cardPressed: string
  rowBorder: string
  divider: string

  controlBg: string
  controlBorder: string
  inputBg: string
  inputOutline: string
  inputPlaceholder: string
  inputText: string
  inputOnSurfaceVariant: string

  primaryMuted: string
  primarySoft: string
  primaryBorder: string
  primaryBorderStrong: string
  primaryGlow: string
  primaryTextMuted: string
  primaryRing: string

  error: string
  errorMuted: string
  errorBorder: string
  errorText: string
  errorClear: string

  overlay: string
  overlayStrong: string
  shadow: string

  slate: string
  slateBorder: string
  slateMuted: string
  slateText: string
  slateTextMuted: string
  accentBlue: string
  accentBlueDark: string
  playGreen: string

  white: string
  black: string
  warning: string
  successBright: string
  recordIdle: string

  glass: string
  glassStrong: string
  glassBorder: string
  glassHighlight: string
  clay: string
  clayDeep: string
  navGlass: string
}

/** Existing dark palette — values preserved exactly where they already existed. */
export const darkColors: ThemeColors = {
  primary: '#22c55e',
  primaryDark: '#16A34A',

  background: '#0c0f0d',
  surface: '#111827',
  surfaceElevated: '#161616',
  navBackground: 'rgba(13,13,13,0.96)',

  textPrimary: '#ECFDF5',
  textSecondary: '#9CA3AF',
  textHint: '#9CA3AF',
  textMuted: 'rgba(255,255,255,0.35)',
  textFaint: 'rgba(255,255,255,0.25)',
  textDisabled: 'rgba(255,255,255,0.15)',
  textOnPrimary: '#0d0d0d',

  border: '#374151',
  card: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.07)',
  cardPressed: 'rgba(255,255,255,0.055)',
  rowBorder: 'rgba(255,255,255,0.05)',
  divider: 'rgba(255,255,255,0.08)',

  controlBg: 'rgba(255,255,255,0.04)',
  controlBorder: 'rgba(255,255,255,0.08)',
  inputBg: 'rgba(255,255,255,0.04)',
  inputOutline: 'rgba(255,255,255,0.1)',
  inputPlaceholder: 'rgba(255,255,255,0.4)',
  inputText: '#ffffff',
  inputOnSurfaceVariant: 'rgba(255,255,255,0.5)',

  primaryMuted: 'rgba(34,197,94,0.1)',
  primarySoft: 'rgba(34,197,94,0.18)',
  primaryBorder: 'rgba(34,197,94,0.2)',
  primaryBorderStrong: 'rgba(34,197,94,0.4)',
  primaryGlow: 'rgba(34,197,94,0.45)',
  primaryTextMuted: 'rgba(34,197,94,0.6)',
  primaryRing: 'rgba(34,197,94,0.12)',

  error: '#EF4444',
  errorMuted: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.6)',
  errorText: '#f87171',
  errorClear: 'rgba(220,38,38,0.6)',

  overlay: 'rgba(0,0,0,0.6)',
  overlayStrong: 'rgba(0,0,0,0.75)',
  shadow: '#000000',

  slate: '#1e293b',
  slateBorder: '#334155',
  slateMuted: '#0f172a',
  slateText: '#e2e8f0',
  slateTextMuted: '#94a3b8',
  accentBlue: '#3b82f6',
  accentBlueDark: '#1e40af',
  playGreen: '#15803d',

  white: '#ffffff',
  black: '#000000',
  warning: '#facc15',
  successBright: '#4ade80',
  recordIdle: 'rgba(255,255,255,0.3)',

  glass: 'rgba(255,255,255,0.06)',
  glassStrong: 'rgba(18,26,20,0.72)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassHighlight: 'rgba(255,255,255,0.2)',
  clay: '#1b231e',
  clayDeep: '#101612',
  navGlass: 'rgba(16,22,18,0.82)',
}

/**
 * Light theme — same brand greens and visual language,
 * inverted surfaces/text for light backgrounds.
 */
export const lightColors: ThemeColors = {
  primary: '#22c55e',
  primaryDark: '#16A34A',

  background: '#EEF3EE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  navBackground: 'rgba(248,250,247,0.96)',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textHint: '#9CA3AF',
  textMuted: 'rgba(17,24,39,0.55)',
  textFaint: 'rgba(17,24,39,0.4)',
  textDisabled: 'rgba(17,24,39,0.25)',
  textOnPrimary: '#0d0d0d',

  border: '#E5E7EB',
  card: 'rgba(17,24,39,0.03)',
  cardBorder: 'rgba(17,24,39,0.08)',
  cardPressed: 'rgba(17,24,39,0.06)',
  rowBorder: 'rgba(17,24,39,0.06)',
  divider: 'rgba(17,24,39,0.1)',

  controlBg: 'rgba(17,24,39,0.04)',
  controlBorder: 'rgba(17,24,39,0.1)',
  inputBg: 'rgba(17,24,39,0.04)',
  inputOutline: 'rgba(17,24,39,0.12)',
  inputPlaceholder: 'rgba(17,24,39,0.4)',
  inputText: '#111827',
  inputOnSurfaceVariant: 'rgba(17,24,39,0.5)',

  primaryMuted: 'rgba(34,197,94,0.12)',
  primarySoft: 'rgba(34,197,94,0.2)',
  primaryBorder: 'rgba(34,197,94,0.25)',
  primaryBorderStrong: 'rgba(34,197,94,0.45)',
  primaryGlow: 'rgba(34,197,94,0.35)',
  primaryTextMuted: 'rgba(22,163,74,0.75)',
  primaryRing: 'rgba(34,197,94,0.18)',

  error: '#EF4444',
  errorMuted: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.55)',
  errorText: '#DC2626',
  errorClear: 'rgba(220,38,38,0.7)',

  overlay: 'rgba(0,0,0,0.4)',
  overlayStrong: 'rgba(0,0,0,0.5)',
  shadow: '#000000',

  slate: '#F1F5F9',
  slateBorder: '#E2E8F0',
  slateMuted: '#E2E8F0',
  slateText: '#0F172A',
  slateTextMuted: '#64748B',
  accentBlue: '#3b82f6',
  accentBlueDark: '#1e40af',
  playGreen: '#15803d',

  white: '#ffffff',
  black: '#000000',
  warning: '#CA8A04',
  successBright: '#16A34A',
  recordIdle: 'rgba(17,24,39,0.25)',

  glass: 'rgba(255,255,255,0.52)',
  glassStrong: 'rgba(255,255,255,0.86)',
  glassBorder: 'rgba(255,255,255,0.88)',
  glassHighlight: 'rgba(255,255,255,1)',
  clay: '#E6EEE7',
  clayDeep: '#cfd8d1',
  navGlass: 'rgba(255,255,255,0.8)',
}

/** @deprecated Prefer useAppTheme().colors — kept for gradual migration / static defaults */
const colors = darkColors

const getInputTheme = (c: ThemeColors = darkColors) => ({
  colors: {
    text: c.inputText,
    primary: c.primary,
    background: c.inputBg,
    placeholder: c.inputPlaceholder,
    onSurface: c.inputText,
    onSurfaceVariant: c.inputOnSurfaceVariant,
  },
})

const INPUT_THEME = getInputTheme(darkColors)

export { colors, INPUT_THEME, getInputTheme }
