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
