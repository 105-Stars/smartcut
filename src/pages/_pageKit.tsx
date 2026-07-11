import { useEffect, useRef, useState, type ReactNode } from 'react'

/* ============================================================
 * SmartCut · 信息页共享设计系统（内容层）
 * 导航栏与页脚沿用主页（App），此处只负责页面内容：
 * 玻璃拟态卡片、流动渐变、滚动渐显、渐变描边高亮卡。
 * 所有表面借助主题全局覆盖，自动适配明/暗双主题。
 * ============================================================ */

export const SMARTCUT_EMAIL = 'S1052366296@gmail.com'
export const SMARTCUT_GITHUB = 'https://github.com/105-Stars/smartcut'

const ACCENT: Record<string, string> = {
  brand: 'from-brand-500 to-accent-500',
  violet: 'from-brand-500 to-brand-700',
  cyan: 'from-accent-400 to-accent-600',
  emerald: 'from-emerald-400 to-emerald-600',
  rose: 'from-rose-400 to-rose-600',
}

/* ---------- 图标 ---------- */
const IconMail = (p: { className?: string }) => (
  <svg className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)
const IconGitHub = (p: { className?: string }) => (
  <svg className={p.className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)
const IconCheck = (p: { className?: string }) => (
  <svg className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
const IconCopy = (p: { className?: string }) => (
  <svg className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m9.75 0a1.5 1.5 0 001.5-1.5V6.75A1.5 1.5 0 0015.75 5.25H6.75m9.75 0a1.5 1.5 0 001.5-1.5V6.75A1.5 1.5 0 0015.75 5.25H6.75" />
  </svg>
)

/* ---------- 滚动渐显（尊重 reduce-motion） ---------- */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(20px)',
        transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ---------- Hero（论点先行） ---------- */
function PageHero({
  eyebrow,
  titleLead,
  titleAccent,
  subtitle,
  children,
}: {
  eyebrow: string
  titleLead: string
  titleAccent: string
  subtitle: string
  children?: ReactNode
}) {
  return (
    <Reveal>
      <section className="pb-8 pt-8 text-center sm:pt-12">
        {children && <div className="mb-8 flex justify-center">{children}</div>}
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gradient-brand">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {titleLead} <span className="text-gradient-brand">{titleAccent}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">{subtitle}</p>
      </section>
    </Reveal>
  )
}

/* ---------- 普通条目卡片 ---------- */
function InfoSection({
  index,
  title,
  accent = 'brand',
  children,
}: {
  index?: number
  title: string
  accent?: keyof typeof ACCENT
  children: ReactNode
}) {
  return (
    <Reveal>
      <article className="group relative overflow-hidden rounded-2xl glass-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated sm:p-6">
        <span
          className={`pointer-events-none absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b ${ACCENT[accent]} opacity-70 transition-all duration-300 group-hover:w-1.5 group-hover:opacity-100`}
        />
        <div className="pl-3">
          {index !== undefined && (
            <span className="font-display text-xs font-bold text-gradient-brand">{String(index).padStart(2, '0')}</span>
          )}
          <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
        </div>
      </article>
    </Reveal>
  )
}

/* ---------- 签名高亮卡（渐变描边 + 光晕） ---------- */
function HighlightCard({
  eyebrow,
  title,
  accent = 'brand',
  icon,
  children,
}: {
  eyebrow?: string
  title: string
  accent?: keyof typeof ACCENT
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <Reveal>
      <div className="relative rounded-3xl bg-gradient-brand p-[1.5px] shadow-glow transition-transform duration-300 hover:-translate-y-1">
        <div className="rounded-[calc(1.5rem-1.5px)] glass-card p-6 sm:p-7">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${ACCENT[accent]} text-white shadow-glow`}>
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</span>}
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">{title}</h2>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/* ---------- 联系方式卡（含邮箱一键复制） ---------- */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 剪贴板不可用时静默 */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="复制邮箱"
      className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {copied ? <IconCheck className="h-3.5 w-3.5 text-emerald-500" /> : <IconCopy className="h-3.5 w-3.5" />}
      <span>{copied ? '已复制' : '复制'}</span>
    </button>
  )
}

function ContactCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Reveal>
      <div className="rounded-3xl glass-card p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
            <IconMail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <a
            href={`mailto:${SMARTCUT_EMAIL}`}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all hover:border-brand-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <IconMail className="h-5 w-5 shrink-0 text-brand-600" />
            <span className="text-sm font-medium text-slate-700">{SMARTCUT_EMAIL}</span>
            <CopyButton value={SMARTCUT_EMAIL} />
          </a>
          <a
            href={SMARTCUT_GITHUB}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all hover:border-brand-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <IconGitHub className="h-5 w-5 shrink-0 text-slate-700" />
            <span className="text-sm font-medium text-slate-700">github.com/105-Stars/smartcut</span>
          </a>
        </div>
      </div>
    </Reveal>
  )
}

export { Reveal, PageHero, InfoSection, HighlightCard, ContactCard }
