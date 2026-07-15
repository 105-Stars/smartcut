export type RemoveBackgroundProgress = {
  percent: number
  message: string
}

export type RemoveBackgroundOptions = {
  inputSize?: number
  blurPx?: number
  maskGamma?: number
  maskThreshold?: number
}

export type RemoveBackgroundResult = {
  cutoutCanvas: HTMLCanvasElement
}

declare global {
  interface Window {
    ort?: typeof import('onnxruntime-web')
  }
}

// 检测当前页面是否处于跨域隔离状态（即 COOP/COEP 头已设置）
// SharedArrayBuffer 需要 crossOriginIsolated = true 才能使用
function isCrossOriginIsolated(): boolean {
  return typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated === true
}

let ortPromise: Promise<typeof import('onnxruntime-web')> | null = null
let sessionPromise: Promise<import('onnxruntime-web').InferenceSession> | null = null

// 模型缓存（IndexedDB），避免重复下载大模型文件
const MODEL_CACHE_KEY = 'smartcut-u2netp-model-v1'

async function getCachedModel(): Promise<ArrayBuffer | null> {
  try {
    const cache = await caches.open('smartcut-model-cache-v1')
    const cached = await cache.match(MODEL_CACHE_KEY)
    if (cached) {
      return await cached.arrayBuffer()
    }
  } catch {
    // Cache API 不可用时静默降级
  }
  return null
}

async function cacheModel(data: ArrayBuffer): Promise<void> {
  try {
    const cache = await caches.open('smartcut-model-cache-v1')
    const blob = new Blob([data], { type: 'application/octet-stream' })
    const response = new Response(blob)
    await cache.put(MODEL_CACHE_KEY, response)
  } catch {
    // 缓存失败不影响功能
  }
}

async function getOrt() {
  if (!ortPromise) {
    ortPromise = (async () => {
      const isolated = isCrossOriginIsolated()

      await new Promise<void>((resolve, reject) => {
        if (typeof window !== 'undefined' && window.ort) {
          resolve()
          return
        }
        const script = document.createElement('script')
        // 根据跨域隔离状态选择正确的 ORT 构建：
        // - 有 COOP/COEP（crossOriginIsolated）：加载 ort.webgpu.min.js
        //   - 优先 WebGPU（GPU）加速，可回退到多线程 WASM
        // - 无 COOP/COEP（如 GitHub Pages）：加载 ort.wasm.min.js
        //   - 使用单线程 WASM（CPU），不使用 SharedArrayBuffer
        if (isolated) {
          script.src = `${import.meta.env.BASE_URL}ort/ort.webgpu.min.js`
        } else {
          script.src = `${import.meta.env.BASE_URL}ort/ort.wasm.min.js`
        }
        script.onload = () => {
          document.body.removeChild(script)
          resolve()
        }
        script.onerror = () => {
          document.body.removeChild(script)
          reject(new Error('加载 ORT 失败'))
        }
        document.body.appendChild(script)
      })

      const ort = window.ort!
      ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`
      ort.env.wasm.simd = true

      if (isolated) {
        // 跨域隔离环境：可使用多线程
        ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency || 4, 4)
      } else {
        // 非跨域隔离环境（如 GitHub Pages）：禁用多线程
        ort.env.wasm.numThreads = 1
      }
      return ort
    })()
  }
  return ortPromise
}

export async function getSession(onProgress?: (p: RemoveBackgroundProgress) => void) {
  if (sessionPromise) return sessionPromise

  sessionPromise = (async () => {
    const ort = await getOrt()

    onProgress?.({ percent: 10, message: '正在加载模型…' })

    // 尝试从缓存加载模型
    let modelArrayBuffer: ArrayBuffer | null = await getCachedModel()

    if (!modelArrayBuffer) {
      const modelRes = await fetch(`${import.meta.env.BASE_URL}models/u2netp.onnx`)
      if (!modelRes.ok) throw new Error(`模型加载失败：${modelRes.status}`)
      modelArrayBuffer = await modelRes.arrayBuffer()
      // 异步缓存，不阻塞推理
      cacheModel(modelArrayBuffer)
    } else {
      onProgress?.({ percent: 15, message: '从缓存加载模型…' })
    }

    onProgress?.({ percent: 25, message: '正在初始化推理引擎…' })
    const isolated = isCrossOriginIsolated()

    try {
      // 只在跨域隔离环境下尝试 WebGPU
      if (isolated) {
        return await ort.InferenceSession.create(modelArrayBuffer, {
          executionProviders: ['webgpu', 'wasm'],
          graphOptimizationLevel: 'all',
        })
      }
      // 非隔离环境直接使用 WASM
      return await ort.InferenceSession.create(modelArrayBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
    } catch (err) {
      // WebGPU 失败，回退 WASM
      if (isolated) {
        console.warn('[SmartCut] WebGPU 后端初始化失败，回退本地 WASM：', err)
      }
      return await ort.InferenceSession.create(modelArrayBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
    }
  })()

  return sessionPromise
}


function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function clamp01(x: number) {
  if (x < 0) return 0
  if (x > 1) return 1
  return x
}

export async function removeBackgroundFromImageBitmap(
  bitmap: ImageBitmap,
  options: RemoveBackgroundOptions = {},
  onProgress?: (p: RemoveBackgroundProgress) => void,
): Promise<RemoveBackgroundResult> {
  const inputSize = options.inputSize ?? 320
  const blurPx = options.blurPx ?? 1.25
  const maskGamma = options.maskGamma ?? 1.0
  const maskThreshold = options.maskThreshold ?? 0.0

  const ort = await getOrt()
  const session = await getSession(onProgress)

  onProgress?.({ percent: 35, message: '正在预处理图片…' })
  const inputCanvas = createCanvas(inputSize, inputSize)
  const inputCtx = inputCanvas.getContext('2d', { willReadFrequently: true })
  if (!inputCtx) throw new Error('Canvas 初始化失败')
  inputCtx.clearRect(0, 0, inputSize, inputSize)
  inputCtx.drawImage(bitmap, 0, 0, inputSize, inputSize)
  const inputImageData = inputCtx.getImageData(0, 0, inputSize, inputSize)
  const inputData = inputImageData.data

  const mean = [0.485, 0.456, 0.406]
  const std = [0.229, 0.224, 0.225]
  const chw = new Float32Array(1 * 3 * inputSize * inputSize)
  const hw = inputSize * inputSize

  for (let y = 0; y < inputSize; y++) {
    for (let x = 0; x < inputSize; x++) {
      const i = (y * inputSize + x) * 4
      const r = inputData[i] / 255
      const g = inputData[i + 1] / 255
      const b = inputData[i + 2] / 255
      const p = y * inputSize + x
      chw[p] = (r - mean[0]) / std[0]
      chw[hw + p] = (g - mean[1]) / std[1]
      chw[2 * hw + p] = (b - mean[2]) / std[2]
    }
  }

  const inputName = session.inputNames[0]
  const feeds: Record<string, import('onnxruntime-web').Tensor> = {
    [inputName]: new ort.Tensor('float32', chw, [1, 3, inputSize, inputSize]),
  }

  onProgress?.({ percent: 55, message: '正在抠图推理…' })
  const results = await session.run(feeds)
  const firstOutputName = session.outputNames[0]
  const out = results[firstOutputName]
  const outData = out.data as Float32Array

  // 单次遍历：同时计算 min/max 和归一化后的 mask 数据
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let i = 0; i < outData.length; i++) {
    const v = outData[i]
    if (v < min) min = v
    if (v > max) max = v
  }
  const range = max - min + 1e-6
  const scale = 1 / range

  onProgress?.({ percent: 75, message: '正在生成透明背景…' })
  const maskCanvas = createCanvas(inputSize, inputSize)
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!maskCtx) throw new Error('Canvas 初始化失败')
  const maskImageData = maskCtx.createImageData(inputSize, inputSize)
  const maskData = maskImageData.data
  for (let i = 0; i < outData.length; i++) {
    const a = clamp01((outData[i] - min) * scale)
    const v = Math.round(a * 255)
    const j = i << 2
    maskData[j] = v
    maskData[j + 1] = v
    maskData[j + 2] = v
    maskData[j + 3] = 255
  }
  maskCtx.putImageData(maskImageData, 0, 0)

  const w = bitmap.width
  const h = bitmap.height

  const scaledMask = createCanvas(w, h)
  const scaledMaskCtx = scaledMask.getContext('2d', { willReadFrequently: true })
  if (!scaledMaskCtx) throw new Error('Canvas 初始化失败')
  scaledMaskCtx.imageSmoothingEnabled = true
  scaledMaskCtx.drawImage(maskCanvas, 0, 0, w, h)

  const refinedMask = createCanvas(w, h)
  const refinedMaskCtx = refinedMask.getContext('2d', { willReadFrequently: true })
  if (!refinedMaskCtx) throw new Error('Canvas 初始化失败')
  refinedMaskCtx.imageSmoothingEnabled = true
  refinedMaskCtx.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none'
  refinedMaskCtx.drawImage(scaledMask, 0, 0)
  refinedMaskCtx.filter = 'none'

  const maskPixels = refinedMaskCtx.getImageData(0, 0, w, h).data
  const cutoutCanvas = createCanvas(w, h)
  const cutoutCtx = cutoutCanvas.getContext('2d', { willReadFrequently: true })
  if (!cutoutCtx) throw new Error('Canvas 初始化失败')
  cutoutCtx.drawImage(bitmap, 0, 0)
  const cutoutImageData = cutoutCtx.getImageData(0, 0, w, h)
  const rgba = cutoutImageData.data
  const useGamma = maskGamma !== 1
  const useThreshold = maskThreshold > 0

  for (let i = 0; i < w * h; i++) {
    const m = maskPixels[i << 2] / 255
    let a = useGamma ? Math.pow(m, maskGamma) : m
    if (useThreshold && a < maskThreshold) a = 0
    rgba[(i << 2) + 3] = Math.round(clamp01(a) * 255)
  }

  cutoutCtx.putImageData(cutoutImageData, 0, 0)
  onProgress?.({ percent: 100, message: '完成' })

  return { cutoutCanvas }
}

