// `npm run layout:guard [-- --base <ref>]` (story 29): so class của các file `src/**/*.{ts,tsx}` đã đổi với `<ref>` (mặc định HEAD)
// và file chưa track. Thêm/xoá class không tiền tố `lg:`/`xl:`/`2xl:`/`pointer-fine:` là vi phạm → exit 1.
// Logic thuần ở guard-lib.mjs (kèm giới hạn đã biết). Chỉ chạy tay, không nằm trong CI.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

import { guardFile, isGuardedPath, parseGuardArgs, parseNameStatus } from './guard-lib.mjs'

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

function main() {
  let base
  try {
    base = parseGuardArgs(process.argv.slice(2)).base
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    return 2
  }
  const root = git(['rev-parse', '--show-toplevel']).trim()
  process.chdir(root)
  try {
    git(['rev-parse', '--verify', `${base}^{commit}`])
  } catch {
    console.error(`Không tìm thấy commit "${base}".`)
    return 2
  }

  // -z: đường dẫn không bị git đóng ngoặc/escape; -M: file đổi tên đọc bản cũ từ đường dẫn cũ.
  const oldPathOf = new Map()
  for (const { path, oldPath } of parseNameStatus(git(['diff', '--name-status', '-z', '-M', base, '--', 'src'])))
    oldPathOf.set(path, oldPath)
  const untracked = git(['ls-files', '-z', '--others', '--exclude-standard', '--', 'src']).split('\0').filter(Boolean)
  for (const path of untracked) oldPathOf.set(path, null)
  const files = [...oldPathOf.keys()].filter(isGuardedPath).sort()

  const violations = []
  for (const path of files) {
    const oldPath = oldPathOf.get(path)
    let before = null
    if (oldPath !== null) {
      try {
        before = git(['show', `${base}:${oldPath}`])
      } catch {
        before = null
      }
    }
    const after = existsSync(path) ? readFileSync(path, 'utf8') : null
    violations.push(...guardFile({ path, before, after }))
  }

  console.log(`layout:guard — so với ${base}: ${files.length} file nguồn đã đổi.`)
  if (violations.length === 0) {
    console.log('Không có class không tiền tố nào bị thêm/xoá. (Guard chỉ lọc nhanh; bằng chứng 375px là `npm run layout:check`.)')
    return 0
  }
  console.error(`\n${violations.length} vi phạm (chỉ được thêm/xoá class có tiền tố lg:/xl:/2xl:/pointer-fine:):`)
  for (const v of violations) console.error(`  ${v.path}  ${v.kind === 'added' ? '+ thêm' : '- xoá'}  ${v.token}`)
  console.error(
    '\nFile chỉ dành cho máy tính (ẩn dưới 1024px) thì thêm comment "mobile-guard: desktop-only" ở đầu file.',
  )
  return 1
}

process.exit(main())
