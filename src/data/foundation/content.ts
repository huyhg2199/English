import { F01_CONTENT } from './bricks/f01'
import { F02_CONTENT } from './bricks/f02'
import { F03_CONTENT } from './bricks/f03'
import { F04_CONTENT } from './bricks/f04'
import { F05_CONTENT } from './bricks/f05'
import { F06_CONTENT } from './bricks/f06'
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
  F02: withMeta('F02', F02_CONTENT),
  F03: withMeta('F03', F03_CONTENT),
  F04: withMeta('F04', F04_CONTENT),
  F05: withMeta('F05', F05_CONTENT),
  F06: withMeta('F06', F06_CONTENT),
}

/** Viên có nội dung theo id (đúng hoa thường như danh mục); chưa soạn / id lạ → `undefined`. */
export function getBrick(id: string): Brick | undefined {
  return Object.hasOwn(BRICK_CONTENT, id) ? BRICK_CONTENT[id as BrickId] : undefined
}

/** Viên `id` đã có nội dung chưa. */
export function hasBrickContent(id: string): boolean {
  return getBrick(id) !== undefined
}
