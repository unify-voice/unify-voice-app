export type SupportedSign = {
  id: string
  en: string
  ur: string
}

export const SUPPORTED_SIGNS: SupportedSign[] = [
  { id: 'hello', en: 'Hello', ur: 'سلام' },
  { id: 'thank_you', en: 'Thank you', ur: 'شکریہ' },
  { id: 'yes', en: 'Yes', ur: 'ہاں' },
  { id: 'no', en: 'No', ur: 'نہیں' },
  { id: 'please', en: 'Please', ur: 'براہ کرم' },
  { id: 'sorry', en: 'Sorry', ur: 'معاف کیجیے' },
  { id: 'help', en: 'Help', ur: 'مدد' },
  { id: 'water', en: 'Water', ur: 'پانی' },
  { id: 'goodbye', en: 'Goodbye', ur: 'خدا حافظ' },
  { id: 'good_morning', en: 'Good morning', ur: 'صبح بخیر' },
]

export const SUPPORTED_SIGN_COUNT = SUPPORTED_SIGNS.length
