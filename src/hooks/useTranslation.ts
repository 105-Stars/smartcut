/**
 * useTranslation hook — must be used within <I18nProvider>.
 * Kept in its own file (no component/context exports) so React Fast Refresh works.
 */
import { useContext } from 'react'
import { type SupportedLocale } from '../i18n/translations'
import { I18nContext } from './i18nContext'

const LOCALE_LIST: { code: SupportedLocale; label: string }[] = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-TW', label: '繁體中文' },
]

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return { ...ctx, locales: LOCALE_LIST }
}
