export const STORAGE_KEYS = {
  language: '@unifyvoice/language',
  themeMode: '@unifyvoice/theme-mode',
  conversionLang: '@unifyvoice/conversion-lang',
  history: '@unifyvoice/history',
  tutorial: (uid: string) => `@unifyvoice/tutorial/${uid}`,
  avatar: (uid: string) => `@unifyvoice/avatar/${uid}`,
} as const
