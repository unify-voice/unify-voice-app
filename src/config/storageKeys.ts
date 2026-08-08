export const STORAGE_KEYS = {
  language: '@unifyvoice/language',
  themeMode: '@unifyvoice/theme-mode',
  conversionLang: '@unifyvoice/conversion-lang',
  history: '@unifyvoice/history',
  tutorial: (uid: string) => `@unifyvoice/tutorial-live/${uid}`,
  avatar: (uid: string) => `@unifyvoice/avatar/${uid}`,
  haptics: '@unifyvoice/haptics',
  soundCues: '@unifyvoice/sound-cues',
  s2tTipsDismissed: '@unifyvoice/s2t-tips-dismissed',
} as const
