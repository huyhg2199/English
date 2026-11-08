// Logic thuần của `npm run layout:guard` (story 29): chặn thay đổi class không tiền tố, để giao diện dưới 1024px không đổi.
// Bố cục máy tính chỉ được THÊM/XOÁ class có tiền tố `lg:` / `xl:` / `2xl:` / `pointer-fine:`.
// Guard chỉ là lọc nhanh, KHÔNG phải bằng chứng (bằng chứng là ảnh 375px của `layout:check`). Giới hạn đã biết:
// - so theo *tập* token mỗi file: chuyển token có sẵn sang phần tử khác cùng file, hay đảo điều kiện
//   (`active && 'x'` → `!active && 'x'`) không bị báo;
// - chỉ đọc `className=`, `cn(…)`, `cva(…)`: chuỗi trong hằng (`const cls = '…'`), prop `xxxClassName=`, `clsx`/`twMerge`,
//   `style={{…}}` và file CSS (`src/index.css`) không được xét.

/** File có dòng này (bản mới, và bản cũ nếu có) thì guard bỏ qua: cả file ẩn dưới 1024px, vd TopBar. */
export const DESKTOP_ONLY_MARKER = 'mobile-guard: desktop-only'

const DESKTOP_PREFIXES = ['lg:', 'xl:', '2xl:', 'pointer-fine:']

/** Token chỉ có hiệu lực trên máy tính: bắt đầu bằng một tiền tố desktop (cho phép nối tiếp, vd `lg:hover:bg-accent`). */
export function isDesktopOnlyToken(token) {
  return DESKTOP_PREFIXES.some((prefix) => token.startsWith(prefix) && token.length > prefix.length)
}

/**
 * Đọc một chuỗi bắt đầu ở `source[start]` (', " hoặc `). Trả phần tĩnh, các chuỗi lồng trong `${…}` của template
 * và vị trí sau dấu đóng.
 */
function readString(source, start) {
  const quote = source[start]
  let text = ''
  const nested = []
  let i = start + 1
  while (i < source.length) {
    const ch = source[i]
    if (ch === '\\') {
      text += source[i + 1] ?? ''
      i += 2
      continue
    }
    if (ch === quote) return { text, nested, end: i + 1 }
    if (quote === '`' && ch === '$' && source[i + 1] === '{') {
      const close = skipBalanced(source, i + 1, '{', '}')
      nested.push(...stringsIn(source, i + 1, close))
      text += ' '
      i = close
      continue
    }
    text += ch
    i++
  }
  return { text, nested, end: i }
}

/** Từ `source[start] === open`, trả vị trí ngay sau dấu đóng tương ứng (bỏ qua chuỗi bên trong). */
function skipBalanced(source, start, open, close) {
  let depth = 0
  let i = start
  while (i < source.length) {
    const ch = source[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      i = readString(source, i).end
      continue
    }
    if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) return i + 1
    }
    i++
  }
  return i
}

/** Mọi chuỗi (phần tĩnh) trong `source[start, end)`. */
function stringsIn(source, start, end) {
  const out = []
  let i = start
  while (i < end) {
    const ch = source[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      const { text, nested, end: next } = readString(source, i)
      out.push(text, ...nested)
      i = next
      continue
    }
    i++
  }
  return out
}

/**
 * Token class trong `source`: chuỗi trong `className=` (chuỗi trực tiếp hoặc biểu thức `{…}`) và trong lời gọi `cn(…)` / `cva(…)`.
 * Trả mảng không trùng, giữ thứ tự gặp.
 */
export function classTokens(source) {
  const strings = []
  const attr = /\bclassName\s*=\s*/g
  for (let m = attr.exec(source); m; m = attr.exec(source)) {
    const at = m.index + m[0].length
    const ch = source[at]
    if (ch === '"' || ch === "'" || ch === '`') {
      const { text, nested } = readString(source, at)
      strings.push(text, ...nested)
    }
    else if (ch === '{') strings.push(...stringsIn(source, at, skipBalanced(source, at, '{', '}')))
  }
  const call = /\b(?:cn|cva)\s*\(/g
  for (let m = call.exec(source); m; m = call.exec(source)) {
    const at = m.index + m[0].length - 1
    strings.push(...stringsIn(source, at, skipBalanced(source, at, '(', ')')))
  }
  const tokens = new Set()
  for (const text of strings) for (const token of text.split(/\s+/)) if (token) tokens.add(token)
  return [...tokens]
}

/**
 * So tập token class của một file trước/sau. `before === null`: file mới. Bỏ qua nếu bản mới có marker desktop-only
 * và bản cũ (nếu có) cũng có;
 * `after === null`: file bị xoá. Chỉ token không tiền tố desktop mới là vi phạm.
 * @returns {{ path: string, token: string, kind: 'added' | 'removed' }[]}
 */
export function guardFile({ path, before, after }) {
  if (after !== null && after.includes(DESKTOP_ONLY_MARKER) && (before === null || before.includes(DESKTOP_ONLY_MARKER)))
    return []
  const was = new Set(before === null ? [] : classTokens(before))
  const now = new Set(after === null ? [] : classTokens(after))
  const out = []
  for (const token of now) if (!was.has(token) && !isDesktopOnlyToken(token)) out.push({ path, token, kind: 'added' })
  for (const token of was) if (!now.has(token) && !isDesktopOnlyToken(token)) out.push({ path, token, kind: 'removed' })
  return out
}

/** File nguồn guard xét: `src/**` `.ts`/`.tsx`, trừ test. */
export function isGuardedPath(path) {
  return /^src\/.+\.(ts|tsx)$/.test(path) && !/\.test\.tsx?$/.test(path)
}

/**
 * Tham số của `layout:guard`: chỉ `--base <ref>` (mặc định HEAD). Tham số lạ (vd `--bsae`, `--base=x`) thì ném lỗi tiếng Việt,
 * để không lặng lẽ so với HEAD.
 * @returns {{ base: string }}
 */
export function parseGuardArgs(argv) {
  const args = { base: 'HEAD' }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg !== '--base') throw new Error(`Không hiểu tham số "${arg}". Dùng: --base <ref> (vd --base HEAD~1).`)
    const value = argv[i + 1]
    if (!value || value.startsWith('--')) throw new Error('Thiếu giá trị cho --base (vd --base HEAD~1).')
    args.base = value
    i++
  }
  return args
}

/**
 * Đọc `git diff --name-status -z -M`: mỗi mục là `status\0path\0`, đổi tên/chép (`R…`/`C…`) là `status\0cũ\0mới\0`.
 * Trả `{ path, oldPath }`: `oldPath` là đường dẫn ở base (khác `path` khi đổi tên; `null` khi file mới thêm).
 * @returns {{ path: string, oldPath: string | null }[]}
 */
export function parseNameStatus(output) {
  const parts = output.split('\0')
  const out = []
  for (let i = 0; i < parts.length; ) {
    const status = parts[i]
    if (!status) {
      i++
      continue
    }
    if (status.startsWith('R') || status.startsWith('C')) {
      out.push({ path: parts[i + 2], oldPath: parts[i + 1] })
      i += 3
    } else {
      out.push({ path: parts[i + 1], oldPath: status === 'A' ? null : parts[i + 1] })
      i += 2
    }
  }
  return out
}
