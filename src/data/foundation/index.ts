export * from './types'
export {
  BRICKS,
  brickIdFromLessonId,
  brickLessonId,
  bricksOfRow,
  getBrickMeta,
  isBrickId,
  ROW_TITLES,
} from './catalog'
export { LETTER_SPEECH, spellForSpeech } from './letters'
// Nội dung viên (`./content`, `./bricks/*`) cố ý không re-export ở đây: `@/lib/foundation` (mà đồng bộ import) chỉ cần
// danh mục; trang Sân ga import `@/data/foundation/content` trực tiếp.
