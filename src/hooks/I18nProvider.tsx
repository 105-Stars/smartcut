/**
 * React Context provider for internationalization.
 * Exports ONLY the <I18nProvider> component so React Fast Refresh works.
 * The context itself lives in ./i18nContext, the hook in ./useTranslation.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  type SupportedLocale,
  getLocale,
  setLocale as persistLocale,
  initTranslations,
  flattenAllTranslations,
  t as translate,
} from '../i18n/translations'
import { zhCN } from '../i18n/locales/zh-CN'
import { en } from '../i18n/locales/en'
import { ja } from '../i18n/locales/ja'
import { ko } from '../i18n/locales/ko'
import { zhTW } from '../i18n/locales/zh-TW'
import { I18nContext } from './i18nContext'

// Initialize translations at module load time
initTranslations('zh-CN', zhCN)
initTranslations('en', en)
initTranslations('ja', ja)
initTranslations('ko', ko)
initTranslations('zh-TW', zhTW)
flattenAllTranslations()

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(getLocale())

  const setLocale = useCallback((l: SupportedLocale) => {
    persistLocale(l)
    setLocaleState(l)
  }, [])

  // Sync document lang attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translate }}>
      {children}
    </I18nContext.Provider>
  )
}
