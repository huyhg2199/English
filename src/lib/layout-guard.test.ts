import { describe, expect, it } from 'vitest'

import {
  classTokens,
  DESKTOP_ONLY_MARKER,
  guardFile,
  isDesktopOnlyToken,
  isGuardedPath,
  parseGuardArgs,
  parseNameStatus,
} from '../../scripts/layout/guard-lib.mjs'

const BEFORE = `import { cn } from '@/lib/utils'
export function Box({ active }: { active: boolean }) {
  return (
    <div className="mx-auto w-full max-w-md px-4">
      <span className={cn('flex items-center', active && 'bg-accent')}>x</span>
    </div>
  )
}
`

const edit = (from: string, to: string) => BEFORE.replace(from, to)

describe('layout:guard — isDesktopOnlyToken', () => {
  it('tiền tố lg:/xl:/2xl:/pointer-fine:, cho phép nối tiếp', () => {
    for (const t of [
      'lg:hidden',
      'xl:grid',
      '2xl:max-w-6xl',
      'pointer-fine:hover:bg-accent',
      'lg:hover:text-foreground',
    ])
      expect(isDesktopOnlyToken(t)).toBe(true)
  })

  it('không tiền tố hoặc tiền tố ảnh hưởng điện thoại → false', () => {
    for (const t of ['grid', 'hover:lg:block', 'max-lg:hidden', 'md:flex', 'sm:px-2', 'lg:', 'dark:bg-card'])
      expect(isDesktopOnlyToken(t)).toBe(false)
  })
})

describe('layout:guard — classTokens', () => {
  it('lấy token từ className="…", className={…} và cn(…) / cva(…)', () => {
    const src = `
      <a className="a b" />
      <b className={'c'} />
      <i className={\`d \${x ? 'e' : 'f'} g\`} />
      const v = cva('h i', { variants: { size: { sm: 'j' } } })
      cn('k', cond && "l m")
    `
    expect(classTokens(src).sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'])
  })

  it('bỏ qua chuỗi ngoài className / cn / cva', () => {
    expect(classTokens(`const label = 'grid flex'; <p title="px-4">x</p>`)).toEqual([])
  })
})

describe('layout:guard — guardFile', () => {
  const path = 'src/components/Box.tsx'

  it('chỉ thêm class có tiền tố (lg:hidden, pointer-fine:hover:bg-accent, xl:grid) → không vi phạm', () => {
    const after = edit('max-w-md px-4', 'max-w-md px-4 lg:hidden pointer-fine:hover:bg-accent xl:grid')
    expect(guardFile({ path, before: BEFORE, after })).toEqual([])
  })

  it('thêm class không tiền tố (grid) → vi phạm added', () => {
    expect(guardFile({ path, before: BEFORE, after: edit('flex items-center', 'flex grid items-center') })).toEqual([
      { path, token: 'grid', kind: 'added' },
    ])
  })

  it('xoá px-4 → vi phạm removed', () => {
    expect(guardFile({ path, before: BEFORE, after: edit(' px-4', '') })).toEqual([
      { path, token: 'px-4', kind: 'removed' },
    ])
  })

  it('đổi max-w-md → max-w-lg → thêm max-w-lg và xoá max-w-md', () => {
    expect(guardFile({ path, before: BEFORE, after: edit('max-w-md', 'max-w-lg') })).toEqual([
      { path, token: 'max-w-lg', kind: 'added' },
      { path, token: 'max-w-md', kind: 'removed' },
    ])
  })

  it('chuyển chuỗi className vào cn(…) mà giữ token → không vi phạm', () => {
    const after = edit(
      `className="mx-auto w-full max-w-md px-4"`,
      `className={cn('mx-auto w-full max-w-md px-4', 'lg:max-w-3xl')}`,
    )
    expect(guardFile({ path, before: BEFORE, after })).toEqual([])
  })

  it('xoá class có tiền tố → không vi phạm', () => {
    const before = edit('px-4', 'px-4 lg:hidden')
    expect(guardFile({ path, before, after: BEFORE })).toEqual([])
  })

  it('file mới có marker desktop-only → bỏ qua', () => {
    expect(guardFile({ path, before: null, after: `// ${DESKTOP_ONLY_MARKER}\n${BEFORE}` })).toEqual([])
  })

  it('file đã có marker ở base và bản mới vẫn có → bỏ qua; bản cũ không có marker → vẫn xét', () => {
    const marked = `// ${DESKTOP_ONLY_MARKER}\n${BEFORE}`
    expect(guardFile({ path, before: marked, after: marked.replace('px-4', 'px-6 grid') })).toEqual([])
    expect(guardFile({ path, before: BEFORE, after: `// ${DESKTOP_ONLY_MARKER}\n${edit('px-4', 'px-6')}` })).toEqual([
      { path, token: 'px-6', kind: 'added' },
      { path, token: 'px-4', kind: 'removed' },
    ])
  })

  it('file mới không có marker → báo mọi token không tiền tố', () => {
    const tokens = guardFile({ path, before: null, after: edit('px-4', 'px-4 lg:block') }).map(
      (v) => `${v.kind}:${v.token}`,
    )
    expect(tokens.sort()).toEqual(
      ['mx-auto', 'w-full', 'max-w-md', 'px-4', 'flex', 'items-center', 'bg-accent'].map((t) => `added:${t}`).sort(),
    )
  })

  it('file bị xoá → báo token không tiền tố bị xoá', () => {
    expect(guardFile({ path, before: BEFORE, after: null }).every((v) => v.kind === 'removed')).toBe(true)
  })

  it('chỉ xét src/**/*.ts(x), trừ test', () => {
    expect(isGuardedPath('src/components/TopBar.tsx')).toBe(true)
    expect(isGuardedPath('src/app/route-handle.ts')).toBe(true)
    expect(isGuardedPath('src/app/route-handle.test.ts')).toBe(false)
    expect(isGuardedPath('src/index.css')).toBe(false)
    expect(isGuardedPath('scripts/layout/check.mjs')).toBe(false)
  })
})

describe('layout:guard — parseGuardArgs', () => {
  it('mặc định HEAD; --base <ref>', () => {
    expect(parseGuardArgs([])).toEqual({ base: 'HEAD' })
    expect(parseGuardArgs(['--base', 'abc123'])).toEqual({ base: 'abc123' })
  })

  it('tham số lạ hoặc thiếu giá trị → ném lỗi (không lặng lẽ so với HEAD)', () => {
    expect(() => parseGuardArgs(['--bsae', 'x'])).toThrow(/Không hiểu tham số/)
    expect(() => parseGuardArgs(['--base=x'])).toThrow(/Không hiểu tham số/)
    expect(() => parseGuardArgs(['x'])).toThrow(/Không hiểu tham số/)
    expect(() => parseGuardArgs(['--base'])).toThrow(/Thiếu giá trị/)
    expect(() => parseGuardArgs(['--base', '--x'])).toThrow(/Thiếu giá trị/)
  })
})

describe('layout:guard — parseNameStatus', () => {
  it('sửa / thêm / xoá / đổi tên (đọc bản cũ từ đường dẫn cũ) / đường dẫn có dấu', () => {
    const out = [
      'M', 'src/a.tsx',
      'A', 'src/new.tsx',
      'D', 'src/gone.tsx',
      'R100', 'src/old-name.tsx', 'src/new-name.tsx',
      'M', 'src/trang chủ.tsx',
      '',
    ].join('\0')
    expect(parseNameStatus(out)).toEqual([
      { path: 'src/a.tsx', oldPath: 'src/a.tsx' },
      { path: 'src/new.tsx', oldPath: null },
      { path: 'src/gone.tsx', oldPath: 'src/gone.tsx' },
      { path: 'src/new-name.tsx', oldPath: 'src/old-name.tsx' },
      { path: 'src/trang chủ.tsx', oldPath: 'src/trang chủ.tsx' },
    ])
    expect(parseNameStatus('')).toEqual([])
  })

  it('file đổi tên giữ nguyên class → không vi phạm khi so với bản ở đường dẫn cũ', () => {
    const [{ path, oldPath }] = parseNameStatus(['R100', 'src/Old.tsx', 'src/New.tsx', ''].join('\0'))
    expect(oldPath).toBe('src/Old.tsx')
    expect(guardFile({ path, before: BEFORE, after: BEFORE })).toEqual([])
  })
})
