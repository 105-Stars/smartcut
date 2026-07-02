import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import {
  removeBackgroundFromImageBitmap,
  type RemoveBackgroundProgress,
} from './lib/removeBackground'


const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)}KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)}MB`
}

type BgMode = 'transparent' | 'color' | 'image'

function getCheckerboardStyle(): CSSProperties {
  return {
    backgroundColor: '#fff',
    backgroundImage:
      'linear-gradient(45deg, rgba(15,23,42,.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(15,23,42,.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(15,23,42,.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(15,23,42,.08) 75%)',
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
  }
}

function App() {
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
  const [compareValue, setCompareValue] = useState(55)
  const [sourceNaturalSize, setSourceNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png')
  const prevSourceUrlRef = useRef<string | null>(null)
  const prevCutoutUrlRef = useRef<string | null>(null)
  const prevBgImageUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (prevSourceUrlRef.current) URL.revokeObjectURL(prevSourceUrlRef.current)
      if (prevCutoutUrlRef.current) URL.revokeObjectURL(prevCutoutUrlRef.current)
      if (prevBgImageUrlRef.current) URL.revokeObjectURL(prevBgImageUrlRef.current)
    }
  }, [])

  useEffect(() => {
    import('./lib/removeBackground')
      .then((m) => {
        m.getSession?.().catch(() => {})
      })
      .catch(() => {})
  }, [])

  const bgStyle = useMemo<CSSProperties>(() => {
    if (bgMode === 'transparent') return getCheckerboardStyle()
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
  }

  function resetResult() {
    setError(null)
    setProgress(null)
    setIsProcessing(false)
    if (prevCutoutUrlRef.current) {
      URL.revokeObjectURL(prevCutoutUrlRef.current)
      prevCutoutUrlRef.current = null
    }
    setCutoutUrl(null)
    setCutoutBlob(null)
  }

  function pickFile() {
    inputRef.current?.click()
  }

  function validateAndSetFile(next: File) {
    if (!ACCEPTED_TYPES.has(next.type)) {
      setError('仅支持 JPG / PNG / WebP 格式图片')
      return
    }
    if (next.size > MAX_FILE_BYTES) {
      setError(`单张图片大小需 ≤ 10MB（当前：${formatBytes(next.size)}）`)
      return
    }
    setError(null)
    resetResult()
    setFile(next)
    if (prevSourceUrlRef.current) URL.revokeObjectURL(prevSourceUrlRef.current)
    prevSourceUrlRef.current = URL.createObjectURL(next)
    setSourceUrl(prevSourceUrlRef.current)
  }

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
    } catch (e) {
      setError(e instanceof Error ? e.message : '抠图失败')
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

  /** 将抠图结果合成到当前背景上，返回合成后的 Blob */
  async function renderEditedImage(): Promise<Blob | null> {
    if (!cutoutUrl || !sourceUrl) {
      console.warn('[renderEditedImage] missing urls:', { cutoutUrl, sourceUrl })
      return null
    }

    const cutoutImg = await loadImage(cutoutUrl)
    const srcImg = await loadImage(sourceUrl)
    const w = srcImg.naturalWidth
    const h = srcImg.naturalHeight

    const canvas = exportCanvasRef.current ?? document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // 绘制背景
    if (bgMode === 'color') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, w, h)
    } else if (bgMode === 'image' && bgImageUrl) {
      const bgImg = await loadImage(bgImageUrl)
      // cover 效果
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
      // transparent: fill white so JPG export works
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
    }

    // 绘制抠图结果
    ctx.drawImage(cutoutImg, 0, 0, w, h)
    
    return new Promise<Blob>((resolve, reject) => {
      const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png'
      const quality = exportFormat === 'jpg' ? 0.95 : undefined
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('[renderEditedImage] exported blob:', blob.size, 'bytes')
            resolve(blob)
          } else {
            reject(new Error('toBlob 返回 null'))
          }
        },
        mimeType,
        quality,
      )
    })
  }

  /** 加载图片为 Image 元素（blob URL 不加 crossOrigin 避免 canvas 污染） */
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      // blob: URL 是同源安全资源，不需要 crossOrigin；加了反而会污染 canvas
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`加载图片失败: ${src}`))
      img.src = src
    })
  }

  async function handleDownloadEdited() {
    if (!cutoutUrl) return
    try {
      const blob = await renderEditedImage()
      if (!blob) {
        setError('导出失败，请重试')
        return
      }
      // 创建 blob URL 并立即触发下载，延迟释放以确保浏览器完成下载
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadEditedName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // 延迟释放 blob URL，确保浏览器异步下载完成
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    } catch (e) {
      setError(`编辑后图片导出失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  const downloadName = useMemo(() => {
    if (!file) return 'smartcut.png'
    const base = file.name.replace(/\.[^.]+$/, '')
    return `${base}_smartcut.png`
  }, [file])

  const downloadEditedName = useMemo(() => {
    if (!file) return 'smartcut_edited.png'
    const base = file.name.replace(/\.[^.]+$/, '')
    const ext = exportFormat === 'jpg' ? '.jpg' : '.png'
    return `${base}_edited${ext}`
  }, [file, exportFormat])

  /** 判断是否进行了编辑操作（非透明背景即为编辑） */
  const isEdited = bgMode === 'color' || (bgMode === 'image' && !!bgImageUrl)

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
              SC
            </div>
            <div>
              <div className="text-sm font-semibold leading-5">SmartCut</div>
              <div className="text-xs text-slate-500">免费开源 · 本地推理 · 一键抠图</div>
            </div>
          </div>
          <a
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold">智能抠图</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    上传图片后点击“一键抠图”，生成透明背景 PNG，并可更换背景色/背景图预览。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
                >
                  重置
                </button>
              </div>

              <div className="mt-5">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) validateAndSetFile(f)
                    e.currentTarget.value = ''
                  }}
                />

                <button
                  type="button"
                  onClick={pickFile}
                  className="group relative w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-left hover:border-slate-400 hover:bg-slate-100 active:scale-[0.99]"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const f = e.dataTransfer.files?.[0]
                    if (f) validateAndSetFile(f)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm">
                      ⬆
                    </div>
                    <div>
                      <div className="text-sm font-semibold">点击选择或拖拽上传</div>
                      <div className="mt-1 text-xs text-slate-500">
                        支持 JPG / PNG / WebP · ≤ 10MB
                      </div>
                    </div>
                  </div>
                  {file ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">{file.name}</div>
                        <div className="shrink-0">{formatBytes(file.size)}</div>
                      </div>
                    </div>
                  ) : null}
                </button>

                {error ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRemoveBg}
                  disabled={!file || isProcessing}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      处理中…
                    </span>
                  ) : (
                    '一键抠图'
                  )}
                </button>

                <a
                  className={`inline-flex flex-1 items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    cutoutBlob
                      ? 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                      : 'pointer-events-none border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                  href={cutoutUrl ?? undefined}
                  download={downloadName}
                >
                  下载透明 PNG
                </a>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold">基础编辑</div>
                <div className="mt-3 grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBgMode('transparent')}
                      className={`rounded-xl px-3 py-2 text-sm font-medium ${
                        bgMode === 'transparent' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      透明背景
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgMode('color')}
                      className={`rounded-xl px-3 py-2 text-sm font-medium ${
                        bgMode === 'color' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      背景色
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgMode('image')}
                      className={`rounded-xl px-3 py-2 text-sm font-medium ${
                        bgMode === 'image' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      背景图
                    </button>
                  </div>

                  {bgMode === 'color' ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white"
                      />
                      <div className="text-sm text-slate-600">{bgColor.toUpperCase()}</div>
                    </div>
                  ) : null}

                  {bgMode === 'image' ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null
                          handleBgImageChange(f)
                          e.currentTarget.value = ''
                        }}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800 file:shadow-sm"
                      />
                      {bgImageUrl ? (
                        <button
                          type="button"
                          onClick={() => handleBgImageChange(null)}
                          className="self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          清除背景图
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* 编辑后下载区域 */}
              {cutoutBlob && isEdited ? (
                <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-indigo-900">编辑后下载</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExportFormat('png')}
                        className={`rounded-lg px-2 py-1 text-xs font-medium ${
                          exportFormat === 'png'
                            ? 'bg-indigo-900 text-white'
                            : 'bg-white text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportFormat('jpg')}
                        className={`rounded-lg px-2 py-1 text-xs font-medium ${
                          exportFormat === 'jpg'
                            ? 'bg-indigo-900 text-white'
                            : 'bg-white text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        JPG
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadEdited}
                    disabled={!cutoutUrl}
                    className="mt-3 w-full rounded-xl bg-indigo-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    下载编辑后图片 ({exportFormat.toUpperCase()})
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <section className="lg:col-span-3">
            <div className="grid gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">预览</div>
                    <div className="mt-1 text-xs text-slate-500">支持原图/结果对比与背景替换预览</div>
                  </div>
                  {cutoutUrl ? (
                    <button
                      type="button"
                      onClick={resetResult}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      清除结果
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-600">原图</div>
                    <div className="mt-3 overflow-hidden rounded-xl bg-white">
                      {sourceUrl ? (
                        <img
                          src={sourceUrl}
                          alt="原图"
                          className="max-h-[46vh] w-full object-contain"
                          onLoad={(e) => {
                            const img = e.currentTarget
                            setSourceNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
                          }}
                        />
                      ) : (
                        <div className="grid h-[240px] place-items-center text-sm text-slate-400">
                          请先上传图片
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-600">抠图结果</div>
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200" style={bgStyle}>
                      {cutoutUrl ? (
                        <img src={cutoutUrl} alt="抠图结果" className="max-h-[46vh] w-full object-contain" />
                      ) : (
                        <div className="grid h-[240px] place-items-center text-sm text-slate-400">
                          抠图后将显示在这里
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {sourceUrl && cutoutUrl ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">对比</div>
                      <div className="mt-1 text-xs text-slate-500">拖动滑块查看抠图前后差异</div>
                    </div>
                    <div className="shrink-0 text-xs font-semibold text-slate-600">{compareValue}%</div>
                  </div>

                  <div
                    className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    style={sourceNaturalSize ? { aspectRatio: `${sourceNaturalSize.w} / ${sourceNaturalSize.h}` } : undefined}
                  >
                    <img src={sourceUrl} alt="原图对比" className="absolute inset-0 h-full w-full object-contain" />
                    <div className="absolute inset-0" style={bgStyle}>
                      <img
                        src={cutoutUrl}
                        alt="抠图对比"
                        className="absolute inset-0 h-full w-full object-contain"
                        style={{ clipPath: `inset(0 ${100 - compareValue}% 0 0)` }}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 w-[2px] bg-white shadow-[0_0_0_1px_rgba(15,23,42,.18)]"
                      style={{ left: `${compareValue}%` }}
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={compareValue}
                    onChange={(e) => setCompareValue(Number(e.target.value))}
                    className="mt-4 w-full accent-slate-900"
                  />
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          本项目使用浏览器端本地推理（ONNX Runtime Web + U2NetP）完成抠图，不依赖任何付费 API。
        </div>
      </footer>

      {isProcessing && progress ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">正在处理</div>
              <div className="text-xs font-semibold text-slate-600">{Math.round(progress.percent)}%</div>
            </div>
            <div className="mt-2 text-xs text-slate-600">{progress.message}</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-[width]"
                style={{ width: `${Math.max(0, Math.min(100, progress.percent))}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* 隐藏的导出 Canvas */}
      <canvas ref={exportCanvasRef} className="hidden" />
    </div>
  )
}

export default App
