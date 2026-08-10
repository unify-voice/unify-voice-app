import type { AppLanguage } from '../i18n/translations'

export type SignToTextPhrase = {
  id: string
  en: string
  ur: string
}

/** Labels returned by the Sign-to-Text model (`/classes`). */
export const SIGN_TO_TEXT_PHRASES: SignToTextPhrase[] = [
  { id: 'assalam_o_alaikum', en: 'Hello', ur: 'السلام علیکم' },
  { id: 'can_i_help_you', en: 'Can I help you', ur: 'کیا میں آپ کی مدد کر سکتا ہوں؟' },
  { id: 'do_you_speak_english', en: 'Do you speak English', ur: 'کیا آپ انگلش بول سکتے ہیں؟' },
  { id: 'have_you_eaten', en: 'Have you eaten', ur: 'آپ نے کھانا کھا لیا؟' },
  { id: 'how_are_you', en: 'How are you', ur: 'آپ کیسے ہیں؟' },
  { id: 'i_am_sick', en: 'I am sick', ur: 'میں بیمار ہوں' },
  { id: 'i_do_not_understand', en: 'I do not understand', ur: 'مجھے سمجھ نہیں آئی' },
  { id: 'see_you_later', en: 'See you later', ur: 'بعد میں ملتے ہیں' },
  { id: 'welcome', en: 'Welcome', ur: 'خوش آمدید' },
  { id: 'well_done', en: 'Well done', ur: 'بہت اچھا' },
]

export const SIGN_TO_TEXT_PHRASE_COUNT = SIGN_TO_TEXT_PHRASES.length

export const CONFIDENCE_HIGH = 0.7
export const CONFIDENCE_MEDIUM = 0.4

export type ConfidenceBand = 'high' | 'medium' | 'low'

const byId = new Map(SIGN_TO_TEXT_PHRASES.map((p) => [p.id, p]))

/** Canonicalizes model/API labels so id and English title lookups share one key space. */
export function normalizeSignLabel(raw: string): string {
  return raw.trim().toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

/** Clamps scores to 0–1, treating 0–100 percentages as fractions when needed. */
export function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  const n = value > 1 && value <= 100 ? value / 100 : value
  return Math.min(1, n)
}

/** Maps a confidence score onto high / medium / low UI bands. */
export function confidenceBand(value: number): ConfidenceBand {
  const c = normalizeConfidence(value)
  if (c >= CONFIDENCE_HIGH) return 'high'
  if (c >= CONFIDENCE_MEDIUM) return 'medium'
  return 'low'
}

/** Resolves a raw model label to a known phrase by id, then by English title. */
export function findSignPhrase(raw: string): SignToTextPhrase | undefined {
  const id = normalizeSignLabel(raw)
  if (!id) return undefined
  const direct = byId.get(id)
  if (direct) return direct
  return SIGN_TO_TEXT_PHRASES.find((p) => normalizeSignLabel(p.en) === id)
}

/** Localized phrase text for UI; falls back to a cleaned raw label when unknown. */
export function displaySignPhrase(raw: string, lang: AppLanguage): string {
  const phrase = findSignPhrase(raw)
  if (phrase) return lang === 'ur' ? phrase.ur : phrase.en
  const cleaned = raw.trim().replace(/_/g, ' ').replace(/\s+/g, ' ')
  if (!cleaned) return ''
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}
