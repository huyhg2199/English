export * from './types'
export { BRICKS, bricksOfRow, getBrickMeta, isBrickId, ROW_TITLES } from './catalog'
// Nội dung viên (`./content`, `./bricks/*`) cố ý không re-export ở đây: `@/lib/foundation` (mà đồng bộ import) chỉ cần
// danh mục; trang Sân ga import `@/data/foundation/content` trực tiếp.
