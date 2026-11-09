import { F01_CONTENT } from './bricks/f01'
import { F02_CONTENT } from './bricks/f02'
import { F03_CONTENT } from './bricks/f03'
import { F04_CONTENT } from './bricks/f04'
import { F05_CONTENT } from './bricks/f05'
import { F06_CONTENT } from './bricks/f06'
import { F07_CONTENT } from './bricks/f07'
import { F08_CONTENT } from './bricks/f08'
import { F09_CONTENT } from './bricks/f09'
import { F10_CONTENT } from './bricks/f10'
import { F11_CONTENT } from './bricks/f11'
import { F12_CONTENT } from './bricks/f12'
import { F13_CONTENT } from './bricks/f13'
import { F14_CONTENT } from './bricks/f14'
import { F15_CONTENT } from './bricks/f15'
import { F16_CONTENT } from './bricks/f16'
import { F17_CONTENT } from './bricks/f17'
import { F18_CONTENT } from './bricks/f18'
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
  F07: withMeta('F07', F07_CONTENT),
  F08: withMeta('F08', F08_CONTENT),
  F09: withMeta('F09', F09_CONTENT),
  F10: withMeta('F10', F10_CONTENT),
  F11: withMeta('F11', F11_CONTENT),
  F12: withMeta('F12', F12_CONTENT),
  F13: withMeta('F13', F13_CONTENT),
  F14: withMeta('F14', F14_CONTENT),
  F15: withMeta('F15', F15_CONTENT),
  F16: withMeta('F16', F16_CONTENT),
  F17: withMeta('F17', F17_CONTENT),
  F18: withMeta('F18', F18_CONTENT),
}

/** Viên có nội dung theo id (đúng hoa thường như danh mục); chưa soạn / id lạ → `undefined`. */
export function getBrick(id: string): Brick | undefined {
  return Object.hasOwn(BRICK_CONTENT, id) ? BRICK_CONTENT[id as BrickId] : undefined
}

/** Viên `id` đã có nội dung chưa. */
export function hasBrickContent(id: string): boolean {
  return getBrick(id) !== undefined
}
