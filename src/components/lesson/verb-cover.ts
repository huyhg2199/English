import type { IrregularVerb } from '@/data/lessons'

/**
 * Chế độ che cột của bảng động từ bất quy tắc (story 38): che V2 và / hoặc V3 để tự nhớ, bấm "Xem" ở từng ô để hiện riêng
 * ô đó. Chỉ là state của bảng, không lưu vào store hay localStorage.
 */
export type VerbCover = { v2: boolean; v3: boolean }
export type VerbColumn = keyof VerbCover

export const NO_COVER: VerbCover = { v2: false, v3: false }

/** `learn`: bảng đầy đủ ở s1-t2-w3. `review-v3`: bảng "Ôn cột V3 trước khi học" ở s1-t3-w3, che sẵn V3. */
export type VerbTableMode = 'learn' | 'review-v3'

/** State của bảng: cột đang che và các ô đã bấm "Xem" (`cellKey`). */
export type VerbCoverState = { cover: VerbCover; revealed: ReadonlySet<string> }

/** State lúc mở bảng: `review-v3` bật sẵn "Che V3", `learn` không che gì. */
export function initialCover(mode: VerbTableMode): VerbCoverState {
  return { cover: mode === 'review-v3' ? { v2: false, v3: true } : NO_COVER, revealed: new Set() }
}

/**
 * Bật / tắt che một cột. Các ô đã "Xem" của cột đó bị xoá (tắt rồi bật lại thì che lại hết); ô đã "Xem" của cột kia giữ
 * nguyên.
 */
export function toggleCover(state: VerbCoverState, col: VerbColumn): VerbCoverState {
  const suffix = `:${col}`
  return {
    cover: { ...state.cover, [col]: !state.cover[col] },
    revealed: new Set([...state.revealed].filter((key) => !key.endsWith(suffix))),
  }
}

/** Bấm "Xem" ở một ô: chỉ ô đó hiện. */
export function revealCell(state: VerbCoverState, v1: string, col: VerbColumn): VerbCoverState {
  return { cover: state.cover, revealed: new Set(state.revealed).add(cellKey(v1, col)) }
}

/** Khoá của một ô đã bấm "Xem" (`go:v3`). */
export function cellKey(v1: string, col: VerbColumn): string {
  return `${v1}:${col}`
}

/** Ô đang bị che: cột đang bật che và ô chưa được bấm "Xem". */
export function isCellHidden(cover: VerbCover, revealed: ReadonlySet<string>, v1: string, col: VerbColumn): boolean {
  return cover[col] && !revealed.has(cellKey(v1, col))
}

/** Các dạng đang hiện của một dòng: V1 rồi V2, V3 nếu không bị che (chữ gốc, "was / were" giữ nguyên). */
function visibleForms(verb: IrregularVerb, cover: VerbCover, revealed: ReadonlySet<string>): string[] {
  const cols: VerbColumn[] = ['v2', 'v3']
  return [verb.v1, ...cols.filter((c) => !isCellHidden(cover, revealed, verb.v1, c)).map((c) => verb[c])]
}

/**
 * Câu cho nút nghe: V1 rồi các cột đang hiện, "go, went, gone" (dạng có "/" như "was / were" đọc thành hai từ). Không che
 * gì thì y như bảng cũ ("be, was, were, been"); che V3 → "go, went"; che cả hai → "go".
 */
export function speakText(verb: IrregularVerb, cover: VerbCover = NO_COVER, revealed: ReadonlySet<string> = new Set()): string {
  return visibleForms(verb, cover, revealed)
    .map((x) => x.replace(/\s*\/\s*/g, ', '))
    .join(', ')
}

/** Nhãn nút nghe: "Nghe go, went, gone"; ô đang che không lộ trong nhãn. */
export function listenLabel(verb: IrregularVerb, cover: VerbCover = NO_COVER, revealed: ReadonlySet<string> = new Set()): string {
  return `Nghe ${visibleForms(verb, cover, revealed).join(', ')}`
}
