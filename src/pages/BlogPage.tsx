import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { Reveal } from './_pageKit'
import { formatDate } from '../lib/utils'
import { blogArticles, blogCategoryLabels, type BlogArticle, type BlogCategory, type BlogLocale } from './blogData'

/* 强调色映射（与 _pageKit 保持一致） */
const ACCENTS: Record<string, string> = {
  brand: 'from-brand-500 to-accent-500',
  violet: 'from-brand-500 to-brand-700',
  cyan: 'from-accent-400 to-accent-600',
  emerald: 'from-emerald-400 to-emerald-600',
  rose: 'from-rose-400 to-rose-600',
  amber: 'from-amber-400 to-amber-600',
}

type Filter = BlogCategory | 'all'

/* ============================================================
   renderBody — 将正文中的 [text](url) 转换为带 target="_blank" 的 <a> 标签，
   同时保留现有 whitespace-pre-line 换行行为。
   正则匹配：开头的 `[`, 非 `]` 的文本, `]`, `(`, 非 `)` 的 URL, `)`。
   ============================================================ */
function renderBody(text: string) {
  const parts: (string | React.ReactNode)[] = []
  let lastIndex = 0
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer"
        className="font-medium text-brand-600 underline decoration-brand-300/50 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-500">
        {match[1]}
      </a>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts.length > 0 ? parts : text
}

/* ============================================================
 * Blog Hero — 论点先行 + 流动渐变光晕
 * ============================================================ */
function BlogHero({ t }: { t: (k: string, p?: Record<string, string>) => string }) {
  return (
    <Reveal>
      <section className="relative overflow-hidden pb-6 pt-6 text-center sm:pt-10">
        {/* 流动光晕 */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-400/20 to-accent-400/20 blur-3xl animate-[float_7s_ease-in-out_infinite]" />
          <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-gradient-to-br from-rose-400/15 to-amber-400/15 blur-3xl animate-[float_9s_ease-in-out_infinite_reverse]" />
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          {t('blog.hero_eyebrow')}
        </span>

        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          {t('blog.hero_title_lead')}{' '}
          <span className="text-gradient-brand">{t('blog.hero_title_accent')}</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {t('blog.hero_subtitle')}
        </p>

        {/* 数据条 */}
        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-6 text-center">
          <div>
            <div className="font-display text-2xl font-extrabold text-gradient-brand">{blogArticles.length}</div>
            <div className="text-xs text-slate-500">{t('blog.stat_articles')}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="font-display text-2xl font-extrabold text-gradient-brand">5</div>
            <div className="text-xs text-slate-500">{t('blog.stat_languages')}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="font-display text-2xl font-extrabold text-gradient-brand">100%</div>
            <div className="text-xs text-slate-500">{t('blog.stat_local')}</div>
          </div>
        </div>
      </section>
    </Reveal>
  )
}

/* ============================================================
 * 控制条 — 搜索 + 分类筛选
 * ============================================================ */
function BlogControls({
  t,
  filter,
  setFilter,
  query,
  setQuery,
}: {
  t: (k: string, p?: Record<string, string>) => string
  filter: Filter
  setFilter: (f: Filter) => void
  query: string
  setQuery: (q: string) => void
}) {
  const categories: Filter[] = ['all', 'product', 'tech', 'privacy', 'tutorial', 'usecase', 'format']
  const { locale } = useTranslation()

  return (
    <Reveal>
      <div className="sticky top-[64px] z-30 -mx-4 mb-6 border-b border-slate-100 px-4 py-3 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        {/* 搜索 */}
        <div className="relative mb-3">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('blog.search_placeholder')}
            className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
          />
        </div>

        {/* 分类 chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = filter === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                  active
                    ? 'bg-gradient-brand text-white shadow-glow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {c === 'all' ? t('blog.all') : blogCategoryLabels[c as BlogCategory][locale as BlogLocale]}
              </button>
            )
          })}
        </div>
      </div>
    </Reveal>
  )
}

/* ============================================================
 * 文章卡片（常规）
 * ============================================================ */
function ArticleCard({
  article,
  locale,
  t,
  onOpen,
  index,
}: {
  article: BlogArticle
  locale: BlogLocale
  t: (k: string, p?: Record<string, string>) => string
  onOpen: () => void
  index: number
}) {
  const loc = article.t[locale]
  const label = blogCategoryLabels[article.category][locale]

  return (
    <Reveal delay={Math.min(index * 70, 490)}>
      <article
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
        className="group relative h-full cursor-pointer overflow-hidden rounded-3xl bg-white p-[1.5px] shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-accent-500/0 opacity-0 transition-opacity duration-300 group-hover:from-brand-500/20 group-hover:to-accent-500/20 group-hover:opacity-100" />
        <div className="relative h-full rounded-[calc(1.5rem-1.5px)] bg-white p-5">
          {/* 顶部：图标 + 分类 + 日期 */}
          <div className="flex items-center gap-2 pt-2">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${ACCENTS[article.accent]} text-base shadow-sm`}>
              {article.emoji}
            </div>
            <span className={`rounded-full bg-gradient-to-r ${ACCENTS[article.accent]} bg-clip-text px-1 text-xs font-semibold text-transparent`}>
              {label}
            </span>
            <span className="ml-auto text-xs text-slate-400">{formatDate(article.date, locale)}</span>
          </div>

          {/* 标题 + 摘要 */}
          <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700">
            {loc.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{loc.excerpt}</p>

          {/* 底部：阅读时长 + 箭头 */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-400">
              {t('blog.min_read', { 0: String(article.readingMinutes) })}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-transform duration-300 group-hover:translate-x-1">
              {t('blog.read_more')}
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

/* ============================================================
 * 精选大卡（列表首篇）
 * ============================================================ */
function FeaturedCard({
  article,
  locale,
  t,
  onOpen,
}: {
  article: BlogArticle
  locale: BlogLocale
  t: (k: string, p?: Record<string, string>) => string
  onOpen: () => void
}) {
  const loc = article.t[locale]
  const label = blogCategoryLabels[article.category][locale]

  return (
    <Reveal>
      <article
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
        className="group relative col-span-full cursor-pointer overflow-hidden rounded-3xl bg-white p-[1.5px] shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:col-span-2"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[article.accent]} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
        <div className="relative grid gap-5 rounded-[calc(1.5rem-1.5px)] bg-white p-6 sm:grid-cols-[180px_1fr] sm:p-7">
          {/* 视觉区 */}
          <div className={`relative grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${ACCENTS[article.accent]} text-4xl shadow-glow`}>
            <div className="absolute inset-0 animate-[spin_22s_linear_infinite] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]" />
            <span className="relative inline-block drop-shadow-lg px-3 pt-3">{article.emoji}</span>
          </div>
          {/* 文本区 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full px-2 py-0.5 font-semibold text-slate-600" style={{ backgroundColor: 'transparent' }}>{label}</span>
              <span className="text-slate-400">{formatDate(article.date, locale)}</span>
              <span className="ml-auto text-slate-400">{t('blog.min_read', { 0: String(article.readingMinutes) })}</span>
            </div>
            <h3 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-brand-700">
              {loc.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{loc.excerpt}</p>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-600 transition-transform duration-300 group-hover:translate-x-1">
              {t('blog.read_more')}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

/* ============================================================
 * 文章详情（阅读视图）
 * ============================================================ */
function ArticleDetail({
  article,
  locale,
  t,
  onBack,
  onNavigate,
}: {
  article: BlogArticle
  locale: BlogLocale
  t: (k: string, p?: Record<string, string>) => string
  onBack: () => void
  onNavigate: (id: string) => void
}) {
  const loc = article.t[locale]
  const label = blogCategoryLabels[article.category][locale]
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const scrolled = h.scrollTop
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? Math.min(100, (scrolled / max) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const idx = blogArticles.findIndex((a) => a.id === article.id)
  const prev = idx > 0 ? blogArticles[idx - 1] : null
  const next = idx < blogArticles.length - 1 ? blogArticles[idx + 1] : null

  return (
    <div className="relative">
      {/* 阅读进度条 */}
      <div className="fixed left-0 right-0 top-[57px] z-30 h-0.5 bg-slate-100">
        <div
          ref={progressRef}
          className="h-full bg-gradient-brand transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Reveal>
        <button
          type="button"
          onClick={onBack}
          className="group mb-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('blog.back')}
        </button>
      </Reveal>

      {/* 头部 */}
      <Reveal>
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-white p-7 shadow-soft sm:p-10">
          <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${ACCENTS[article.accent]} opacity-15 blur-2xl`} />
          <div className="flex items-center gap-3 text-xs">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${ACCENTS[article.accent]} text-2xl shadow-glow`}>
              {article.emoji}
            </span>
            <div>
              <div className="font-semibold text-brand-700">{label}</div>
              <div className="text-slate-400">
                {formatDate(article.date, locale)} · {t('blog.min_read', { 0: String(article.readingMinutes) })}
              </div>
            </div>
          </div>

          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {loc.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{loc.excerpt}</p>
        </header>
      </Reveal>

      {/* 正文 */}
      <div className="mt-8 space-y-8">
        {loc.sections.map((sec, i) => (
          <Reveal key={i} delay={i * 50}>
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span className={`h-5 w-1.5 rounded-full bg-gradient-to-b ${ACCENTS[article.accent]}`} />
                {sec.heading}
              </h2>

              {sec.body && (
                <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-slate-700">{renderBody(sec.body)}</p>
              )}

              {sec.quote && (
                <blockquote className={`mt-4 rounded-r-xl border-l-4 border-brand-400 bg-gradient-to-r from-brand-50/70 to-transparent px-4 py-3 text-[15px] font-medium italic leading-7 text-slate-700`}>
                  “{sec.quote}”
                </blockquote>
              )}

              {sec.list && sec.list.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {sec.list.map((item, j) => (
                    <li key={j} className="flex gap-2.5 text-[15px] leading-7 text-slate-700">
                      <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${ACCENTS[article.accent]}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        ))}
      </div>

      {/* 上一篇 / 下一篇 */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {prev ? (
          <button
            type="button"
            onClick={() => onNavigate(prev.id)}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-brand-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <div className="text-xs text-slate-400">{t('blog.prev')}</div>
            <div className="mt-1 font-semibold text-slate-700 transition-colors group-hover:text-brand-700">{prev.t[locale].title}</div>
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            type="button"
            onClick={() => onNavigate(next.id)}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-right transition-all hover:border-brand-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <div className="text-xs text-slate-400">{t('blog.next')}</div>
            <div className="mt-1 font-semibold text-slate-700 transition-colors group-hover:text-brand-700">{next.t[locale].title}</div>
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}

/* ============================================================
 * 博客页主体
 * ============================================================ */
export default function BlogPage() {
  const { t, locale } = useTranslation()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = useMemo(() => blogArticles.find((a) => a.id === activeId) ?? null, [activeId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return blogArticles.filter((a) => {
      if (filter !== 'all' && a.category !== filter) return false
      if (q) {
        const loc = a.t[locale as BlogLocale]
        const hay = `${loc.title} ${loc.excerpt}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [filter, query, locale])

  // 打开文章时回到顶部
  useEffect(() => {
    if (activeId) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeId])

  return (
    <div className="relative">
      {active ? (
        <ArticleDetail
          article={active}
          locale={locale as BlogLocale}
          t={t}
          onBack={() => setActiveId(null)}
          onNavigate={setActiveId}
        />
      ) : (
        <>
          <BlogHero t={t} />
          <BlogControls
            t={t}
            filter={filter}
            setFilter={setFilter}
            query={query}
            setQuery={setQuery}
          />

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 py-16 text-center">
              <div className="text-4xl">🔍</div>
              <p className="mt-3 text-sm text-slate-500">{t('blog.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filtered.map((a, i) => {
                const showFeatured = i === 0 && filter === 'all' && !query.trim()
                return showFeatured ? (
                  <FeaturedCard
                    key={a.id}
                    article={a}
                    locale={locale as BlogLocale}
                    t={t}
                    onOpen={() => setActiveId(a.id)}
                  />
                ) : (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    locale={locale as BlogLocale}
                    t={t}
                    onOpen={() => setActiveId(a.id)}
                    index={showFeatured ? i - 1 : i}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
