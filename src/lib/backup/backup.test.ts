import { describe, expect, it, vi } from 'vitest'

import { readCompletedLessonIds, setLessonCompleted } from '@/lib/roadmap-progress'
import { readSavedWords, saveWord } from '@/lib/saved-words'
import { readSessionDays, recordSession } from '@/lib/sessions'
import { gradeCard, readSrs } from '@/lib/srs'
import { createDefaultStore, CURRENT_VERSION, migrations, runMigrations, type Store } from '@/lib/storage'

import {
  BACKUP_KEYS,
  backupFileName,
  createBackup,
  MAX_BACKUP_BYTES,
  parseBackup,
  restoreBackup,
  serializeBackup,
  summarizeBackup,
  type Backup,
} from './backup'
import { shareOrDownload } from './download'

const T0 = new Date('2026-10-20T08:00:00.000Z')
const T1 = new Date('2026-10-25T08:00:00.000Z')
const T2 = new Date('2026-10-30T08:00:00.000Z')

const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })

/** Store có `lessons` bài xong và `cards` thẻ, mỗi thẻ chấm lúc `at`. */
function studied(lessons: number, cards: number, at: Date = T0): Store {
  let s = empty()
  for (let i = 0; i < lessons; i++) s = setLessonCompleted(s, `lesson-${i}`, true, at)
  for (let i = 0; i < cards; i++) s = gradeCard(s, `word-${i}`, 'good', at)
  return s
}

function roundTrip(store: Store, now = T1): Backup {
  const parsed = parseBackup(serializeBackup(createBackup(store, now)))
  if (!parsed.ok) throw new Error(parsed.message)
  return parsed.backup
}

describe('BACKUP_KEYS / allowlist', () => {
  it('trùng với allowlist đồng bộ', () => {
    expect([...BACKUP_KEYS]).toEqual(['progress', 'srs', 'sessions', 'savedWords', 'placement', 'pronunciation'])
  })

  it('không có key nào giống API key / token / PAT / secret / password', () => {
    for (const key of BACKUP_KEYS) {
      expect(key).not.toMatch(/key|token|secret|password|pass|pat$|^pat|auth|gist/i)
    }
  })

  it('mọi key đều là key chuẩn của store.data (có sau khi migrate từ v1)', () => {
    const migrated = runMigrations(createDefaultStore(1), CURRENT_VERSION, migrations)
    for (const key of BACKUP_KEYS) expect(Object.keys(migrated.data)).toContain(key)
  })
})

describe('createBackup — xuất', () => {
  it('chỉ có key trong allowlist, không có geminiApiKey kể cả khi store có', () => {
    let s = studied(2, 3)
    s = recordSession(s, 'full', T0)
    s = saveWord(s, { word: 'meeting', sentence: 'The meeting starts now.', source: { title: 'VOA', url: 'https://x' } }, T0)
    s = { ...s, data: { ...s.data, geminiApiKey: 'AIza-secret', token: 'abc', githubPat: 'ghp_x' } }
    const backup = createBackup(s, T1)
    const json = serializeBackup(backup)
    expect(backup).toMatchObject({ app: 'lumos-english', kind: 'backup', schemaVersion: CURRENT_VERSION, exportedAt: T1.toISOString() })
    expect(Object.keys(backup.data).sort()).toEqual(['progress', 'savedWords', 'sessions', 'srs'])
    expect(json).not.toContain('AIza-secret')
    expect(json).not.toContain('geminiApiKey')
    expect(json).not.toContain('ghp_x')
  })

  it('không sửa store gốc khi đổi file', () => {
    const s = studied(1, 0)
    const backup = createBackup(s, T1)
    ;(backup.data.progress as { lessons: Record<string, unknown> }).lessons.x = { done: true }
    expect(readCompletedLessonIds(s)).toEqual(['lesson-0'])
  })

  it('tên file theo ngày giờ máy', () => {
    expect(backupFileName(new Date(2026, 0, 5, 23, 59))).toBe('lumos-english-backup-2026-01-05.json')
  })
})

describe('restoreBackup — I/O Matrix', () => {
  it('khôi phục máy trống: đúng 5 bài, 20 thẻ', () => {
    const backup = roundTrip(studied(5, 20))
    const r = restoreBackup(empty(), backup)
    expect(readCompletedLessonIds(r.store)).toHaveLength(5)
    expect(Object.keys(readSrs(r.store).cards)).toHaveLength(20)
    expect(r.added).toBe(25)
    expect(r.updated).toBe(0)
  })

  it('gộp: cùng thẻ X, file cũ hơn → giữ bản máy; thẻ chỉ có trong file được thêm', () => {
    let fileStore = gradeCard(empty(), 'x', 'again', T0)
    fileStore = gradeCard(fileStore, 'y', 'good', T0)
    const backup = roundTrip(fileStore)
    const machine = gradeCard(empty(), 'x', 'easy', T2)
    const before = readSrs(machine).cards.x
    const r = restoreBackup(machine, backup)
    expect(readSrs(r.store).cards.x).toEqual(before)
    expect(readSrs(r.store).cards.y).toEqual(readSrs(fileStore).cards.y)
    expect(r).toMatchObject({ added: 1, updated: 0 })
  })

  it('file mới hơn máy → cập nhật mục đó', () => {
    const machine = gradeCard(empty(), 'x', 'again', T0)
    const fileStore = gradeCard(empty(), 'x', 'easy', T2)
    const r = restoreBackup(machine, roundTrip(fileStore, T2))
    expect(readSrs(r.store).cards.x).toEqual(readSrs(fileStore).cards.x)
    expect(r).toMatchObject({ added: 0, updated: 1 })
  })

  it('bỏ đánh dấu sau ngày xuất file không sống lại', () => {
    const atExport = setLessonCompleted(empty(), 'a', true, T0)
    const backup = roundTrip(atExport, T1)
    const machine = setLessonCompleted(atExport, 'a', false, T2)
    const r = restoreBackup(machine, backup)
    expect(readCompletedLessonIds(r.store)).toEqual([])
    expect(r.store).toBe(machine)
    expect(r).toMatchObject({ added: 0, updated: 0 })
  })

  it('giữ key ngoài allowlist trên máy; bỏ key lạ trong file', () => {
    const machine: Store = { ...empty(), data: { geminiApiKey: 'mine' } }
    const backup = roundTrip(studied(1, 0))
    backup.data.token = 'evil'
    const r = restoreBackup(machine, backup)
    expect(r.store.data.geminiApiKey).toBe('mine')
    expect(r.store.data.token).toBeUndefined()
  })

  it('khôi phục lại cùng file lần hai không đổi gì', () => {
    const backup = roundTrip(studied(3, 4))
    const once = restoreBackup(empty(), backup).store
    const twice = restoreBackup(once, backup)
    expect(twice.store).toBe(once)
    expect(twice).toMatchObject({ added: 0, updated: 0 })
  })

  it('nhật ký ngày học và từ đã lưu cũng được gộp', () => {
    let s = recordSession(empty(), 'lazy', T0)
    s = saveWord(s, { word: 'deadline', sentence: 'The deadline is Friday.', source: { title: 'HN', url: 'https://y' } }, T0)
    const r = restoreBackup(empty(), roundTrip(s))
    expect(Object.keys(readSessionDays(r.store))).toHaveLength(1)
    expect(Object.keys(readSavedWords(r.store))).toHaveLength(1)
  })
})

describe('parseBackup — kiểm file', () => {
  const valid = (overrides: Record<string, unknown> = {}) =>
    JSON.stringify({ ...createBackup(studied(1, 1), T1), ...overrides })

  it('file hợp lệ → ok', () => {
    const r = parseBackup(valid())
    expect(r.ok).toBe(true)
  })

  it.each([
    ['JSON hỏng', '{ not json'],
    ['trống', '   '],
    ['không phải object', '[1,2]'],
    ['không phải backup của app', JSON.stringify({ app: 'other', kind: 'backup', schemaVersion: 1, exportedAt: T1.toISOString(), data: {} })],
    ['thiếu kind', JSON.stringify({ app: 'lumos-english', schemaVersion: 1, exportedAt: T1.toISOString(), data: {} })],
    ['schemaVersion sai', JSON.stringify({ app: 'lumos-english', kind: 'backup', schemaVersion: '7', exportedAt: T1.toISOString(), data: {} })],
    ['data sai dạng', JSON.stringify({ app: 'lumos-english', kind: 'backup', schemaVersion: 7, exportedAt: T1.toISOString(), data: [] })],
    ['exportedAt sai', JSON.stringify({ app: 'lumos-english', kind: 'backup', schemaVersion: 7, exportedAt: 'hôm qua', data: {} })],
  ])('%s → báo lỗi tiếng Việt', (_, text) => {
    const r = parseBackup(text)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message.length).toBeGreaterThan(0)
  })

  it('quá 5 MB → báo lỗi', () => {
    const big = valid({ padding: 'x'.repeat(MAX_BACKUP_BYTES) })
    const r = parseBackup(big)
    expect(r).toEqual({ ok: false, message: expect.stringContaining('5 MB') })
  })

  it('file mới hơn app → từ chối, báo cần cập nhật app', () => {
    const r = parseBackup(valid({ schemaVersion: CURRENT_VERSION + 1 }))
    expect(r).toEqual({ ok: false, message: expect.stringContaining('cập nhật app') })
  })

  it('key lạ trong file (token) bị bỏ qua', () => {
    const text = JSON.stringify({ ...createBackup(studied(1, 0), T1), data: { ...createBackup(studied(1, 0), T1).data, token: 't' } })
    const r = parseBackup(text)
    expect(r.ok && Object.keys(r.backup.data)).toEqual(['progress'])
  })

  it('file cũ (v2, completedLessonIds) → migrate rồi gộp', () => {
    const text = JSON.stringify({
      app: 'lumos-english',
      kind: 'backup',
      schemaVersion: 2,
      exportedAt: T0.toISOString(),
      data: { progress: { completedLessonIds: ['a', 'b'] }, geminiApiKey: 'x' },
    })
    const r = parseBackup(text)
    if (!r.ok) throw new Error(r.message)
    expect(r.backup.schemaVersion).toBe(CURRENT_VERSION)
    expect(r.backup.data.geminiApiKey).toBeUndefined()
    const restored = restoreBackup(empty(), r.backup)
    expect([...readCompletedLessonIds(restored.store)].sort()).toEqual(['a', 'b'])
    // Bài máy đã bỏ đánh dấu thật thắng mốc cũ của file v2.
    const machine = setLessonCompleted(setLessonCompleted(empty(), 'a', true, T0), 'a', false, T1)
    expect(readCompletedLessonIds(restoreBackup(machine, r.backup).store)).toEqual(['b'])
  })

  it('migrate lỗi → báo lỗi, không trả backup', () => {
    const text = valid({ schemaVersion: 1 })
    const r = parseBackup(text, {
      migrations: {
        ...migrations,
        3: () => {
          throw new Error('boom')
        },
      },
    })
    expect(r).toEqual({ ok: false, message: expect.stringContaining('Không nâng cấp') })
  })
})

describe('parseBackup — làm sạch nội dung file', () => {
  const envelope = (data: unknown, schemaVersion = CURRENT_VERSION) =>
    JSON.stringify({ app: 'lumos-english', kind: 'backup', schemaVersion, exportedAt: T1.toISOString(), data })

  it('bỏ key allowlist không phải object và mục sai dạng; số đếm khớp tóm tắt', () => {
    const good = createBackup(studied(2, 3), T1).data
    const srs = good.srs as { cards: Record<string, unknown> }
    const r = parseBackup(envelope({ ...good, progress: 'x', sessions: null, srs: { cards: { ...srs.cards, junk: 'x' } } }))
    if (!r.ok) throw new Error(r.message)
    expect(Object.keys(r.backup.data).sort()).toEqual(['srs'])
    expect(Object.keys((r.backup.data.srs as { cards: object }).cards)).toHaveLength(3)
    const restored = restoreBackup(empty(), r.backup)
    const summary = summarizeBackup(r.backup)
    expect(restored.added).toBe(summary.cards + summary.lessonsDone + summary.studyDays)
    expect(restored.store.data.progress).toBeUndefined()
  })

  it('map sai dạng (lessons là chuỗi) → coi như rỗng', () => {
    const r = parseBackup(envelope({ progress: { lessons: 'x' } }))
    expect(r.ok && r.backup.data.progress).toEqual({ lessons: {} })
  })

  it('bỏ id __proto__ / constructor / prototype', () => {
    const lesson = { done: true, updatedAt: T0.toISOString() }
    const text = envelope({}).replace(
      '"data":{}',
      `"data":{"progress":{"lessons":{"__proto__":${JSON.stringify(lesson)},"constructor":${JSON.stringify(lesson)},"prototype":${JSON.stringify(lesson)},"ok":${JSON.stringify(lesson)}}}}`,
    )
    const r = parseBackup(text)
    if (!r.ok) throw new Error(r.message)
    const restored = restoreBackup(empty(), r.backup)
    const lessons = (restored.store.data.progress as { lessons: Record<string, unknown> }).lessons
    expect(Object.keys(lessons)).toEqual(['ok'])
    expect(Object.getPrototypeOf(lessons)).toBe(Object.prototype)
    expect(readCompletedLessonIds(restored.store)).toEqual(['ok'])
    expect(restored.added).toBe(1)
  })

  it('migrate chạy trên toàn bộ data của file trước khi lọc allowlist', () => {
    const r = parseBackup(envelope({ oldDone: ['a'] }, 1), {
      currentVersion: 2,
      migrations: {
        1: (st) => ({
          schemaVersion: 2,
          data: {
            progress: {
              lessons: Object.fromEntries(
                (st.data.oldDone as string[]).map((id) => [id, { done: true, updatedAt: T0.toISOString() }]),
              ),
            },
          },
        }),
      },
    })
    if (!r.ok) throw new Error(r.message)
    expect(r.backup.data).toEqual({ progress: { lessons: { a: { done: true, updatedAt: T0.toISOString() } } } })
  })
})

describe('restoreBackup — field ngoài map (Mũ Phân Loại)', () => {
  const placement = (house: string | null, startLessonId: string | null, at: Date) => ({
    placement: { attempts: {}, house, startLessonId, updatedAt: at.toISOString() },
  })

  it('file mới hơn: nhận Nhà và bài bắt đầu, updated = 1', () => {
    const machine: Store = { ...empty(), data: placement(null, null, T0) }
    const file = roundTrip({ ...empty(), data: placement('gryffindor', 's1-t1-w2', T2) }, T2)
    const r = restoreBackup(machine, file)
    expect(r.store.data.placement).toMatchObject({ house: 'gryffindor', startLessonId: 's1-t1-w2' })
    expect(r).toMatchObject({ added: 0, updated: 1 })
  })

  it('máy trống: added = 1', () => {
    const file = roundTrip({ ...empty(), data: placement('gryffindor', 's1-t1-w2', T2) }, T2)
    const r = restoreBackup(empty(), file)
    expect(r.store.data.placement).toMatchObject({ house: 'gryffindor' })
    expect(r).toMatchObject({ added: 1, updated: 0 })
  })
})

describe('summarizeBackup', () => {
  it('đếm bài xong, thẻ, ngày học, từ đã lưu (bỏ mục sai dạng)', () => {
    let s = studied(5, 20)
    s = setLessonCompleted(s, 'lesson-0', false, T1)
    s = recordSession(s, 'full', T0)
    s = recordSession(s, 'lazy', T1)
    s = saveWord(s, { word: 'agenda', sentence: 'Check the agenda.', source: { title: 'VOA', url: 'https://z' } }, T0)
    const backup = roundTrip(s, T2)
    ;(backup.data.srs as { cards: Record<string, unknown> }).cards.junk = 'x'
    expect(summarizeBackup(backup)).toEqual({
      exportedAt: T2.toISOString(),
      lessonsDone: 4,
      cards: 20,
      studyDays: 2,
      savedWords: 1,
      placementAttempts: 0,
      pronunciationItems: 0,
    })
  })
})

describe('shareOrDownload', () => {
  function fakeDocument() {
    const link = { href: '', download: '', rel: '', style: {} as Record<string, string>, click: vi.fn(), remove: vi.fn() }
    const doc = { createElement: vi.fn(() => link), body: { appendChild: vi.fn() } } as unknown as Document
    return { doc, link }
  }

  it('có share file → mở bảng chia sẻ', async () => {
    const share = vi.fn(async () => {})
    const { doc, link } = fakeDocument()
    const r = await shareOrDownload('a.json', '{}', { navigator: { canShare: () => true, share }, document: doc })
    expect(r).toBe('shared')
    expect(share).toHaveBeenCalledOnce()
    expect(link.click).not.toHaveBeenCalled()
  })

  it('không hỗ trợ share file → tải qua link download', async () => {
    vi.useFakeTimers()
    const { doc, link } = fakeDocument()
    const revoke = vi.fn()
    const r = await shareOrDownload('b.json', '{}', {
      navigator: { canShare: () => false, share: vi.fn() },
      document: doc,
      createObjectURL: () => 'blob:1',
      revokeObjectURL: revoke,
    })
    expect(r).toBe('downloaded')
    expect(link).toMatchObject({ href: 'blob:1', download: 'b.json' })
    expect(link.click).toHaveBeenCalledOnce()
    vi.runAllTimers()
    expect(revoke).toHaveBeenCalledWith('blob:1')
    vi.useRealTimers()
  })

  it('không có navigator.share → tải qua link', async () => {
    const { doc, link } = fakeDocument()
    const r = await shareOrDownload('c.json', '{}', { navigator: null, document: doc, createObjectURL: () => 'blob:2', revokeObjectURL: () => {} })
    expect(r).toBe('downloaded')
    expect(link.click).toHaveBeenCalledOnce()
  })

  it('share lỗi khác (NotAllowedError) → thử link download, trả về fallback', async () => {
    const { doc, link } = fakeDocument()
    const denied = Object.assign(new Error('denied'), { name: 'NotAllowedError' })
    const r = await shareOrDownload('e.json', '{}', {
      navigator: { canShare: () => true, share: async () => Promise.reject(denied) },
      document: doc,
      createObjectURL: () => 'blob:3',
      revokeObjectURL: () => {},
    })
    expect(r).toBe('fallback')
    expect(link.click).toHaveBeenCalledOnce()
  })

  it('người dùng đóng bảng chia sẻ → cancelled, không tải, không lỗi', async () => {
    const { doc, link } = fakeDocument()
    const abort = Object.assign(new Error('cancel'), { name: 'AbortError' })
    const r = await shareOrDownload('d.json', '{}', {
      navigator: { canShare: () => true, share: async () => Promise.reject(abort) },
      document: doc,
    })
    expect(r).toBe('cancelled')
    expect(link.click).not.toHaveBeenCalled()
  })
})
