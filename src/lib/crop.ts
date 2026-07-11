export interface CropRect {
  sx: number
  sy: number
  cropW: number
  cropH: number
}

/**
 * 计算居中裁剪矩形：在保持目标宽高比的前提下，从原图中裁出最大的内切区域。
 * 与 CropPresetPanel 内联逻辑完全一致，已用单元测试锁定行为。
 */
export function getCropRect(
  naturalWidth: number,
  naturalHeight: number,
  presetWidth: number,
  presetHeight: number,
): CropRect {
  const imgRatio = naturalWidth / naturalHeight
  const cropRatio = presetWidth / presetHeight
  let cropW: number
  let cropH: number
  if (imgRatio > cropRatio) {
    cropH = naturalHeight
    cropW = cropH * cropRatio
  } else {
    cropW = naturalWidth
    cropH = cropW / cropRatio
  }
  const sx = (naturalWidth - cropW) / 2
  const sy = (naturalHeight - cropH) / 2
  return { sx, sy, cropW, cropH }
}
