import { type CSSProperties, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  removeBackgroundFromImageBitmap,
  type RemoveBackgroundProgress,
} from './lib/removeBackground'
import { formatBytes } from './lib/utils'
import { getCropRect } from './lib/crop'
import { useTranslation } from './hooks/useTranslation'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// Info pages are route-level split so they don't bloat the initial cutout bundle.
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type BgMode = 'transparent' | 'color' | 'image'

const CHECKERBOARD_STYLE: CSSProperties = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'linear-gradient(45deg, #d4d4d8 25%, transparent 25%), linear-gradient(-45deg, #d4d4d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d8 75%), linear-gradient(-45deg, transparent 75%, #d4d4d8 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
}

/* ===== SVG 图标组件 ===== */
const IconUpload = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
)
const IconInbox = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
  </svg>
)
const IconX = ({ className }: { className?: string }) => (
  <svg className={className ?? 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const IconAlert = () => (
  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
)
const IconShield = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)
const IconLightning = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
)
const IconPaint = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
  </svg>
)
const IconGift = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25" />
  </svg>
)
const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className ?? 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
const IconChevronDown = ({ className }: { className?: string }) => (
  <svg className={className ?? 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)
const IconSparkles = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)

/** 加载图片为 Image 元素 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`加载图片失败: ${src}`))
    img.src = src
  })
}

/* ===== 子组件 ===== */

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group cursor-pointer rounded-2xl border border-slate-200/60 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-elevated">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 text-brand-600 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:from-brand-100 group-hover:to-accent-100 group-hover:shadow-glow">
        {icon}
      </div>
      <div className="mt-4 text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{desc}</p>
    </div>
  )
}

function StepCard({ num, icon, title, desc }: { num: number; icon: React.ReactNode; title: string; desc: React.ReactNode }) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-elevated">
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
          {icon}
          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-900 shadow-sm ring-1 ring-slate-200">
            {num}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</div>
        </div>
      </div>
    </div>
  )
}

/** Before/After 对比滑块组件 — 自动循环展示抠图前后效果 */
function BeforeAfterSlider({ beforeSrc, afterSrc, label, autoPlayDelay = 0 }: { 
  beforeSrc: string
  afterSrc: string
  label: string
  autoPlayDelay?: number  // 错峰启动延迟（ms）
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderPos, setSliderPos] = useState(100)  // 从最右端（100%）出发
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  // 仅通过 ref 追踪动画状态，避免闭包陈旧
  const animEnabledRef = useRef(true)
  const animPhaseRef = useRef<'hold' | 'reveal' | 'pause'>('hold')
  const animStartRef = useRef(Date.now())
  const animFrameRef = useRef(0)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const HOLD_MS = 1500    // 先展示原图时长
  const REVEAL_MS = 2500  // 扫过时长
  const PAUSE_MS = 6000   // 等待时长
  const IDLE_RESUME_MS = 3000  // 用户拖拽后空闲多久恢复自动播放

  // 计算鼠标/触摸在容器内的百分比位置
  const computePos = useCallback((clientX: number) => {
    if (!containerRef.current) return 50
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    return Math.round((x / rect.width) * 100)
  }, [])

  // 停止自动播放
  const stopAutoPlay = useCallback(() => {
    animEnabledRef.current = false
    cancelAnimationFrame(animFrameRef.current)
    clearTimeout(resumeTimerRef.current)
  }, [])

  // 启动自动播放循环
  const startAutoPlay = useCallback(() => {
    animEnabledRef.current = true
    animPhaseRef.current = 'hold'
    animStartRef.current = Date.now()
    setSliderPos(100)
    setIsAnimating(true)

    const tick = () => {
      if (!animEnabledRef.current) return

      const elapsed = Date.now() - animStartRef.current

      if (animPhaseRef.current === 'hold') {
        // 保持 100%（展示完整原图）HOLD_MS 时长
        setSliderPos(100)
        if (elapsed >= HOLD_MS) {
          animPhaseRef.current = 'reveal'
          animStartRef.current = Date.now()
        }
      }

      if (animPhaseRef.current === 'reveal') {
        // 100% → 0%，ease-out cubic 平滑过渡
        const t = Math.min(elapsed / REVEAL_MS, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        const pos = Math.round(100 - eased * 100)
        setSliderPos(Math.max(0, pos))

        if (t >= 1) {
          animPhaseRef.current = 'pause'
          animStartRef.current = Date.now()
        }
      }

      if (animPhaseRef.current === 'pause') {
        setSliderPos(0)
        if (elapsed >= PAUSE_MS) {
          animPhaseRef.current = 'hold'
          animStartRef.current = Date.now()
          setSliderPos(100)
        }
      }

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }, [])

  // 初始化自动播放（含错峰延迟）
  useEffect(() => {
    initTimerRef.current = setTimeout(() => startAutoPlay(), autoPlayDelay)
    return () => {
      clearTimeout(initTimerRef.current)
      cancelAnimationFrame(animFrameRef.current)
      clearTimeout(resumeTimerRef.current)
    }
  }, [autoPlayDelay, startAutoPlay])

  // 用户拖拽开始 → 中断自动播放
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    stopAutoPlay()
    setIsAnimating(false)
    const clientX = 'touches' in e
      ? e.touches[0].clientX
      : (e as React.MouseEvent).clientX
    setSliderPos(computePos(clientX))
    setIsDragging(true)
  }, [stopAutoPlay, computePos])

  // 全局拖拽事件（鼠标+touch）
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent) => {
      setSliderPos(computePos(e.clientX))
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setSliderPos(computePos(e.touches[0].clientX))
      }
    }
    const handleEnd = () => {
      setIsDragging(false)
      // 停止拖拽 3s 后恢复自动播放
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = setTimeout(() => {
        startAutoPlay()
      }, IDLE_RESUME_MS)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, computePos, startAutoPlay])

  // 棋盘格背景样式（表示透明）
  const checkerboardStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    backgroundImage:
      'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-xl select-none"
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{ aspectRatio: '1/1' }}
      role="slider"
      aria-label={`${label} 对比图`}
      aria-valuenow={sliderPos}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
    >
      {/* 底层：棋盘格背景（透过透明区域显示） */}
      <div className="absolute inset-0" style={checkerboardStyle} />
      
      {/* 中层：处理后图片（透明背景，棋盘格穿透显示） */}
      <img 
        src={afterSrc} 
        alt={`${label} 处理后`} 
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
        style={{ imageRendering: 'auto' }}
      />
      
      {/* 顶部：原始图片 — 使用 clip-path 裁剪，图片始终完整无变形 */}
      <div 
        className="absolute inset-0"
        style={{ 
          clipPath: sliderPos === 0 
            ? 'inset(0 100% 0 0)' 
            : `inset(0 ${100 - sliderPos}% 0 0)` 
        }}
      >
        <img 
          src={beforeSrc} 
          alt={`${label} 原图`} 
          className="h-full w-full object-cover"
          draggable={false}
          style={{ imageRendering: 'auto' }}
        />
        {/* 原图标签 */}
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          原图
        </div>
      </div>

      {/* 抠图结果标签（在右侧常显） */}
      <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
        抠图
      </div>

      {/* 中间分割线 */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div 
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full shadow-lg transition-all duration-200 ${
            isDragging 
              ? 'scale-110 bg-brand-600' 
              : isAnimating 
                ? 'bg-brand-400/90' 
                : 'bg-brand-500'
          }`}
        >
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>

      {/* 底部提示条 */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 text-[10px] text-white/80">
        <span className="rounded bg-black/40 px-2 py-0.5 backdrop-blur-sm">
          {isAnimating ? 'AI 自动演示中' : '拖拽手动对比'}
        </span>
      </div>
    </div>
  )
}

/** 示例卡片组件 — 使用 Before/After 对比滑块展示抠图效果 */
function ExampleCard({ originalSrc, processedSrc, category, label, autoPlayDelay = 0 }: { 
  originalSrc: string
  processedSrc: string
  category: string
  label: string
  autoPlayDelay?: number
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <BeforeAfterSlider 
        beforeSrc={originalSrc}
        afterSrc={processedSrc}
        label={category}
        autoPlayDelay={autoPlayDelay}
      />

      {/* 底部信息栏 */}
      <div className="bg-gradient-to-r from-violet-50/80 to-cyan-50/80 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">{category}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a, open: defaultOpen }: { q: string; a: string; open?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false)
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white transition-all duration-200 hover:border-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-900 transition-all hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        <span>{q}</span>
        <IconChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="border-t border-slate-100 px-5 pb-4 pt-3 text-xs leading-relaxed text-slate-500">{a}</p>
      </div>
    </div>
  )
}

function SuccessToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-white px-5 py-3 shadow-elevated backdrop-blur-sm">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <IconCheck className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-slate-900">{message}</span>
      </div>
    </div>
  )
}

/** 轻量粒子背景特效 — Canvas 渲染，自动性能降级 */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<{
    x: number; y: number; vx: number; vy: number; r: number; o: number
  }[]>([])
  const rafRef = useRef(0)
  const frameSkipRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 性能检测：低配设备降级
    const isLowEnd = !window.matchMedia('(min-resolution: 1.5dppx)').matches &&
      navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4
    frameSkipRef.current = isLowEnd ? 3 : 1

    // 移动端降低粒子数量
    const isMobile = window.innerWidth < 640
    const baseCount = isMobile ? 25 : Math.min(Math.floor(window.innerWidth / 16), 60)

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.scale(dpr, dpr)
    }
    resize()

    // 初始化粒子
    const w = () => window.innerWidth
    const h = () => window.innerHeight
    particlesRef.current = Array.from({ length: baseCount }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
      o: Math.random() * 0.25 + 0.05,
    }))

    let frameCount = 0
    let resizeTimer: ReturnType<typeof setTimeout>

    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 200)
    }
    window.addEventListener('resize', onResize)

    // 延迟启动粒子动画，让出首屏渲染资源
    const startDelay = setTimeout(() => {
      function animate() {
        frameCount++
        if (frameCount % frameSkipRef.current !== 0) {
          rafRef.current = requestAnimationFrame(animate)
          return
        }
        ctx!.clearRect(0, 0, w(), h())
        const pts = particlesRef.current
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i]
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0) p.x = w()
          if (p.x > w()) p.x = 0
          if (p.y < 0) p.y = h()
          if (p.y > h()) p.y = 0
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          // Brand gradient particles — purple-cyan spectrum
          const hue = 250 + (i % 6) * 10
          ctx!.fillStyle = `hsla(${hue}, 80%, 65%, ${p.o})`
          ctx!.fill()
        }
        // 连接线（相近粒子，平方距离预筛避免 sqrt）
        const MAX_DIST_SQ = 14400
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x
            const dy = pts[i].y - pts[j].y
            const distSq = dx * dx + dy * dy
            if (distSq < MAX_DIST_SQ) {
              const alpha = 0.04 * (1 - Math.sqrt(distSq) / 120)
              ctx!.beginPath()
              ctx!.moveTo(pts[i].x, pts[i].y)
              ctx!.lineTo(pts[j].x, pts[j].y)
              ctx!.strokeStyle = `hsla(265, 70%, 70%, ${alpha})`
              ctx!.lineWidth = 0.5
              ctx!.stroke()
            }
          }
        }
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    }, 500)
    return () => {
      clearTimeout(startDelay)
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  return <canvas ref={canvasRef} id="particle-canvas" />
}

/* ===== 图片格式转换组件 ===== */

const CONVERT_ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
const CONVERT_MAX_BYTES = 20 * 1024 * 1024

type ConvertFormat = 'jpeg' | 'png' | 'webp'

function FormatConverter({ showSuccessToast: toast }: { showSuccessToast: (m: string) => void }) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [originUrl, setOriginUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>('png')
  const [quality, setQuality] = useState(90)
  const [isConverting, setIsConverting] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const formatLabels: Record<ConvertFormat, string> = { jpeg: t('convert.format_jpeg'), png: t('convert.format_png'), webp: t('convert.format_webp') }
  const mimeTypes: Record<ConvertFormat, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

  function validateFile(f: File) {
    if (!CONVERT_ACCEPTED.includes(f.type)) {
      setError(t('convert.error_supported_formats'))
      return false
    }
    if (f.size > CONVERT_MAX_BYTES) {
      setError(t('convert.error_file_too_large', { 0: formatBytes(f.size) }))
      return false
    }
    return true
  }

  function handleFile(f: File) {
    setError(null)
    setResultBlob(null)
    setResultUrl(null)
    if (!validateFile(f)) return
    setFile(f)
    if (originUrl) URL.revokeObjectURL(originUrl)
    setOriginUrl(URL.createObjectURL(f))
  }

  async function doConvert() {
    if (!file || !originUrl) return
    setError(null)
    setIsConverting(true)
    try {
      const img = await loadImage(originUrl)
      const canvas = canvasRef.current ?? document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error(t('convert.error_canvas_init'))
      ctx.drawImage(img, 0, 0)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeTypes[targetFormat], quality / 100)
      })
      if (!blob) throw new Error(t('convert.error_conversion'))
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
      toast(t('convert.toast_done', { 0: formatLabels[targetFormat] }))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('convert.error_generic'))
    } finally {
      setIsConverting(false)
    }
  }

  function handleDownload() {
    if (!resultBlob) return
    const url = URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    const base = file ? file.name.replace(/\.[^.]+$/, '') : 'image'
    a.download = `${base}_${formatLabels[targetFormat].toLowerCase()}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 3000)
    toast(t('convert.toast_download'))
  }

  function resetAll() {
    if (originUrl) URL.revokeObjectURL(originUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setOriginUrl(null)
    setResultBlob(null)
    setResultUrl(null)
    setTargetFormat('png')
    setQuality(90)
    setError(null)
    setIsConverting(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-extrabold font-display tracking-tight text-slate-900 sm:text-3xl">
          <span className="text-gradient-brand">{t('convert.title')}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t('convert.sub')}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Left Panel */}
        <section className="lg:col-span-2" aria-label={t('convert.panel_label')}>
          <div className="glass-card rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated">
            <h2 className="text-base font-bold font-display text-slate-900">{t('convert.panel_title')}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t('convert.panel_sub')}</p>

            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/bmp,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.currentTarget.value = '' }}
              aria-label={t('convert.file_input_label')} />
            <button
              type="button" onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true) }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false) }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
              aria-label={t('convert.dropzone_label')}
              className={`mt-4 w-full rounded-2xl border-2 border-dashed px-4 py-8 text-left transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isDragOver ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm transition-all ${isDragOver ? 'bg-gradient-brand text-white shadow-glow' : 'bg-white text-brand-600'}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-sm font-semibold text-slate-800">{isDragOver ? t('convert.drag_over') : t('convert.dropzone_label')}</div>
                  <div className="mt-0.5 text-xs text-slate-400">JPG / PNG / GIF / BMP / WebP</div>
                </div>
              </div>
              {file ? (
                <div className="mt-4 animate-slide-in rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate font-medium">{file.name}</div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-slate-400">{formatBytes(file.size)}</span>
                      <button type="button" onClick={resetAll}
                        className="rounded-lg border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                        {t('panel.clear_result')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </button>

            {/* 格式选择 */}
            {file ? (
              <div className="mt-5 animate-fade-in-up space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">{t('convert.select_format')}</label>
                  <div className="mt-1 inline-flex rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
                    {(['jpeg', 'png', 'webp'] as ConvertFormat[]).map((fmt) => (
                      <button key={fmt} type="button" onClick={() => setTargetFormat(fmt)}
                        className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          targetFormat === fmt ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}>{formatLabels[fmt]}</button>
                    ))}
                  </div>
                </div>

                {/* 质量滑块 */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">{t('convert.quality_label')}</label>
                    <span className="text-sm font-bold text-slate-900">{quality}%</span>
                  </div>
                  <input type="range" min={10} max={100} step={1} value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                    className="mt-2 w-full accent-slate-900" aria-label={t('convert.quality_slider')} />
                  <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                    <span>{t('convert.quality_small')}</span>
                    <span>{t('convert.quality_large')}</span>
                  </div>
                </div>

                <button type="button" onClick={doConvert} disabled={isConverting}
                  className="w-full rounded-xl bg-gradient-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:shadow-glow hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:brightness-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                  {isConverting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {t('convert.converting')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      {t('convert.start_convert')}
                    </span>
                  )}
                </button>
              </div>
            ) : null}

            {error ? (
              <div className="mt-3 animate-fade-in-up rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">
                <div className="flex items-start gap-2">
                  <IconAlert />
                  <span>{error}</span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Right Panel — Preview */}
        <section className="lg:col-span-3" aria-label={t('convert.preview_label')}>
          <div className="grid gap-6">
            <div className="glass-card rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated">
              <h2 className="text-base font-bold font-display text-slate-900">{t('convert.preview_title')}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{t('convert.preview_sub')}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {/* 原图 */}
                <div className="group rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('convert.original_label')}{file ? ` · ${formatBytes(file.size)}` : ''}
                  </div>
                  <div className="mt-2 overflow-hidden rounded-xl bg-white shadow-sm">
                    {originUrl ? (
                      <img src={originUrl} alt={t('convert.original_alt')} className="max-h-[40vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="grid h-[180px] place-items-center text-xs text-slate-400">{t('convert.empty_preview')}</div>
                    )}
                  </div>
                </div>
                {/* 转换后 */}
                <div className="group rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {formatLabels[targetFormat]}
                    {resultBlob ? ` · ${formatBytes(resultBlob.size)}` : ''}
                  </div>
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {resultUrl ? (
                      <img src={resultUrl} alt={t('convert.converted_alt')} className="max-h-[40vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="grid h-[180px] place-items-center text-xs text-slate-400">{t('convert.empty_preview')}</div>
                    )}
                  </div>
                </div>
              </div>
              {/* 图片信息 */}
              {file && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="rounded-lg px-2.5 py-1 font-medium text-slate-700" style={{ backgroundColor: 'rgba(241,245,249,0.06)' }}>{file.name}</span>
                  <span>{file.type || 'N/A'}</span>
                </div>
              )}
            </div>

            {/* Download */}
            {resultBlob && (
              <div className="glass-card animate-fade-in-up rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div>
                    <h3 className="text-sm font-bold font-display text-slate-900">{t('convert.done')}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t('convert.download', { 0: formatLabels[targetFormat] })} · {formatBytes(resultBlob.size)}
                      {file ? `（原始 ${formatBytes(file.size)}）` : ''}
                      {file ? ` · 缩小 ${Math.round((1 - resultBlob.size / file.size) * 100)}%` : ''}
                    </p>
                  </div>
                  <button type="button" onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:shadow-glow hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('convert.download_button', { 0: formatLabels[targetFormat] })}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

/* ===== BackToTop 回到顶部组件 ===== */

/** 页面滚动距离超过视口高度 80% 时显示回到顶部按钮 */
function BackToTop({ t }: { t: (key: string) => string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    // 使用 passive 优化滚动性能
    window.addEventListener('scroll', handleScroll, { passive: true })
    // 初始化时检查一次
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('back_to_top')}
      className={`back-to-top group fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <svg className="h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  )
}

// Footer link base class — gradient dot + slide on hover (see .footer-link in index.css)
const FOOTER_LINK_CLS =
  'footer-link text-slate-300 transition-all duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

/* ===== MagicEraser 魔法擦除工具 ===== */

interface MagicEraserProps {
  cutoutUrl: string
  onResult: (blob: Blob) => void
  onClose: () => void
  t: (key: string, vars?: Record<string, string>) => string
}

function MagicEraser({ cutoutUrl, onResult, onClose, t }: MagicEraserProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [brushSize, setBrushSize] = useState(20)
  const [isDrawing, setIsDrawing] = useState(false)
  const undoStackRef = useRef<ImageData[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  // Cache the loaded base image so applyMask can run synchronously (no async reload race)
  const baseImageRef = useRef<HTMLImageElement | null>(null)
  // Last pointer position (for interpolating continuous strokes)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  // Brush cursor ring element
  const cursorRef = useRef<HTMLDivElement | null>(null)
  // Inner wrapper whose box is sized to the image's exact aspect ratio (prevents stretch/offset)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // Size the wrapper to the image's exact aspect ratio, fitting within the
  // available width and 55vh height. This guarantees the mask canvas box matches
  // its internal resolution, so a circular brush stays circular and aligned.
  function layout() {
    const wrapper = wrapperRef.current
    const baseImg = baseImageRef.current
    if (!wrapper || !baseImg) return
    const parent = wrapper.parentElement
    if (!parent) return
    const availW = parent.clientWidth || baseImg.naturalWidth
    const maxH = window.innerHeight * 0.55
    const nw = baseImg.naturalWidth
    const nh = baseImg.naturalHeight
    const scale = Math.min(availW / nw, maxH / nh)
    wrapper.style.width = `${Math.max(1, Math.floor(nw * scale))}px`
    wrapper.style.height = `${Math.max(1, Math.floor(nh * scale))}px`
  }

  // Load the image onto the canvas once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      // Cache the loaded image for synchronous mask application
      baseImageRef.current = img
      // Initialize mask canvas
      const maskCanvas = maskCanvasRef.current
      if (maskCanvas) {
        maskCanvas.width = img.naturalWidth
        maskCanvas.height = img.naturalHeight
        const mctx = maskCanvas.getContext('2d')
        if (mctx) {
          mctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
          // Save initial blank state for undo
          undoStackRef.current = [mctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)]
        }
      }
      layout()
    }
    img.src = cutoutUrl
  }, [cutoutUrl])

  // Re-layout on window resize so the box always matches the image aspect ratio
  useEffect(() => {
    const onResize = () => layout()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }

  // Move the brush cursor ring so the user can see its size and position
  function updateCursor(e: React.MouseEvent) {
    const cursor = cursorRef.current
    const canvas = maskCanvasRef.current
    if (!cursor || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const scale = rect.width / canvas.width
    // brushSize is the radius in canvas-internal pixels; the cursor diameter is 2 * radius * display scale
    const size = brushSize * 2 * scale
    cursor.style.width = `${size}px`
    cursor.style.height = `${size}px`
    cursor.style.left = `${e.clientX - rect.left}px`
    cursor.style.top = `${e.clientY - rect.top}px`
    cursor.style.opacity = '1'
  }

  function hideCursor() {
    if (cursorRef.current) cursorRef.current.style.opacity = '0'
    setIsDrawing(false)
    lastPosRef.current = null
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    if (!pos) return
    // Save current mask state for undo
    const mctx = maskCanvasRef.current?.getContext('2d')
    if (mctx && maskCanvasRef.current) {
      const current = mctx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height)
      // Keep only last 10 undo steps
      if (undoStackRef.current.length >= 10) undoStackRef.current.shift()
      undoStackRef.current.push(current)
    }
    lastPosRef.current = pos
    drawDab(pos)
    applyMask()
  }

  function moveDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    // Keep the cursor ring in sync while hovering or dragging (mouse only)
    if ('clientX' in e) updateCursor(e as React.MouseEvent)
    if (!isDrawing) return
    const pos = getPos(e)
    if (!pos) return
    const from = lastPosRef.current ?? pos
    // Interpolate so fast drags produce a continuous stroke (no gaps)
    drawLine(from, pos)
    lastPosRef.current = pos
  }

  function endDraw() {
    setIsDrawing(false)
    lastPosRef.current = null
  }

  // Draw a single brush dab on the mask (semi-transparent so the erased area shows through)
  function drawDab(pos: { x: number; y: number }) {
    const mctx = maskCanvasRef.current?.getContext('2d')
    if (!mctx || !maskCanvasRef.current) return
    mctx.globalCompositeOperation = 'source-over'
    mctx.fillStyle = 'rgba(255,255,255,0.55)'
    mctx.beginPath()
    mctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2)
    mctx.fill()
  }

  // Draw a continuous interpolated stroke between two points, then apply the mask once
  function drawLine(from: { x: number; y: number }, to: { x: number; y: number }) {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const dist = Math.hypot(dx, dy)
    const steps = Math.max(1, Math.ceil(dist / Math.max(1, brushSize / 2)))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      drawDab({ x: from.x + dx * t, y: from.y + dy * t })
    }
    applyMask()
  }

  function applyMask() {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    const baseImg = baseImageRef.current
    if (!canvas || !maskCanvas || !baseImg) return
    const ctx = canvas.getContext('2d')
    const mctx = maskCanvas.getContext('2d')
    if (!ctx || !mctx) return
    // Redraw base image synchronously from the cached image
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(baseImg, 0, 0)
    // Apply mask: make white areas in mask transparent
    const maskData = mctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < maskData.data.length; i += 4) {
      // If mask pixel is white (painted area), make the image pixel transparent
      if (maskData.data[i] > 128) {
        imageData.data[i + 3] = 0
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }

  function undo() {
    if (undoStackRef.current.length <= 1) return
    undoStackRef.current.pop() // Remove current
    const prev = undoStackRef.current[undoStackRef.current.length - 1]
    const mctx = maskCanvasRef.current?.getContext('2d')
    if (!mctx || !maskCanvasRef.current) return
    mctx.putImageData(prev, 0, 0)
    applyMask()
  }

  async function handleApply() {
    // Apply the latest mask synchronously so the export always reflects edits
    applyMask()
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (blob) onResult(blob)
    }, 'image/png')
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Magic Eraser">
      <div ref={containerRef} className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl animate-fade-in-up sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900">{t('magic_eraser.button')}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{t('magic_eraser.tooltip')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={undo}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              {t('magic_undo.button')}
            </button>
            <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 focus-visible:outline-none">
              <span>{t('magic_brush.size')}</span>
              <input type="range" min={5} max={100} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 accent-slate-900" aria-label="Brush size" />
              <span className="w-6 text-center text-slate-500">{brushSize}</span>
            </label>
            <button type="button" onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <IconX />
            </button>
          </div>
        </div>
        {/* Canvas area */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200"
          style={CHECKERBOARD_STYLE}>
          <div ref={wrapperRef} className="relative mx-auto">
            {/* Result canvas: always reflects the live erased result (transparent where erased) */}
            <canvas
              ref={canvasRef}
              className="block h-full w-full"
            />
            {/* Mask canvas: interactive brush overlay on top (white strokes indicate erased area) */}
            <canvas
              ref={maskCanvasRef}
              onMouseDown={startDraw}
              onMouseMove={moveDraw}
              onMouseUp={endDraw}
              onMouseEnter={(e) => updateCursor(e)}
              onMouseLeave={hideCursor}
              onTouchStart={startDraw}
              onTouchMove={moveDraw}
              onTouchEnd={endDraw}
              className="absolute inset-0 h-full w-full cursor-none"
              style={{ touchAction: 'none' }}
            />
            {/* Brush cursor: visible yellow ring + transparent yellow fill showing exact brush size */}
            <div
              ref={cursorRef}
              className="pointer-events-none absolute z-10 rounded-full border-2 border-solid border-yellow-400 bg-yellow-400/30"
              style={{ width: 40, height: 40, transform: 'translate(-50%, -50%)', opacity: 0, transition: 'opacity 120ms' }}
              aria-hidden="true"
            />
          </div>
        </div>
        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{t('magic_eraser.hint')}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              {t('confirm.no')}
            </button>
            <button type="button" onClick={handleApply}
              className="rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-glow hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              {t('confirm.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== CropPresetPanel 预设裁剪工具 ===== */

interface CropPresetPanelProps {
  cutoutUrl: string
  onResult: (blob: Blob) => void
  onClose: () => void
  t: (key: string, vars?: Record<string, string>) => string
}

interface CropPreset {
  id: string
  name: string
  width: number
  height: number
  ratio: string
  category?: 'social' | 'cn' | 'intl'
}

function CropPresetPanel({ cutoutUrl, onResult, onClose, t }: CropPresetPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<CropPreset | null>(null)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const presets: CropPreset[] = [
    // 社交媒体 / Social media
    { id: '1:1', name: '1:1', width: 1080, height: 1080, ratio: '1:1', category: 'social' },
    { id: '4:3', name: '4:3', width: 1200, height: 900, ratio: '4:3', category: 'social' },
    { id: '16:9', name: '16:9', width: 1920, height: 1080, ratio: '16:9', category: 'social' },
    { id: '9:16', name: '9:16', width: 1080, height: 1920, ratio: '9:16', category: 'social' },
    { id: '3:2', name: '3:2', width: 1200, height: 800, ratio: '3:2', category: 'social' },
    { id: '2:3', name: '2:3', width: 800, height: 1200, ratio: '2:3', category: 'social' },
    { id: '4:5', name: '4:5', width: 1080, height: 1350, ratio: '4:5', category: 'social' },
    // 国内证件照 / China ID photos (300 DPI)
    { id: 'cn_1inch', name: t('preset_crops.cn_1inch'), width: 295, height: 413, ratio: '25×35mm', category: 'cn' },
    { id: 'cn_2inch', name: t('preset_crops.cn_2inch'), width: 413, height: 579, ratio: '35×49mm', category: 'cn' },
    { id: 'cn_small1', name: t('preset_crops.cn_small1'), width: 260, height: 378, ratio: '22×32mm', category: 'cn' },
    { id: 'cn_small2', name: t('preset_crops.cn_small2'), width: 413, height: 531, ratio: '35×45mm', category: 'cn' },
    { id: 'cn_big1', name: t('preset_crops.cn_big1'), width: 390, height: 567, ratio: '33×48mm', category: 'cn' },
    { id: 'cn_big2', name: t('preset_crops.cn_big2'), width: 413, height: 626, ratio: '35×53mm', category: 'cn' },
    // 国际护照 / 签证 / International passports & visas (300 DPI)
    { id: 'us_passport', name: t('preset_crops.us_passport'), width: 600, height: 600, ratio: '2×2 in', category: 'intl' },
    { id: 'ca_passport', name: t('preset_crops.ca_passport'), width: 591, height: 827, ratio: '50×70mm', category: 'intl' },
    { id: 'eu_passport', name: t('preset_crops.eu_passport'), width: 413, height: 531, ratio: '35×45mm', category: 'intl' },
  ]

  function handleSelectPreset(preset: CropPreset) {
    setSelectedPreset(preset)
    // Generate preview
    const img = new Image()
    img.onload = () => {
      const canvas = previewCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      // Calculate crop dimensions to fit within the image
      const { sx, sy, cropW, cropH } = getCropRect(
        img.naturalWidth,
        img.naturalHeight,
        preset.width,
        preset.height,
      )
      canvas.width = preset.width
      canvas.height = preset.height
      ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, preset.width, preset.height)
      const url = canvas.toDataURL('image/png')
      setPreviewUrl(url)
    }
    img.src = cutoutUrl
  }

  function handleApplyCrop() {
    if (!previewUrl) return
    // Create blob from the preview data URL
    const byteString = atob(previewUrl.split(',')[1])
    const mimeString = previewUrl.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], { type: mimeString })
    onResult(blob)
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t('preset_crops.title')}>
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl animate-fade-in-up sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900">{t('preset_crops.title')}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{t('preset_crops.sub')}</p>
          </div>
          <button type="button" onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <IconX />
          </button>
        </div>
        {/* Preset grid grouped by category */}
        <div className="space-y-4">
          {(['social', 'cn', 'intl'] as const).map((cat) => {
            const items = presets.filter((p) => p.category === cat)
            if (items.length === 0) return null
            return (
              <div key={cat}>
                <div className="mb-2 text-xs font-semibold text-slate-500">{t(`preset_crops.cat_${cat}`)}</div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {items.map((preset) => (
                    <button key={preset.id} type="button" onClick={() => handleSelectPreset(preset)}
                      className={`rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        selectedPreset?.id === preset.id
                          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}>
                      <div className="text-sm font-bold">{preset.name}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">{preset.ratio}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {/* Custom size input */}
        <div className="mt-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3">
          <label className="text-xs font-semibold text-slate-700">{t('preset_crops.custom_size')}</label>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="number" min={1} max={10000} placeholder="W" value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <span className="text-xs text-slate-400">×</span>
            <input type="number" min={1} max={10000} placeholder="H" value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <button type="button" onClick={() => {
              const w = parseInt(customWidth); const h = parseInt(customHeight)
              if (w > 0 && h > 0) handleSelectPreset({ id: 'custom', name: 'Custom', width: w, height: h, ratio: `${w}:${h}` })
            }}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              {t('preset_crops.apply_crop')}
            </button>
          </div>
        </div>
        {/* Preview */}
        {previewUrl && selectedPreset ? (
          <div className="mt-4 animate-fade-in-up rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {selectedPreset.name} · {selectedPreset.width}×{selectedPreset.height}
              </div>
              <button type="button" onClick={handleApplyCrop}
                className="rounded-xl bg-gradient-brand px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-glow hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                {t('preset_crops.apply_crop')}
              </button>
            </div>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img src={previewUrl} alt="Crop preview" className="mx-auto max-h-[40vh] object-contain" />
            </div>
          </div>
        ) : null}
        <canvas ref={previewCanvasRef} className="hidden" />
      </div>
    </div>
  )
}

/* ===== Main App ===== */

function App() {
  const { t, locale, setLocale, locales } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // Info pages reuse the shared nav/footer — only the main content changes.
  const info: 'about' | 'privacy' | 'terms' | 'blog' | null =
    pathname === '/about' ? 'about' : pathname === '/privacy' ? 'privacy' : pathname === '/terms' ? 'terms' : pathname === '/blog' ? 'blog' : null

  // Reset scroll position when switching routes (info pages live in the same shell).
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  const [langOpen, setLangOpen] = useState(false)
  const [mode, setMode] = useState<'cutout' | 'convert'>('cutout')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null)
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<RemoveBackgroundProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bgMode, setBgMode] = useState<BgMode>('transparent')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null)
  const [compareValue, setCompareValue] = useState(50)
  const [sourceNaturalSize, setSourceNaturalSize] = useState<{ w: number; h: number } | null>(null)
  
  // --- New: Magic Eraser State ---
  const [showMagicEraser, setShowMagicEraser] = useState(false)
  const [eraserResultBlob, setEraserResultBlob] = useState<Blob | null>(null)
  
  // --- New: Preset Crop State ---
  const [showCropPanel, setShowCropPanel] = useState(false)
  const [cropResultBlob, setCropResultBlob] = useState<Blob | null>(null)
  
  // --- Derived: Is Edited State (computed from actual edits) ---
  const isEdited = bgMode !== 'transparent' || eraserResultBlob !== null || cropResultBlob !== null
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png')
  const prevSourceUrlRef = useRef<string | null>(null)
  const prevCutoutUrlRef = useRef<string | null>(null)
  const prevBgImageUrlRef = useRef<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  /* ===== 主题切换状态 ===== */
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('smartcut-theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch { /* localStorage 不可用时静默降级 */ }
    return 'light'
  })

  /** 切换主题并持久化到 localStorage */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      try { localStorage.setItem('smartcut-theme', next) } catch { /* 静默降级 */ }
      return next
    })
  }, [])

  // 将 data-theme 属性同步到 <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    return () => {
      if (prevSourceUrlRef.current) URL.revokeObjectURL(prevSourceUrlRef.current)
      if (prevCutoutUrlRef.current) URL.revokeObjectURL(prevCutoutUrlRef.current)
      if (prevBgImageUrlRef.current) URL.revokeObjectURL(prevBgImageUrlRef.current)
    }
  }, [])

  const bgStyle = useMemo<CSSProperties>(() => {
    if (bgMode === 'transparent') return CHECKERBOARD_STYLE
    if (bgMode === 'color') return { backgroundColor: bgColor }
    if (bgMode === 'image' && bgImageUrl) {
      return {
        backgroundColor: '#fff',
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return { backgroundColor: '#fff' }
  }, [bgMode, bgColor, bgImageUrl])

  function showSuccessToast(msg: string) {
    setSuccessMsg(msg)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  function resetAll() {
    setError(null)
    setProgress(null)
    setIsProcessing(false)
    setFile(null)
    setSourceNaturalSize(null)
    if (prevSourceUrlRef.current) {
      URL.revokeObjectURL(prevSourceUrlRef.current)
      prevSourceUrlRef.current = null
    }
    if (prevCutoutUrlRef.current) {
      URL.revokeObjectURL(prevCutoutUrlRef.current)
      prevCutoutUrlRef.current = null
    }
    setSourceUrl(null)
    setCutoutUrl(null)
    setCutoutBlob(null)
    setBgMode('transparent')
    setBgColor('#ffffff')
    setBgImageUrl(null)
    setEraserResultBlob(null)
    setCropResultBlob(null)
  }

  const resetResult = useCallback(() => {
    setError(null)
    setProgress(null)
    setIsProcessing(false)
    if (prevCutoutUrlRef.current) {
      URL.revokeObjectURL(prevCutoutUrlRef.current)
      prevCutoutUrlRef.current = null
    }
    setCutoutUrl(null)
    setCutoutBlob(null)
  }, [])

  function pickFile() {
    inputRef.current?.click()
  }

  const validateAndSetFile = useCallback((next: File) => {
    if (!ACCEPTED_TYPES.has(next.type)) {
      setError(t('error.only_supported_formats'))
      return
    }
    if (next.size > MAX_FILE_BYTES) {
      setError(t('error.file_too_large', { 0: formatBytes(next.size) }))
      return
    }
    setError(null)
    resetResult()
    setFile(next)
    if (prevSourceUrlRef.current) URL.revokeObjectURL(prevSourceUrlRef.current)
    prevSourceUrlRef.current = URL.createObjectURL(next)
    setSourceUrl(prevSourceUrlRef.current)
  }, [resetResult, t])

  async function handleRemoveBg() {
    if (!file || isProcessing) return
    setError(null)
    setIsProcessing(true)
    setProgress({ percent: 0, message: '准备中…' })
    try {
      const bitmap = await createImageBitmap(file)
      const result = await removeBackgroundFromImageBitmap(
        bitmap,
        { inputSize: 320, blurPx: 1.25, maskGamma: 1.0, maskThreshold: 0.0 },
        setProgress,
      )
      bitmap.close()
      const blob = await new Promise<Blob>((resolve, reject) => {
        result.cutoutCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出 PNG 失败'))), 'image/png')
      })
      if (prevCutoutUrlRef.current) URL.revokeObjectURL(prevCutoutUrlRef.current)
      prevCutoutUrlRef.current = URL.createObjectURL(blob)
      setCutoutBlob(blob)
      setCutoutUrl(prevCutoutUrlRef.current)
      setCompareValue(55)
      showSuccessToast(t('toast.cutout_done'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error.cutout_failed'))
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  function handleBgImageChange(f: File | null) {
    if (prevBgImageUrlRef.current) URL.revokeObjectURL(prevBgImageUrlRef.current)
    if (!f) {
      prevBgImageUrlRef.current = null
      setBgImageUrl(null)
      return
    }
    prevBgImageUrlRef.current = URL.createObjectURL(f)
    setBgImageUrl(prevBgImageUrlRef.current)
  }

  async function renderEditedImage(): Promise<Blob | null> {
    if (!cutoutUrl || !sourceUrl) return null
    const cutoutImg = await loadImage(cutoutUrl)
    const srcImg = await loadImage(sourceUrl)
    const w = srcImg.naturalWidth
    const h = srcImg.naturalHeight
    const canvas = exportCanvasRef.current ?? document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    if (bgMode === 'color') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, w, h)
    } else if (bgMode === 'image' && bgImageUrl) {
      const bgImg = await loadImage(bgImageUrl)
      const bgAspect = bgImg.naturalWidth / bgImg.naturalHeight
      const targetAspect = w / h
      let sx = 0, sy = 0, sw = bgImg.naturalWidth, sh = bgImg.naturalHeight
      if (bgAspect > targetAspect) {
        sw = bgImg.naturalWidth * (targetAspect / bgAspect)
        sx = (bgImg.naturalWidth - sw) / 2
      } else {
        sh = bgImg.naturalHeight * (bgAspect / targetAspect)
        sy = (bgImg.naturalHeight - sh) / 2
      }
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, w, h)
    } else {
      // Transparent mode: keep alpha for PNG so the download has no background.
      // JPEG has no alpha channel, so fall back to a white background.
      if (exportFormat === 'jpg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
      }
    }
    ctx.drawImage(cutoutImg, 0, 0, w, h)
    return new Promise<Blob>((resolve, reject) => {
      const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png'
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob 返回 null'))),
        mimeType,
        exportFormat === 'jpg' ? 0.95 : undefined,
      )
    })
  }

  async function handleDownloadEdited() {
    if (!cutoutUrl) return
    try {
      const blob = await renderEditedImage()
      if (!blob) { setError(t('error.export_failed_retry')); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadEditedName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 3000)
      showSuccessToast(t('toast.download_success'))
    } catch (e) {
      setError(t('error.export_failed', { 0: e instanceof Error ? e.message : t('error.unknown_error') }))
    }
  }

  const downloadName = useMemo(() => {
    if (!file) return 'smartcut.png'
    return `${file.name.replace(/\.[^.]+$/, '')}_smartcut.png`
  }, [file])

  const downloadEditedName = useMemo(() => {
    if (!file) return 'smartcut_edited.png'
    const ext = exportFormat === 'jpg' ? '.jpg' : '.png'
    return `${file.name.replace(/\.[^.]+$/, '')}_edited${ext}`
  }, [file, exportFormat])

  /* Drag handlers */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) validateAndSetFile(f)
  }, [validateAndSetFile])

  return (
    <div className="min-h-full bg-root-enhanced font-body text-slate-900 transition-colors duration-300">
      {/* Particle Background — 轻量动态粒子特效 */}
      <ParticleBackground />

      {/* Skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-elevated focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        跳转到主要内容
      </a>

      {/* Aurora Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="aurora-orb h-[500px] w-[500px] bg-gradient-to-r from-violet-500/12 to-purple-600/6"
          style={{ top: '0%', left: '-10%', animation: 'aurora 14s linear infinite' }}
        />
        <div
          className="aurora-orb h-[400px] w-[400px] bg-gradient-to-r from-cyan-500/10 to-blue-500/5"
          style={{ bottom: '5%', right: '-8%', animation: 'aurora 18s linear infinite reverse' }}
        />
        <div
          className="aurora-orb h-[300px] w-[300px] bg-gradient-to-r from-amber-500/5 to-orange-500/3"
          style={{ top: '40%', left: '50%', animation: 'aurora 20s linear infinite' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-gradient-hero text-white backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-sm font-extrabold tracking-tight shadow-glow transition-transform duration-300 hover:scale-110" aria-hidden="true">SC</div>
            <div>
              <div className="text-sm font-bold font-display leading-5">SmartCut</div>
              <div className="text-[11px] font-medium text-white/60">{t('header.brand_subtitle')}</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 sm:gap-3" aria-label={t('skip.link')}>
            <button type="button" onClick={() => { setMode('cutout'); navigate('/') }}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                mode === 'cutout' ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}>{t('header.nav_cutout')}</button>
            <button type="button" onClick={() => { setMode('convert'); navigate('/') }}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                mode === 'convert' ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}>{t('header.nav_convert')}</button>
            <button type="button" onClick={() => navigate('/blog')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                pathname === '/blog' ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}>{t('header.nav_blog')}</button>
            <span className="text-xs text-white/20" aria-hidden="true">|</span>
            {/* 语言切换 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label={t('header.switch_language')}
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.78.147 2.653.255" />
                  </svg>
                  {locale.toUpperCase().replace('-', ' · ')}
                </span>
              </button>
              {langOpen && (
                <>
                  {/* 点击外部关闭 */}
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-2xl border border-slate-200/60 bg-white py-1 shadow-elevated backdrop-blur-sm animate-fade-in-up">
                    {locales.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => { setLocale(l.code); setLangOpen(false) }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold transition-all hover:bg-slate-50 focus-visible:outline-none ${
                          locale === l.code ? 'text-brand-600 bg-brand-50/60' : 'text-slate-700'
                        }`}
                      >
                        {locale === l.code && (
                          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                        <span className={locale === l.code ? '' : 'ml-5'}>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <a
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              href="https://github.com/105-Stars/smartcut" target="_blank" rel="noreferrer" aria-label={t('header.nav_github_label')}
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              {t('header.nav_github')}
            </a>
            {/* 主题切换 — 白天/黑夜 */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t(theme === 'light' ? 'header.theme_toggle_dark' : 'header.theme_toggle_light')}
              className="theme-toggle-btn grid h-8 w-8 place-items-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {theme === 'light' ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      {info ? (
        <Suspense
          fallback={
            <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-4 text-center text-sm text-slate-400 sm:pb-20">
              Loading…
            </main>
          }
        >
          <main id="main-content" className="relative mx-auto max-w-3xl px-4 pb-16 pt-4 sm:pb-20">
            <div className="space-y-6">
              {info === 'about' && <AboutPage />}
              {info === 'privacy' && <PrivacyPage />}
              {info === 'terms' && <TermsPage />}
              {info === 'blog' && <BlogPage />}
            </div>
          </main>
        </Suspense>
      ) : mode === 'cutout' ? (
        <>
      {/* Hero */}
      <section className="relative overflow-hidden py-10 sm:py-14">
        {/* Hero ambient glow */}
        <div className="pointer-events-none absolute -inset-x-20 -top-20 -z-10" aria-hidden="true">
          <div className="mx-auto h-[300px] w-[600px] rounded-full bg-gradient-to-b from-brand-500/8 via-accent-500/5 to-transparent blur-3xl sm:w-[800px]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-elevated">
            <IconSparkles />
            {t('hero.badge')}
          </div>
          <h1 className="mt-4 text-3xl font-extrabold font-display tracking-tight sm:text-4xl">
            <span className="text-gradient-brand">{t('hero.title')}</span>
            <span className="ml-2 text-slate-800">· {t('hero.subtitle')}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            {t('hero.description')}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="text-amber-400" aria-hidden="true">★★★★★</span>
              <span className="ml-0.5 text-slate-500">{t('hero.feature_free')}</span>
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              {t('feature.privacy')}
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              {t('feature.open_source')}
            </span>
          </div>
        </div>
      </section>

      {/* Example Showcase — 在步骤说明上方展示高质量示例效果 */}
      <section className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:pb-16 sm:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-lg font-extrabold font-display tracking-tight text-slate-900 sm:text-xl">{t('examples.heading')}</h2>
          <p className="mt-1.5 text-xs text-slate-500">{t('examples.subheading')}</p>
        </div>
        
        {/* 示例卡片网格 - 使用 Before/After 对比滑块展示抠图效果 */}
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {/* 示例 1 - 人物抠图 */}
          <ExampleCard 
            originalSrc="/samples/sample-1.png"
            processedSrc="/samples/sample-1-after.png"
            category="人像抠图"
            label="U2NetP"
            autoPlayDelay={0}
          />

          {/* 示例 2 - 商品抠图 */}
          <ExampleCard 
            originalSrc="/samples/sample-2.png"
            processedSrc="/samples/sample-2-after.png"
            category="电商产品"
            label="U2NetP"
            autoPlayDelay={500}
          />

          {/* 示例 3 - 动物/生活抠图 */}
          <ExampleCard 
            originalSrc="/samples/sample-3.png"
            processedSrc="/samples/sample-3-after.png"
            category="生活场景"
            label="U2NetP"
            autoPlayDelay={1000}
          />
        </div>

        {/* 模型说明 - 强调 U2NetP 技术 */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">浏览器本地处理</span>
          </div>
          <div className="hidden h-3 w-px bg-slate-300 sm:flex" aria-hidden="true"></div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-brand-700">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-medium">U2NetP AI 模型</span>
          </div>
          <div className="hidden h-3 w-px bg-slate-300 sm:flex" aria-hidden="true"></div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">隐私安全保障</span>
          </div>
        </div>
      </section>

      {/* How It Works — 标题下方操作区域上方 */}
      <section className="relative mx-auto max-w-6xl px-4 pb-2 pt-2 sm:pb-4 sm:pt-4" aria-label={t('steps.title')}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-lg font-extrabold font-display tracking-tight text-slate-900 sm:text-xl">{t('steps.heading')}</h2>
          <p className="mt-1.5 text-xs text-slate-500">{t('steps.subheading')}</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StepCard num={1} icon={<IconUpload />} title={t('step.upload.title')} desc={<>{t('step.upload.desc')}</>} />
          <StepCard num={2} icon={<IconSparkles />} title={t('step.process.title')} desc={<>{t('step.process.desc')}</>} />
          <StepCard num={3} icon={<IconCheck />} title={t('step.download.title')} desc={<>{t('step.download.desc')}</>} />
        </div>
      </section>

      {/* Main Tool */}
      <main id="main-content" className="relative mx-auto max-w-6xl px-4 pb-4 sm:pb-8">
        {/* Soft glow behind the tool panel */}
        <div className="pointer-events-none absolute -inset-20 -z-10" aria-hidden="true">
          <div className="h-full w-full rounded-[100px] bg-gradient-to-b from-violet-500/5 via-cyan-500/3 to-transparent blur-3xl" />
        </div>
        <div className="space-y-10 sm:space-y-14">
          <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Panel */}
          <section className="lg:col-span-2" aria-label="抠图工具面板">
            <div className="glass-card rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold font-display text-slate-900">{t('panel.upload.title')}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{t('panel.upload.sub')}</p>
                </div>
                <button type="button" onClick={resetAll} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">{t('panel.reset')}</button>
              </div>

              <div className="mt-4">
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={t('panel.file_input_label')} onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f); e.currentTarget.value = '' }} />
                <button
                  type="button" onClick={pickFile} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  aria-label={t('panel.dropzone_label')}
                  className={`upload-area group relative w-full rounded-2xl border-2 border-dashed px-4 py-8 text-left transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    isDragOver ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                  <div className="relative flex items-center gap-3">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg shadow-sm transition-all duration-300 ${isDragOver ? 'bg-gradient-brand text-white shadow-glow' : 'bg-white text-brand-600 group-hover:bg-slate-50'}`}>
                      {isDragOver ? <IconInbox /> : <IconUpload />}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-sm font-semibold text-slate-800">{isDragOver ? t('panel.dropzone_drag_over') : t('panel.dropzone_default')}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{t('panel.format_hint')}</div>
                    </div>
                  </div>
                  {file ? (
                    <div className="relative mt-4 animate-slide-in rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate font-medium">{file.name}</div>
                        <div className="shrink-0 text-slate-400">{formatBytes(file.size)}</div>
                      </div>
                    </div>
                  ) : null}
                </button>
                {error ? (
                  <div className="mt-3 animate-fade-in-up rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">
                    <div className="flex items-start gap-2">
                      <IconAlert />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button" onClick={handleRemoveBg} disabled={!file || isProcessing}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:shadow-glow hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:brightness-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {t('panel.processing')}
                    </span>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      {t('panel.process_btn')}
                    </>
                  )}
                </button>
                <a
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-sm transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    cutoutBlob ? 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300' : 'pointer-events-none border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                  href={cutoutUrl ?? undefined} download={downloadName} aria-disabled={!cutoutBlob}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {t('panel.download_png')}
                </a>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-slate-200" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  {t('panel.edit.title')}
                </div>
                <div className="mt-3 grid gap-3">
                  <div className="inline-flex rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
                    {(['transparent', 'color', 'image'] as BgMode[]).map((mode) => (
                      <button key={mode} type="button" onClick={() => setBgMode(mode)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          bgMode === mode ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}>
                        {mode === 'transparent' && t('panel.edit.bg_transparent')}{mode === 'color' && t('panel.edit.bg_color')}{mode === 'image' && t('panel.edit.bg_image')}
                      </button>
                    ))}
                  </div>

                  {bgMode === 'color' ? (
                    <div className="flex animate-fade-in-up items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-3 py-2.5">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} aria-label={t('panel.edit.color_label')} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent" />
                      <div className="text-xs font-mono font-medium text-slate-500">{bgColor.toUpperCase()}</div>
                      <div className="ml-auto h-6 w-6 rounded-full border border-slate-200" style={{ backgroundColor: bgColor }} />
                    </div>
                  ) : null}

                  {bgMode === 'image' ? (
                    <div className="animate-fade-in-up space-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {t('panel.edit.bg_image_label')}
                        <input type="file" accept="image/*" className="hidden" aria-label={t('panel.edit.bg_image_file')} onChange={(e) => { const f = e.target.files?.[0] ?? null; handleBgImageChange(f); e.currentTarget.value = '' }} />
                      </label>
                      {bgImageUrl ? (
                        <button type="button" onClick={() => handleBgImageChange(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">{t('panel.edit.remove_bg_image')}</button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* 高级编辑工具：魔法擦除 + 预设裁剪 */}
              {cutoutBlob ? (
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" onClick={() => setShowMagicEraser(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    {t('magic_eraser.button')}
                  </button>
                  <button type="button" onClick={() => setShowCropPanel(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9l-4.5 4.5M15 9h4.5M15 9V4.5M15 9l4.5 4.5M9 15v4.5M9 15H4.5M9 15l-4.5-4.5M15 15h4.5M15 15v4.5M15 15l4.5-4.5" />
                    </svg>
                    {t('preset_crops.title')}
                  </button>
                </div>
              ) : null}

              {cutoutBlob && isEdited ? (
                <div className="mt-4 animate-fade-in-up rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-50/60 to-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      {t('panel.edited_download')}
                    </div>
                    <div className="inline-flex rounded-lg border border-brand-200/60 bg-white p-0.5 shadow-sm">
                      <button type="button" onClick={() => setExportFormat('png')}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${exportFormat === 'png' ? 'bg-brand-900 text-white shadow-sm' : 'text-brand-700 hover:text-brand-900'}`}>PNG</button>
                      <button type="button" onClick={() => setExportFormat('jpg')}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${exportFormat === 'jpg' ? 'bg-brand-900 text-white shadow-sm' : 'text-brand-700 hover:text-brand-900'}`}>JPG</button>
                    </div>
                  </div>
                  <button type="button" onClick={handleDownloadEdited} disabled={!cutoutUrl}
                    className="mt-3 w-full rounded-xl bg-brand-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-brand-800 hover:shadow-glow disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      {t('panel.edited_btn', { 0: exportFormat.toUpperCase() })}
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          {/* Right Panel */}
          <section className="lg:col-span-3" aria-label="图片预览对比面板">
            <div className="grid gap-6">
              <div className="glass-card rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold font-display text-slate-900">预览</h2>
                    <p className="mt-0.5 text-xs text-slate-500">原图与抠图结果对比</p>
                  </div>
                  {cutoutUrl ? (
                    <button type="button" onClick={resetResult} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">清除结果</button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="group rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3 transition-all duration-300 hover:border-slate-200 hover:bg-slate-50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {t('panel.original_label')}
                    </div>
                    <div className="mt-2 overflow-hidden rounded-xl bg-white shadow-sm">
                      {sourceUrl ? (
                        <img src={sourceUrl} alt={t('panel.original_alt')} className="max-h-[46vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                          onLoad={(e) => { const img = e.currentTarget; setSourceNaturalSize({ w: img.naturalWidth, h: img.naturalHeight }) }} />
                      ) : (<div className="grid h-[220px] place-items-center text-xs text-slate-400">{t('panel.placeholder_upload_first')}</div>)}
                    </div>
                  </div>
                  <div className="group rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3 transition-all duration-300 hover:border-slate-200 hover:bg-slate-50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      {t('panel.result_label')}
                    </div>
                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 shadow-sm" style={bgStyle}>
                      {cutoutUrl ? (
                        <img src={cutoutUrl} alt={t('panel.result_alt')} className="max-h-[46vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
                      ) : (<div className="grid h-[220px] place-items-center text-xs text-slate-400">{t('panel.placeholder_result')}</div>)}
                    </div>
                  </div>
                </div>
              </div>

              {sourceUrl && cutoutUrl ? (
                <div className="glass-card animate-fade-in-up rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold font-display text-slate-900">{t('panel.compare.title')}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{t('panel.compare.sub')}</p>
                    </div>
                    <div className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{compareValue}%</div>
                  </div>
                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    style={sourceNaturalSize ? { aspectRatio: `${sourceNaturalSize.w} / ${sourceNaturalSize.h}` } : undefined}>
                    {/* Base layer: cutout on a white background (right side / full when slider is at 0) */}
                    <div className="absolute inset-0" style={{ backgroundColor: '#fff' }}>
                      <img src={cutoutUrl} alt={t('panel.compare_result_alt')} className="absolute inset-0 h-full w-full object-contain" />
                    </div>
                    {/* Overlay: original image, clipped to the left portion (full when slider is at 100) */}
                    <img src={sourceUrl} alt={t('panel.compare_original_alt')} className="absolute inset-0 h-full w-full object-contain" style={{ clipPath: `inset(0 ${100 - compareValue}% 0 0)` }} />
                    <div className="pointer-events-none absolute bottom-0 top-0 w-[3px] bg-white shadow-[0_0_0_1px_rgba(15,23,42,.18)]" style={{ left: `${compareValue}%` }} />
                  </div>
                  <input type="range" min={0} max={100} value={compareValue} onChange={(e) => setCompareValue(Number(e.target.value))} aria-label={t('panel.compare_slider_label')} className="mt-4 w-full accent-slate-900" />
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {/* Features */}
        <section className="rounded-3xl bg-section-features px-4 py-10 sm:px-8 sm:py-12" aria-label={t('features.title')}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold font-display tracking-tight text-slate-900">
              {t('features.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{t('features.sub')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<IconShield />} title={t('feature.security.title')} desc={t('feature.security.desc')} />
            <FeatureCard icon={<IconLightning />} title={t('feature.speed.title')} desc={t('feature.speed.desc')} />
            <FeatureCard icon={<IconPaint />} title={t('feature.edit.title')} desc={t('feature.edit.desc')} />
            <FeatureCard icon={<IconGift />} title={t('feature.free.title')} desc={t('feature.free.desc')} />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq-section" className="rounded-3xl bg-section-alt px-4 py-10 sm:px-8 sm:py-12" aria-label={t('faq.title')}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold font-display tracking-tight text-slate-900">{t('faq.title')}</h2>
            <p className="mt-2 text-sm text-slate-500">{t('faq.sub')}</p>
          </div>
          <div className="mx-auto max-w-2xl space-y-3">
            <FaqItem q={t('faq.q1')} a={t('faq.a1')} open />
            <FaqItem q={t('faq.q2')} a={t('faq.a2')} />
            <FaqItem q={t('faq.q3')} a={t('faq.a3')} />
            <FaqItem q={t('faq.q4')} a={t('faq.a4')} />
            <FaqItem q={t('faq.q5')} a={t('faq.a5')} />
          </div>
        </section>
      </div>
      </main>

      </>
      ) : (
        <FormatConverter showSuccessToast={showSuccessToast} />
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-footer-gradient text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand + contact */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="footer-brand font-display text-lg font-extrabold text-white">SmartCut</span>
                <span className="rounded-full bg-gradient-to-r from-violet-500/25 to-cyan-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-violet-200 ring-1 ring-white/15">{t('footer.tagline')}</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-300">{t('footer.brand_desc')}</p>
              <div className="mt-5 space-y-2.5 text-sm">
                <a href="mailto:S1052366296@gmail.com" className="footer-link flex w-fit items-center gap-2 text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  <span>{t('footer.email_label')}: S1052366296@gmail.com</span>
                </a>
                <a href="https://github.com/105-Stars/smartcut" target="_blank" rel="noreferrer" className="footer-link flex w-fit items-center gap-2 text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={t('footer.github_label')}>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                  <span>{t('footer.github')}</span>
                </a>
              </div>
            </div>

            {/* All Tools */}
            <div>
              <h4 className="footer-col-title text-sm font-bold">{t('footer.col_tools')}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><button type="button" onClick={() => { setMode('cutout'); navigate('/') }} className={FOOTER_LINK_CLS}>{t('footer.tool_cutout')}</button></li>
                <li><button type="button" onClick={() => { setMode('convert'); navigate('/') }} className={FOOTER_LINK_CLS}>{t('footer.tool_convert')}</button></li>
              </ul>
            </div>

            {/* Support & Help */}
            <div>
              <h4 className="footer-col-title text-sm font-bold">{t('footer.col_support')}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><button type="button" onClick={() => { if (mode !== 'cutout') setMode('cutout'); window.setTimeout(() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' }), 120) }} className={FOOTER_LINK_CLS}>{t('footer.faq')}</button></li>
                <li><a href="mailto:S1052366296@gmail.com" className={FOOTER_LINK_CLS}>{t('footer.contact')}</a></li>
              </ul>
            </div>

            {/* Personal */}
            <div>
              <h4 className="footer-col-title text-sm font-bold">{t('footer.col_personal')}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link to="/blog" className={FOOTER_LINK_CLS}>{t('footer.blog')}</Link></li>
                <li><Link to="/about" className={FOOTER_LINK_CLS}>{t('footer.about_me')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            <div className="flex items-center justify-center gap-5">
              <Link to="/privacy" className="footer-link text-slate-400 transition-all duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{t('page.privacy.title')}</Link>
              <span className="text-slate-700">·</span>
              <Link to="/terms" className="footer-link text-slate-400 transition-all duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{t('page.terms.title')}</Link>
            </div>
            <p className="mt-4">&copy; {new Date().getFullYear()} SmartCut. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Processing Modal */}
      {isProcessing && progress ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="图片处理中">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-up text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-brand shadow-glow">
              <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
            <h3 className="mt-4 text-base font-bold font-display text-slate-900">{t('processing.heading')}</h3>
            <p className="mt-1 text-sm text-slate-500">{progress.message || t('processing.preparing')}</p>
            
            {/* Performance visualization */}
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
              <span className="text-[11px] sm:text-xs">{t('progress.webgl_accel')}</span>
            </div>
            
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500 ease-out" style={{ width: `${Math.max(5, progress.percent)}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">{progress.percent}%</p>
          </div>
        </div>
      ) : null}

      {/* Hidden canvas for export */}
      <canvas ref={exportCanvasRef} className="hidden" />

      {/* Modals */}

      {/* Magic Eraser Modal */}
      {showMagicEraser && cutoutUrl ? (
        <MagicEraser
          cutoutUrl={cutoutUrl}
          onResult={(blob) => {
            setEraserResultBlob(blob)
            const newUrl = URL.createObjectURL(blob)
            if (prevCutoutUrlRef.current) URL.revokeObjectURL(prevCutoutUrlRef.current)
            prevCutoutUrlRef.current = newUrl
            setCutoutUrl(newUrl)
            setCutoutBlob(blob)
            setShowMagicEraser(false)
            showSuccessToast('Eraser applied!')
          }}
          onClose={() => setShowMagicEraser(false)}
          t={t}
        />
      ) : null}

      {/* Crop Preset Panel */}
      {showCropPanel && cutoutUrl ? (
        <CropPresetPanel
          cutoutUrl={cutoutUrl}
          onResult={(blob) => {
            setCropResultBlob(blob)
            const newUrl = URL.createObjectURL(blob)
            if (prevCutoutUrlRef.current) URL.revokeObjectURL(prevCutoutUrlRef.current)
            prevCutoutUrlRef.current = newUrl
            setCutoutUrl(newUrl)
            setCutoutBlob(blob)
            setShowCropPanel(false)
            showSuccessToast('Crop applied!')
          }}
          onClose={() => setShowCropPanel(false)}
          t={t}
        />
      ) : null}

      {/* BackToTop 回到顶部 */}
      <BackToTop t={t} />

      {/* Success Toast */}
      <SuccessToast message={successMsg} visible={showSuccess} />
    </div>
  )
}

export default App