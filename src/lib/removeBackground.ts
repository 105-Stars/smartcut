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

let ortPromise: Promise<typeof import('onnxruntime-web')> | null = null
let sessionPromise: Promise<import('onnxruntime-web').InferenceSession> | null = null

async function getOrt() {
  if (!ortPromise) {
    ortPromise = (async () => {
      // 使用 ort.wasm.min.js 版本，通过 script 标签引入避免 Vite import 错误
      // 动态创建 script 标签引入 ort.wasm.min.js
      await new Promise<void>((resolve, reject) => {
        if (typeof window !== 'undefined' && (window as any).ort) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = `${import.meta.env.BASE_URL}ort/ort.wasm.min.js`
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('加载 ORT 失败'))
        document.body.appendChild(script)
      })
      
      const ort = (window as any).ort as typeof import('onnxruntime-web')
      ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`
      ort.env.wasm.simd = true
      ort.env.wasm.numThreads = 1 // 避免多线程和 jsep.mjs 问题
      return ort
    })()
  }
  return ortPromise
}

async function getSession(onProgress?: (p: RemoveBackgroundProgress) => void) {
  if (sessionPromise) return sessionPromise

  sessionPromise = (async () => {
    const ort = await getOrt()

    onProgress?.({ percent: 10, message: '正在加载模型…' })
    const modelRes = await fetch(`${import.meta.env.BASE_URL}models/u2netp.onnx`)
    if (!modelRes.ok) throw new Error(`模型加载失败：${modelRes.status}`)
    const model = await modelRes.arrayBuffer()

    onProgress?.({ percent: 25, message: '正在初始化推理引擎…' })
    return ort.InferenceSession.create(model, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    })
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

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let i = 0; i < outData.length; i++) {
    const v = outData[i]
    if (v < min) min = v
    if (v > max) max = v
  }
  const range = max - min + 1e-6

  onProgress?.({ percent: 75, message: '正在生成透明背景…' })
  const maskCanvas = createCanvas(inputSize, inputSize)
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!maskCtx) throw new Error('Canvas 初始化失败')
  const maskImageData = maskCtx.createImageData(inputSize, inputSize)
  for (let i = 0; i < outData.length; i++) {
    const a = clamp01((outData[i] - min) / range)
    const v = Math.round(a * 255)
    const j = i * 4
    maskImageData.data[j] = v
    maskImageData.data[j + 1] = v
    maskImageData.data[j + 2] = v
    maskImageData.data[j + 3] = 255
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

  for (let i = 0; i < w * h; i++) {
    const m = maskPixels[i * 4] / 255
    let a = maskGamma !== 1 ? Math.pow(m, maskGamma) : m
    if (maskThreshold > 0) a = a < maskThreshold ? 0 : a
    rgba[i * 4 + 3] = Math.round(clamp01(a) * 255)
  }

  cutoutCtx.putImageData(cutoutImageData, 0, 0)
  onProgress?.({ percent: 100, message: '完成' })

  return { cutoutCanvas }
}

