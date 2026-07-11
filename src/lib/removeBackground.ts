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

let ortPromise: Promise<typeof import('onnxruntime-web')> | null = null
let sessionPromise: Promise<import('onnxruntime-web').InferenceSession> | null = null

async function getOrt() {
  if (!ortPromise) {
    ortPromise = (async () => {
      // 动态加载 ONNX Runtime Web 引擎
      await new Promise<void>((resolve, reject) => {
        if (typeof window !== 'undefined' && window.ort) {
          resolve()
          return
        }
        const script = document.createElement('script')
        // 必须加载 ort.all 构建：它同时包含 wasm / webgl / webgpu 全部后端，
        // 这样 WebGL 尝试失败（u2net 含 ceil_mode MaxPool，WebGL 不支持）时，
        // 仍能回退到本地 WASM 后端。仅加载 ort.webgl.min.js 不含 wasm 后端，会导致回退失败。
        script.src = `${import.meta.env.BASE_URL}ort/ort.all.min.js`
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
      ort.env.wasm.numThreads = 1 // 避免多线程和 jsep.mjs 问题
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
    const modelRes = await fetch(`${import.meta.env.BASE_URL}models/u2netp.onnx`)
    if (!modelRes.ok) throw new Error(`模型加载失败：${modelRes.status}`)
    const model = await modelRes.arrayBuffer()

    onProgress?.({ percent: 25, message: '正在初始化推理引擎…' })
    // 优先尝试 WebGL（GPU）加速。但 u2net 含 ceil_mode 的 MaxPool，
    // ORT Web 的 WebGL 后端暂不支持其 shape 计算（会抛
    // "using ceil() in shape computation is not yet supported for MaxPool"），
    // 导致整个会话创建失败。因此捕获后回退到本地 WASM（CPU），保证抠图可用。
    try {
      return await ort.InferenceSession.create(model, {
        executionProviders: ['webgl', 'wasm'],
        graphOptimizationLevel: 'all',
      })
    } catch (err) {
      console.warn('[SmartCut] WebGL 后端初始化失败，回退本地 WASM：', err)
      return await ort.InferenceSession.create(model, {
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

