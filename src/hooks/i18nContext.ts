import { createContext } from 'react'
import { type SupportedLocale, t as translate } from '../i18n/translations'

export const I18nContext = createContext<{
  locale: SupportedLocale
  setLocale: (l: SupportedLocale) => void
  t: typeof translate
} | null>(null)
