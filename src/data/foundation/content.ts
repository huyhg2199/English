import { F01_CONTENT } from './bricks/f01'
import { getBrickMeta } from './catalog'
import type { Brick, BrickId } from './types'

/**
 * Sổ đăng ký nội dung viên gạch (story 19+). Không re-export từ `./index` để `@/lib/foundation` (mà đồng bộ import)
 * không kéo nội dung theo. Mỗi viên = meta trong danh mục + `screens`, `ruleCards`, `themeWordIds` ở `./bricks/fNN.ts`.
 */
function withMeta(id: BrickId, content: Pick<Brick, 'screens' | 'ruleCards' | 'themeWordIds'>): Brick {
  const meta = getBrickMeta(id)
  if (!meta) throw new Error(`Viên ${id} không có trong danh mục`)
  return { ...meta, ...content }
}

export const BRICK_CONTENT: Readonly<Partial<Record<BrickId, Brick>>> = {
  F01: withMeta('F01', F01_CONTENT),
}

/** Viên có nội dung theo id (đúng hoa thường như danh mục); chưa soạn / id lạ → `undefined`. */
export function getBrick(id: string): Brick | undefined {
  return Object.hasOwn(BRICK_CONTENT, id) ? BRICK_CONTENT[id as BrickId] : undefined
}

/** Viên `id` đã có nội dung chưa. */
export function hasBrickContent(id: string): boolean {
  return getBrick(id) !== undefined
}
