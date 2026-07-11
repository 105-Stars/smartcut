/**
 * Internationalization (i18n) module for SmartCut
 * Lightweight, zero-dependency solution using JSON translation files.
 */

export type SupportedLocale = 'zh-CN' | 'en' | 'ja' | 'ko' | 'zh-TW'

export interface TranslationKeys {
  [key: string]: string | TranslationKeys
}

// Translation data — populated by each locale file
const translations = {} as Record<SupportedLocale, TranslationKeys>

let currentLocale: SupportedLocale = 'zh-CN'

/** Initialize translations from a locale file */
export function initTranslations(locale: SupportedLocale, data: TranslationKeys) {
  translations[locale] = data
}

/** Get the current locale */
export function getLocale(): SupportedLocale {
  return currentLocale
}

/** Set the current locale */
export function setLocale(locale: SupportedLocale) {
  currentLocale = locale
  try {
    localStorage.setItem('smartcut-locale', locale)
  } catch { /* ignore */ }
}

/** Auto-detect locale from browser */
export function detectLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem('smartcut-locale')
    if (saved && saved in translations) return saved as SupportedLocale
  } catch { /* ignore */ }

  // Browser language detection
  const browserLang = (navigator.language || '').toLowerCase()
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('ko')) return 'ko'
  if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hk')) return 'zh-TW'
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('en')) return 'en'

  return 'en'
}

/**
 * Flatten nested translation keys into dot-separated paths.
 * e.g. { hero: { title: 'Hello' } } → { 'hero.title': 'Hello' }
 */
function flatten(obj: TranslationKeys, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      result[fullKey] = value
    } else {
      Object.assign(result, flatten(value, fullKey))
    }
  }
  return result
}

const flatTranslations = {} as Record<SupportedLocale, Record<string, string>>

/** Pre-flatten all translations for fast lookup */
export function flattenAllTranslations() {
  for (const [locale, data] of Object.entries(translations)) {
    flatTranslations[locale as SupportedLocale] = flatten(data as TranslationKeys)
  }
}

/**
 * Translate a dot-separated key. Falls back to English, then to the key itself.
 * Supports interpolation: {0}, {1}, etc.
 * e.g. t('format.file_size', {0: formatBytes(size)})
 */
export function t(key: string, params?: Record<string, string>): string {
  const dict = flatTranslations[currentLocale]
  let value = dict?.[key]

  // Fallback to English
  if (!value) {
    value = flatTranslations['en']?.[key]
  }

  // If still not found, return the key
  if (!value) {
    return key
  }

  // Interpolate params: {0}, {1}, etc.
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue)
    }
  }

  return value
}
