/** 将字节数格式化为人类可读字符串 (B / KB / MB)。 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)}KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)}MB`
}

/** 按区域格式化日期字符串；非法输入原样返回。 */
export function formatDate(date: string, locale: string): string {
  const parsed = new Date(date)
  // new Date() 解析失败时不会抛错，而是返回 Invalid Date，
  // 因此必须显式检查有效性，否则 try/catch 永远捕获不到。
  if (Number.isNaN(parsed.getTime())) return date
  try {
    return parsed.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return date
  }
}

/**
 * 兼容移动端的文件下载函数。
 *
 * - 桌面端：创建 <a> 标签点击下载
 * - 移动端：
 *   - 优先使用 navigator.share()（支持分享文件）
 *   - 降级使用 <a> 点击（部分浏览器支持）
 *   - 最后降级为 window.open()
 *
 * @param blob - 要下载的文件数据
 * @param filename - 下载文件名
 * @returns 是否成功触发下载
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<boolean> {
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : '',
  )

  if (isMobile && navigator.share && blob.type.startsWith('image/')) {
    try {
      const file = new File([blob], filename, { type: blob.type })
      await navigator.share({
        files: [file],
        title: filename,
      })
      return true
    } catch (err: unknown) {
      // 用户取消分享（AbortError）或不支持分享时不报错，降级到常规下载
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('[SmartCut] navigator.share 失败，降级到 <a> 下载：', err)
      }
    }
  }

  // 标准 <a> 标签下载
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    // 确保 <a> 在 DOM 中（某些移动浏览器需要）
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return true
  } catch (err) {
    console.warn('[SmartCut] <a> 下载失败，尝试 window.open 降级：', err)
    // 最后降级：在新标签页中打开（用户可手动保存）
    window.open(url, '_blank')
    return false
  } finally {
    // 延迟释放 URL，确保下载启动
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}
