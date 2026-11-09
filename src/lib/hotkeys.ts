/**
 * Phím tắt máy tính (story 31): logic thuần (chốt bỏ qua phím, tên phím, hành động theo màn). Hook `useHotkeys`
 * (`src/app/use-hotkeys.ts`) đọc DOM thành `KeyLike`/`KeyEnv` rồi gọi các hàm ở đây.
 */
import type { Grade } from '@/lib/srs'

export type HotkeyName = 'Space' | 'Enter' | 'ArrowLeft' | 'ArrowRight' | '1' | '2' | '3' | '4' | 'k' | 'l'

/** Phím → handler; chỉ chứa phím đang có hành động (phím không có binding thì không bị chặn). */
export type HotkeyBindings = Partial<Record<HotkeyName, () => void>>

/** Phím chọn lựa chọn thứ n (1–4). */
export const CHOICE_KEYS = ['1', '2', '3', '4'] as const satisfies readonly HotkeyName[]

/** Phần tử nhận phím (`event.target`), rút gọn thành dữ liệu thuần. */
export type KeyTarget = {
  tagName: string
  isContentEditable: boolean
  role: string | null
  /** `a` có `href`. */
  hasHref: boolean
  disabled: boolean
}

export type KeyLike = {
  key: string
  keyCode?: number
  isComposing: boolean
  repeat: boolean
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  shiftKey: boolean
  defaultPrevented: boolean
  target: KeyTarget | null
}

export type KeyEnv = {
  /** Đang mở dialog (`[role="dialog"]`, `[role="alertdialog"]`, `dialog[open]`). */
  dialogOpen: boolean
  /** Chữ đang bôi đen (`getSelection().toString()`). */
  selectedText: string
}

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])
const ACTIVATING_ROLES = new Set(['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option'])

/** Phần tử mà Space / Enter sẽ được trình duyệt "bấm" (nút, link, summary, role tương tác) và chưa `disabled`. */
function activatesOnKey(target: KeyTarget): boolean {
  if (target.disabled) return false
  const tag = target.tagName.toUpperCase()
  if (tag === 'BUTTON' || tag === 'SUMMARY') return true
  if (tag === 'A' && target.hasHref) return true
  return target.role !== null && ACTIVATING_ROLES.has(target.role)
}

/**
 * Phím này có được xử lý làm phím tắt không. Bỏ qua khi: đã bị chặn (`defaultPrevented`), đang gõ IME (`isComposing` hoặc
 * `keyCode` 229), giữ phím (`repeat`), có Ctrl/Meta/Alt/Shift, đang mở dialog, đang bôi đen chữ (khác khoảng trắng), đang ở ô
 * nhập (`input`/`textarea`/`select`/contenteditable). Space/Enter trên nút / link / summary / role tương tác chưa `disabled`
 * để trình duyệt bấm; số và mũi tên vẫn chạy ở đó.
 */
export function shouldHandleKey(e: KeyLike, env: KeyEnv): boolean {
  if (e.defaultPrevented) return false
  if (e.isComposing || e.keyCode === 229) return false
  if (e.repeat) return false
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return false
  if (env.dialogOpen) return false
  if (env.selectedText.trim() !== '') return false
  const target = e.target
  if (!target) return true
  if (TYPING_TAGS.has(target.tagName.toUpperCase()) || target.isContentEditable) return false
  const name = hotkeyName(e.key)
  if ((name === 'Space' || name === 'Enter') && activatesOnKey(target)) return false
  return true
}

/** Tên phím tắt của `KeyboardEvent.key`; null nếu không phải phím tắt nào. */
export function hotkeyName(key: string): HotkeyName | null {
  switch (key) {
    case ' ':
    case 'Spacebar':
      return 'Space'
    case 'Enter':
    case 'ArrowLeft':
    case 'ArrowRight':
    case '1':
    case '2':
    case '3':
    case '4':
      return key
    case 'k':
    case 'K':
      return 'k'
    case 'l':
    case 'L':
      return 'l'
    default:
      return null
  }
}

/** Phím 1–4 → vị trí lựa chọn (0-based) nếu có đủ lựa chọn; còn lại null. */
export function choiceForKey(name: HotkeyName, count: number): number | null {
  const at = (CHOICE_KEYS as readonly string[]).indexOf(name)
  if (at < 0 || at >= count) return null
  return at
}

/** Thứ tự nút chấm thẻ: Quên / Khó / Nhớ / Dễ ↔ 1 / 2 / 3 / 4. */
export const GRADE_KEYS: readonly Grade[] = ['again', 'hard', 'good', 'easy']

export type FlashcardKeyState = {
  flipped: boolean
  /** Thẻ "Làm quen" (lật sẵn, nút "Đã xem", không có 4 nút chấm). */
  intro: boolean
  /** Nút "Đã biết…" đang hiện. */
  knownVisible: boolean
  /** Chữ của nút nghe từ đang hiện; null khi không đọc được TTS hoặc nút chưa hiện (vd mặt trước thẻ hư từ). */
  listenText: string | null
}

export type FlashcardKeyAction =
  | { type: 'flip' }
  | { type: 'grade'; grade: Grade }
  | { type: 'known' }
  | { type: 'listen'; text: string }

/**
 * Hành động của một phím trên thẻ từ; null = phím không làm gì (không chặn, vd Space đã lật thì trang cuộn như thường).
 * Thẻ "Làm quen": Enter = nút "Đã xem" (`onGrade('good')`).
 */
export function flashcardKeyAction(name: HotkeyName, card: FlashcardKeyState): FlashcardKeyAction | null {
  if (name === 'Space') return card.flipped ? null : { type: 'flip' }
  if (name === 'Enter') return card.flipped && card.intro ? { type: 'grade', grade: 'good' } : null
  if (name === 'k') return card.knownVisible ? { type: 'known' } : null
  if (name === 'l') return card.listenText ? { type: 'listen', text: card.listenText } : null
  const at = choiceForKey(name, GRADE_KEYS.length)
  if (at === null || !card.flipped || card.intro) return null
  return { type: 'grade', grade: GRADE_KEYS[at] }
}

/** Thẻ đang hiện, đủ để dựng `FlashcardKeyState` (mỗi loại thẻ một nhánh, khớp nút đang hiện trên thẻ). */
export type FlashcardCard =
  /** Thẻ NGSL/TSL: "Đã biết" khi là từ mới; nút nghe từ ẩn ở mặt trước thẻ hư từ (`cloze`). */
  | { variant: 'word'; flipped: boolean; intro: boolean; isNew: boolean; word: string; cloze: boolean; canSpeak: boolean }
  /** Thẻ riêng từ Sổ tay: nút nghe luôn ở header; "Đã biết cụm này" chỉ sau khi lật và là thẻ mới. */
  | { variant: 'custom'; flipped: boolean; isNew: boolean; word: string; canSpeak: boolean }
  /** Thẻ quy tắc: không có "Đã biết", không có nút nghe từ. */
  | { variant: 'rule'; flipped: boolean }

export function flashcardKeyState(card: FlashcardCard): FlashcardKeyState {
  switch (card.variant) {
    case 'word':
      return {
        flipped: card.flipped,
        intro: card.intro,
        knownVisible: card.isNew,
        listenText: card.canSpeak && (!card.cloze || card.flipped) ? card.word : null,
      }
    case 'custom':
      return {
        flipped: card.flipped,
        intro: false,
        knownVisible: card.flipped && card.isNew,
        listenText: card.canSpeak ? card.word : null,
      }
    case 'rule':
      return { flipped: card.flipped, intro: false, knownVisible: false, listenText: null }
  }
}

const FLASHCARD_KEYS: readonly HotkeyName[] = ['Space', 'Enter', '1', '2', '3', '4', 'k', 'l']

/** Bindings của thẻ từ: mỗi phím có hành động (`flashcardKeyAction`) gọi đúng handler của nút tương ứng. */
export function flashcardBindings(
  card: FlashcardKeyState,
  on: { flip: () => void; grade: (grade: Grade) => void; known: () => void; listen: (text: string) => void },
): HotkeyBindings {
  const bindings: HotkeyBindings = {}
  for (const name of FLASHCARD_KEYS) {
    const action = flashcardKeyAction(name, card)
    if (!action) continue
    if (action.type === 'flip') bindings[name] = on.flip
    else if (action.type === 'grade') bindings[name] = () => on.grade(action.grade)
    else if (action.type === 'known') bindings[name] = on.known
    else bindings[name] = () => on.listen(action.text)
  }
  return bindings
}

/**
 * Bindings của câu trắc nghiệm (`QuestionCard`, câu check `choice`/`listen`): đang chọn thì 1–4 chọn lựa chọn thứ n
 * (n ≤ `count`); không còn chọn được và có `next` thì Enter → `next`.
 */
export function choiceBindings(state: {
  choosing: boolean
  count: number
  choose: (at: number) => void
  next?: (() => void) | undefined
}): HotkeyBindings {
  const bindings: HotkeyBindings = {}
  if (state.choosing) {
    for (const name of CHOICE_KEYS) {
      const at = choiceForKey(name, state.count)
      if (at !== null) bindings[name] = () => state.choose(at)
    }
  } else if (state.next) bindings.Enter = state.next
  return bindings
}

/** Buổi học: → sang bước sau, ← về bước trước; ở bước cuối → và ở bước đầu ← không làm gì (null). */
export function stepForKey(name: HotkeyName, index: number, count: number): number | null {
  if (name === 'ArrowRight') return index + 1 < count ? index + 1 : null
  if (name === 'ArrowLeft') return index > 0 ? index - 1 : null
  return null
}
