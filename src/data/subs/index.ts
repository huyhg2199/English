import { isSubFile, type SubFile } from '@/lib/subs/types'

/**
 * Phụ đề song ngữ (story 16): mỗi video VOA có sub là một file `<videoId>.json` cạnh file này. Chỉ video kênh
 * VOA Learning English (public domain) mới có file; video có bản quyền không lưu transcript.
 * File được tải lười (mỗi file một chunk riêng, không vào chunk chính). Quy trình làm sub: stack.md.
 */
const FILES = import.meta.glob<{ default: unknown }>('./*.json')

const idOf = (path: string) => path.replace(/^\.\//, '').replace(/\.json$/, '')

/** Id các video có file sub (biết được mà không cần tải file). */
export const SUBTITLED_VIDEO_IDS: ReadonlySet<string> = new Set(Object.keys(FILES).map(idOf))

export function hasSubs(videoId: string): boolean {
  return SUBTITLED_VIDEO_IDS.has(videoId)
}

export type SubLoaders = Record<string, () => Promise<{ default: unknown }>>

/**
 * Tải file sub của video. Không có file, tải lỗi (offline) hoặc file sai cấu trúc → reject.
 * `files` chỉ để test (mặc định là các file cạnh đây).
 */
export async function loadSubs(videoId: string, files: SubLoaders = FILES): Promise<SubFile> {
  const load = files[`./${videoId}.json`]
  if (!load) throw new Error(`Video ${videoId} không có phụ đề`)
  const data = (await load()).default
  if (!isSubFile(data) || data.videoId !== videoId) throw new Error(`File phụ đề ${videoId} sai cấu trúc`)
  return data
}
