/** `fallback`: share lỗi (không phải người dùng huỷ) nên đã thử tải qua link. */
export type ShareOrDownloadResult = 'shared' | 'downloaded' | 'fallback' | 'cancelled'

type ShareNavigator = {
  canShare?: (data: ShareData) => boolean
  share?: (data: ShareData) => Promise<void>
}

export type ShareOrDownloadDeps = {
  navigator?: ShareNavigator | null
  document?: Document
  createObjectURL?: (blob: Blob) => string
  revokeObjectURL?: (url: string) => void
  /** MIME của file (mặc định JSON). */
  type?: string
}

function isAbort(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError'
}

/**
 * Xuất file JSON: trình duyệt share được file (iPhone PWA) thì mở bảng chia sẻ để lưu vào Tệp;
 * không thì tải qua link `download`. Người dùng đóng bảng chia sẻ (`AbortError`) → `cancelled`, không báo lỗi.
 * Lỗi share khác thì thử tải qua link và trả về `fallback`.
 */
export async function shareOrDownload(
  fileName: string,
  json: string,
  deps: ShareOrDownloadDeps = {},
): Promise<ShareOrDownloadResult> {
  const nav = deps.navigator === undefined ? (globalThis.navigator as ShareNavigator | undefined) : deps.navigator
  const type = deps.type ?? 'application/json'
  const blob = new Blob([json], { type })
  let shareFailed = false
  if (nav?.share && nav.canShare && typeof File !== 'undefined') {
    const file = new File([blob], fileName, { type })
    let canShare: boolean
    try {
      canShare = nav.canShare({ files: [file] })
    } catch {
      canShare = false
    }
    if (canShare) {
      try {
        await nav.share({ files: [file], title: fileName })
        return 'shared'
      } catch (error) {
        if (isAbort(error)) return 'cancelled'
        shareFailed = true
      }
    }
  }
  const doc = deps.document ?? globalThis.document
  const createUrl = deps.createObjectURL ?? ((b: Blob) => URL.createObjectURL(b))
  const revokeUrl = deps.revokeObjectURL ?? ((u: string) => URL.revokeObjectURL(u))
  const url = createUrl(blob)
  const link = doc.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  link.style.display = 'none'
  doc.body.appendChild(link)
  link.click()
  link.remove()
  // Safari cần URL còn sống một lúc sau khi click.
  setTimeout(() => revokeUrl(url), 1000)
  return shareFailed ? 'fallback' : 'downloaded'
}
