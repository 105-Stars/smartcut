import { describe, it, expect, beforeAll } from 'vitest'
import { t, initTranslations, flattenAllTranslations, setLocale } from './translations'
import { zhCN } from './locales/zh-CN'
import { en } from './locales/en'

beforeAll(() => {
  setLocale('zh-CN')
  initTranslations('zh-CN', zhCN)
  initTranslations('en', en)
  flattenAllTranslations()
})

describe('t()', () => {
  it('returns the translation for a known key', () => {
    expect(t('blog.hero_eyebrow')).toBe('博客')
  })

  it('interpolates {0} placeholders with string params', () => {
    expect(t('blog.min_read', { 0: '3' })).toBe('阅读约 3 分钟')
  })

  it('returns the key when no translation exists', () => {
    expect(t('this.key.does.not.exist')).toBe('this.key.does.not.exist')
  })

  it('returns the raw template when no params are given', () => {
    expect(t('blog.min_read')).toBe('阅读约 {0} 分钟')
  })
})
