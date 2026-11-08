import { describe, expect, it } from 'vitest'

import { createBackup, restoreBackup, serializeBackup } from '@/lib/backup'
import { recordSession } from '@/lib/sessions'
import { CURRENT_VERSION, type LoadedStore, type Store } from '@/lib/storage'

import {
  AUTO_WRITE_INTERVAL_MS,
  createGist,
  createGistWriter,
  GIST_BACKUP_FILE,
  GIST_ID_STORAGE,
  GIST_LAST_WRITE_STORAGE,
  GIST_STATUS_FILE,
  GIST_TOKEN_STORAGE,
  gistFiles,
  localDataBlocked,
  gistFingerprint,
  keepStudied,
  parseRemoteBackup,
  readGist,
  readGistId,
  readGistToken,
  shouldAutoWrite,
  statusFor,
  writeGist,
} from './index'

const GIST_ID = 'aa11bb22cc33dd44ee55'
const PAT = 'ghp_testtoken123'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  }
}

const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
const local = (h: number, m = 0, day = 2) => new Date(2026, 10, day, h, m)

type Call = { url: string; init?: RequestInit }

function fakeFetch(handler: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = []
  const fetch = async (url: string, init?: RequestInit) => {
    const call = { url, init }
    calls.push(call)
    return handler(call)
  }
  return { fetch, calls }
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status })

describe('status.json', () => {
  /** Mục nhật ký dựng tay (key ngày theo giờ máy tuỳ ý) để test không phụ thuộc múi giờ máy chạy test. */
  const day = (completedAt: string, kind: 'full' | 'lazy' = 'full') => ({ kind, completedAt, minutes: 25, updatedAt: completedAt })
  const withDays = (days: Record<string, unknown>): Store => ({ ...empty(), data: { sessions: { days } } })

  it('xong buổi hôm nay → studied true, kind, streak; chỉ có 5 field', () => {
    // Mốc tuyệt đối (giờ VN = UTC+7) để không phụ thuộc múi giờ máy chạy test (CI chạy UTC):
    // buổi full 20:00 VN ngày 1/11, buổi lười 09:00 VN ngày 2/11, kiểm lúc 10:00 VN ngày 2/11.
    let s = recordSession(empty(), 'full', new Date('2026-11-01T13:00:00Z'))
    s = recordSession(s, 'lazy', new Date('2026-11-02T02:00:00Z'))
    const now = new Date('2026-11-02T03:00:00Z')
    expect(statusFor(s, now)).toEqual({ date: '2026-11-02', studied: true, kind: 'lazy', streak: 2, updatedAt: now.toISOString() })
    expect(Object.keys(statusFor(s, now)).sort()).toEqual(['date', 'kind', 'streak', 'studied', 'updatedAt'])
  })

  it('chưa học hôm nay → studied false, kind null', () => {
    expect(statusFor(empty(), new Date('2026-11-02T06:00:00Z'))).toMatchObject({ date: '2026-11-02', studied: false, kind: null })
  })

  it('máy đặt giờ UTC học lúc 23:30 VN: date là ngày VN đó, studied true (khớp cron)', () => {
    // 23:30 VN ngày 02 = 16:30Z ngày 02; máy UTC ghi key ngày 02.
    const s = withDays({ '2026-11-02': day('2026-11-02T16:30:00.000Z') })
    expect(statusFor(s, new Date('2026-11-02T16:31:00Z'))).toMatchObject({ date: '2026-11-02', studied: true, kind: 'full' })
    // 00:30 VN ngày 03 = 17:30Z ngày 02: máy UTC vẫn ghi key ngày 02, nhưng ngày VN là 03.
    const late = withDays({ '2026-11-02': day('2026-11-02T17:30:00.000Z', 'lazy') })
    expect(statusFor(late, new Date('2026-11-02T17:31:00Z'))).toMatchObject({ date: '2026-11-03', studied: true, kind: 'lazy' })
    // Học ngày VN hôm trước thì hôm nay VN chưa học.
    expect(statusFor(s, new Date('2026-11-02T17:01:00Z'))).toMatchObject({ date: '2026-11-03', studied: false })
  })

  it('keepStudied: không hạ studied true đã có trên Gist cùng ngày VN; khác ngày thì không giữ', () => {
    const local0 = statusFor(empty(), new Date('2026-11-02T06:00:00Z'))
    const remote = JSON.stringify({ date: '2026-11-02', studied: true, kind: 'full', streak: 4, updatedAt: 'x' })
    expect(keepStudied(local0, remote)).toMatchObject({ studied: true, kind: 'full', streak: 4 })
    expect(keepStudied(local0, remote.replace('2026-11-02', '2026-11-01'))).toBe(local0)
    expect(keepStudied(local0, 'hỏng')).toBe(local0)
    expect(keepStudied(local0, undefined)).toBe(local0)
  })
})

describe('file trên Gist', () => {
  it('lumos-backup.json đúng định dạng backup story 7, chỉ key allowlist (không key lạ / API key)', () => {
    const s: Store = { ...empty(), data: { progress: { lessons: {} }, geminiApiKey: 'AIza-secret', token: 'x', weird: 1 } }
    const now = local(10)
    const files = gistFiles(s, now)
    expect(Object.keys(files).sort()).toEqual([GIST_BACKUP_FILE, GIST_STATUS_FILE].sort())
    expect(files[GIST_BACKUP_FILE]).toBe(serializeBackup(createBackup(s, now)))
    const backup = JSON.parse(files[GIST_BACKUP_FILE])
    expect(Object.keys(backup.data)).toEqual(['progress'])
    expect(files[GIST_BACKUP_FILE]).not.toContain('AIza-secret')
  })

  it('dấu vân tay đổi khi dữ liệu học đổi, không đổi theo thời điểm ghi trong ngày', () => {
    const s = empty()
    expect(gistFingerprint(s, local(10))).toBe(gistFingerprint(s, local(11)))
    expect(gistFingerprint(recordSession(s, 'lazy', local(10)), local(11))).not.toBe(gistFingerprint(s, local(11)))
    // Key ngoài allowlist không tính.
    expect(gistFingerprint({ ...s, data: { geminiApiKey: 'x' } }, local(10))).toBe(gistFingerprint(s, local(10)))
  })
})

describe('shouldAutoWrite', () => {
  const now = new Date('2026-11-02T10:00:00Z')
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()
  it('dữ liệu đổi và lần trước > 10 phút (hoặc chưa ghi) → ghi', () => {
    expect(shouldAutoWrite(null, true, now)).toBe(true)
    expect(shouldAutoWrite(ago(AUTO_WRITE_INTERVAL_MS), true, now)).toBe(true)
    expect(shouldAutoWrite('hỏng', true, now)).toBe(true)
    // Đồng hồ máy chạy lùi.
    expect(shouldAutoWrite(ago(-60_000), true, now)).toBe(true)
  })
  it('lần trước < 10 phút hoặc không đổi → không ghi', () => {
    expect(shouldAutoWrite(ago(AUTO_WRITE_INTERVAL_MS - 1), true, now)).toBe(false)
    expect(shouldAutoWrite(null, false, now)).toBe(false)
  })
})

describe('GitHub REST', () => {
  const files = gistFiles(empty(), local(10))

  it('createGist: POST /gists secret (public false), Bearer PAT, trả id', async () => {
    const f = fakeFetch(() => json(201, { id: GIST_ID }))
    const r = await createGist({ fetch: f.fetch, token: PAT }, files)
    expect(r).toEqual({ ok: true, id: GIST_ID })
    expect(f.calls[0].url).toBe('https://api.github.com/gists')
    expect(f.calls[0].init?.method).toBe('POST')
    expect((f.calls[0].init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${PAT}`)
    const body = JSON.parse(String(f.calls[0].init?.body))
    expect(body.public).toBe(false)
    expect(Object.keys(body.files).sort()).toEqual([GIST_BACKUP_FILE, GIST_STATUS_FILE].sort())
    expect(String(f.calls[0].init?.body)).not.toContain(PAT)
  })

  it('lỗi: 401 → unauthorized, 404 → not-found, 403 hết quota → rate-limited, mạng → network', async () => {
    const deps = (res: () => Response) => ({ fetch: fakeFetch(res).fetch, token: PAT })
    expect(await createGist(deps(() => json(401, {})), files)).toEqual({ ok: false, error: { kind: 'unauthorized', status: 401 } })
    expect(await writeGist(deps(() => json(404, {})), GIST_ID, files)).toMatchObject({ ok: false, error: { kind: 'not-found' } })
    const limited = () => new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0' } })
    expect(await readGist(deps(limited), GIST_ID)).toMatchObject({ ok: false, error: { kind: 'rate-limited' } })
    const down = { fetch: () => Promise.reject(new Error('offline')), token: PAT }
    expect(await writeGist(down, GIST_ID, files)).toEqual({ ok: false, error: { kind: 'network' } })
  })

  it('writeGist: PATCH /gists/{id}; readGist: GET, file bị cắt thì tải raw_url không kèm PAT', async () => {
    const f = fakeFetch(({ url }) => {
      if (url.startsWith('https://gist.githubusercontent.com/')) return new Response('FULL')
      return json(200, {
        files: {
          [GIST_STATUS_FILE]: { content: '{"a":1}' },
          [GIST_BACKUP_FILE]: { content: 'cut', truncated: true, raw_url: 'https://gist.githubusercontent.com/raw/x' },
        },
      })
    })
    expect(await writeGist({ fetch: f.fetch, token: PAT }, GIST_ID, files)).toEqual({ ok: true })
    expect(f.calls[0]).toMatchObject({ url: `https://api.github.com/gists/${GIST_ID}`, init: { method: 'PATCH' } })
    const r = await readGist({ fetch: f.fetch, token: PAT }, GIST_ID)
    expect(r).toEqual({ ok: true, owner: null, files: { [GIST_STATUS_FILE]: '{"a":1}', [GIST_BACKUP_FILE]: 'FULL' } })
    expect(f.calls[2].init?.headers).toBeUndefined()
  })
})

describe('parseRemoteBackup', () => {
  it('không có file → null; hỏng → remote-unreadable; app mới hơn → remote-newer', () => {
    expect(parseRemoteBackup(undefined)).toEqual({ ok: true, backup: null })
    expect(parseRemoteBackup(serializeBackup(createBackup(empty(), local(9))))).toMatchObject({ ok: true })
    expect(parseRemoteBackup('{hỏng')).toEqual({ ok: false, error: { kind: 'remote-unreadable' } })
    const newer = serializeBackup({ ...createBackup(empty(), local(9)), schemaVersion: CURRENT_VERSION + 1 })
    expect(parseRemoteBackup(newer)).toEqual({ ok: false, error: { kind: 'remote-newer' } })
  })
})

describe('createGistWriter', () => {
  const OWNER = 'huy'
  type Remote = { backup?: string; status?: string; owner?: string; scopes?: string | null; login?: string; fail?: number }

  /** GitHub giả: giữ nội dung gist, áp PATCH, trả /user. */
  function github(remote: Remote = {}) {
    const gist: Record<string, string> = {}
    if (remote.backup !== undefined) gist[GIST_BACKUP_FILE] = remote.backup
    if (remote.status !== undefined) gist[GIST_STATUS_FILE] = remote.status
    return {
      gist,
      handler: ({ url, init }: Call): Response => {
        if (remote.fail) return json(remote.fail, {})
        const method = init?.method ?? 'GET'
        if (url.endsWith('/user')) {
          const headers = remote.scopes === null ? undefined : { 'x-oauth-scopes': remote.scopes ?? 'gist' }
          return new Response(JSON.stringify({ login: remote.login ?? OWNER }), { status: 200, headers })
        }
        if (method === 'POST') return json(201, { id: GIST_ID })
        if (method === 'PATCH') {
          const files = JSON.parse(String(init?.body)).files as Record<string, { content: string }>
          for (const [name, f] of Object.entries(files)) gist[name] = f.content
          return json(200, {})
        }
        return json(200, {
          owner: { login: remote.owner ?? OWNER },
          files: Object.fromEntries(Object.entries(gist).map(([n, content]) => [n, { content }])),
        })
      },
    }
  }

  function setup(opts: { connected?: boolean; status?: LoadedStore['status']; mode?: LoadedStore['mode']; remote?: Remote; handler?: (c: Call) => Response } = {}) {
    const storage = memoryStorage()
    if (opts.connected) {
      storage.setItem(GIST_TOKEN_STORAGE, PAT)
      storage.setItem(GIST_ID_STORAGE, GIST_ID)
    }
    let store = empty()
    let clock = local(10)
    const gh = github(opts.remote)
    const f = fakeFetch(opts.handler ?? gh.handler)
    let hidden: (() => void) | null = null
    const writer = createGistWriter({
      getLoaded: () => ({ store, mode: opts.mode ?? 'persistent', status: opts.status ?? 'ok' }),
      fetch: f.fetch,
      storage,
      now: () => clock,
      merge: (backup) => {
        const r = restoreBackup(store, backup)
        store = r.store
        return { added: r.added, updated: r.updated }
      },
      onHidden: (cb) => {
        hidden = cb
        return () => {
          hidden = null
        }
      },
    })
    return {
      writer,
      storage,
      gist: gh.gist,
      calls: f.calls,
      methods: () => f.calls.map((c) => `${c.init?.method ?? 'GET'} ${c.url.replace('https://api.github.com', '')}`),
      patches: () => f.calls.filter((c) => c.init?.method === 'PATCH'),
      getStore: () => store,
      setStore: (s: Store) => (store = s),
      tick: (ms: number) => (clock = new Date(clock.getTime() + ms)),
      hide: () => hidden?.(),
    }
  }

  const backupOf = (s: Store) => serializeBackup(createBackup(s, local(8)))

  it('không có PAT → không gọi mạng', async () => {
    const t = setup()
    await t.writer.writeNow()
    await t.writer.autoWrite()
    expect(t.calls).toHaveLength(0)
    expect(t.writer.getState().phase).toBe('off')
  })

  it('lần đầu nhập PAT → tạo secret gist, lưu PAT + gist id (ngoài store)', async () => {
    const t = setup()
    const r = await t.writer.connect(`  ${PAT} `)
    expect(r).toMatchObject({ ok: true, gistId: GIST_ID, created: true })
    expect(readGistToken(t.storage)).toBe(PAT)
    expect(readGistId(t.storage)).toBe(GIST_ID)
    expect(t.writer.getState()).toMatchObject({ phase: 'idle', gistId: GIST_ID })
  })

  it('PAT sai (401) → báo lỗi, không lưu gì', async () => {
    const t = setup({ handler: () => json(401, {}) })
    const r = await t.writer.connect('bad')
    expect(r).toEqual({ ok: false, error: { kind: 'unauthorized', status: 401 } })
    expect(t.storage.map.size).toBe(0)
  })

  it('nối gist có sẵn: kiểm quyền ghi, gộp bản sao về trước rồi mới lưu PAT và ghi', async () => {
    const other = recordSession(empty(), 'full', local(8, 0, 1))
    const t = setup({ remote: { backup: backupOf(other) } })
    const r = await t.writer.connect(PAT, GIST_ID)
    expect(r).toMatchObject({ ok: true, created: false, merged: { added: 1 } })
    expect(t.methods()).toEqual([`GET /gists/${GIST_ID}`, 'GET /user', `GET /gists/${GIST_ID}`, `PATCH /gists/${GIST_ID}`])
    expect(readGistId(t.storage)).toBe(GIST_ID)
    expect(Object.keys(JSON.parse(t.gist[GIST_BACKUP_FILE]).data.sessions.days)).toHaveLength(1)
    expect((await t.writer.connect(PAT, 'not/an-id')).ok).toBe(false)
  })

  it.each([
    ['bản sao hỏng', { backup: '{hỏng' }, 'remote-unreadable'],
    ['bản sao do app mới hơn ghi', { backup: JSON.stringify({ ...createBackup(empty(), local(8)), schemaVersion: CURRENT_VERSION + 1 }) }, 'remote-newer'],
    ['PAT của tài khoản khác', { login: 'someone-else' }, 'wrong-owner'],
    ['PAT thiếu quyền gist', { scopes: 'repo' }, 'no-write'],
  ])('nối gist có sẵn: %s → từ chối, không lưu PAT, không ghi', async (_, remote, kind) => {
    const t = setup({ remote: remote as Remote })
    const r = await t.writer.connect(PAT, GIST_ID)
    expect(r).toEqual({ ok: false, error: { kind } })
    expect(t.storage.map.size).toBe(0)
    expect(t.patches()).toHaveLength(0)
  })

  it('đang kết nối (chưa gộp xong) thì lần ghi khi xuống nền không chạy', async () => {
    let release: () => void = () => {}
    const gate = new Promise<void>((r) => (release = r))
    const gh = github({ backup: backupOf(empty()) })
    const t = setup({
      handler: (c) => {
        if (c.url.endsWith('/user')) return gate.then(() => gh.handler(c)) as unknown as Response
        return gh.handler(c)
      },
    })
    const connecting = t.writer.connect(PAT, GIST_ID)
    await new Promise((r) => setTimeout(r, 0))
    // PAT chưa lưu nên chưa có gì để ghi; lưu tay để chắc là cờ `connecting` chặn.
    t.storage.setItem(GIST_TOKEN_STORAGE, PAT)
    t.storage.setItem(GIST_ID_STORAGE, GIST_ID)
    await t.writer.writeNow()
    await t.writer.autoWrite()
    expect(t.patches()).toHaveLength(0)
    release()
    await connecting
    expect(t.patches()).toHaveLength(1)
  })

  it('trước mỗi lần ghi: đọc Gist, gộp dữ liệu máy khác về store, không mất dữ liệu của máy kia', async () => {
    const other = recordSession(empty(), 'full', local(8, 0, 1))
    const t = setup({ connected: true, remote: { backup: backupOf(other) } })
    t.setStore(recordSession(empty(), 'lazy', local(9)))
    await t.writer.writeNow()
    expect(t.methods()).toEqual([`GET /gists/${GIST_ID}`, `PATCH /gists/${GIST_ID}`])
    expect(Object.keys((t.getStore().data.sessions as { days: object }).days)).toHaveLength(2)
    expect(Object.keys(JSON.parse(t.gist[GIST_BACKUP_FILE]).data.sessions.days)).toHaveLength(2)
  })

  it('máy chưa thấy buổi hôm nay không hạ studied: true của máy khác (cùng ngày VN)', async () => {
    const remoteStatus = JSON.stringify({ date: '2026-11-02', studied: true, kind: 'full', streak: 3, updatedAt: local(9).toISOString() })
    const t = setup({ connected: true, remote: { status: remoteStatus } })
    await t.writer.writeNow()
    expect(JSON.parse(t.gist[GIST_STATUS_FILE])).toMatchObject({ date: '2026-11-02', studied: true, kind: 'full', streak: 3 })
  })

  it('bản sao trên Gist hỏng / do app mới hơn ghi → không ghi đè, trạng thái lỗi', async () => {
    const t = setup({ connected: true, remote: { backup: '{hỏng' } })
    await t.writer.writeNow()
    expect(t.patches()).toHaveLength(0)
    expect(t.writer.getState()).toMatchObject({ phase: 'error', error: { kind: 'remote-unreadable' } })
  })

  it('xong buổi (writeNow) → PATCH 2 file với status studied true', async () => {
    const t = setup({ connected: true })
    t.setStore(recordSession(empty(), 'full', local(9)))
    await t.writer.writeNow()
    expect(t.patches()).toHaveLength(1)
    expect(JSON.parse(t.gist[GIST_STATUS_FILE])).toMatchObject({ date: '2026-11-02', studied: true, kind: 'full' })
    expect(t.writer.getState()).toMatchObject({ phase: 'idle', writtenAt: local(10).toISOString() })
  })

  it('ghi lỗi → trạng thái error, lần sau thử lại', async () => {
    let fail = true
    const gh = github()
    const t = setup({ connected: true, handler: (c) => (fail ? json(500, {}) : gh.handler(c)) })
    await t.writer.writeNow()
    expect(t.writer.getState()).toMatchObject({ phase: 'error', error: { kind: 'http', status: 500 } })
    fail = false
    await t.writer.writeNow()
    expect(t.writer.getState()).toMatchObject({ phase: 'idle', error: null })
  })

  it('xuống nền: dữ liệu đổi và > 10 phút → ghi; < 10 phút hoặc không đổi → không', async () => {
    const t = setup({ connected: true })
    t.writer.start()
    await t.writer.writeNow()
    expect(t.patches()).toHaveLength(1)
    t.setStore(recordSession(empty(), 'lazy', local(10)))
    t.tick(5 * 60_000)
    await t.writer.autoWrite()
    expect(t.patches()).toHaveLength(1)
    t.tick(6 * 60_000)
    t.hide()
    await new Promise((r) => setTimeout(r, 0))
    expect(t.patches()).toHaveLength(2)
    t.tick(20 * 60_000)
    await t.writer.autoWrite()
    expect(t.patches()).toHaveLength(2)
  })

  it.each([
    ['hỏng', { status: 'corrupt' as const }],
    ['không nâng cấp được', { status: 'migration-failed' as const }],
    ['không có localStorage', { status: 'unavailable' as const }],
    ['do app mới hơn ghi (chỉ đọc)', { status: 'newer-version' as const, mode: 'read-only' as const }],
  ])('dữ liệu trên máy %s → localDataBlocked, không ghi đè bản sao trên Gist', async (_, o) => {
    const t = setup({ connected: true, ...o })
    expect(localDataBlocked({ store: empty(), mode: o.status === 'newer-version' ? 'read-only' : 'memory', status: o.status })).toBe(true)
    await t.writer.writeNow()
    await t.writer.autoWrite()
    expect(t.calls).toHaveLength(0)
  })

  it('readBackup: bản sao hợp lệ → backup; Gist lỗi → báo lỗi', async () => {
    const backup = backupOf(empty())
    let status = 200
    const t = setup({ connected: true, handler: () => json(status, { files: { [GIST_BACKUP_FILE]: { content: backup } } }) })
    expect(await t.writer.readBackup()).toMatchObject({ ok: true })
    status = 404
    expect(await t.writer.readBackup()).toMatchObject({ ok: false, error: { kind: 'not-found' } })
  })

  it('disconnect xoá PAT, gist id và mốc ghi khỏi máy', async () => {
    const t = setup({ connected: true })
    await t.writer.writeNow()
    expect(t.storage.map.has(GIST_LAST_WRITE_STORAGE)).toBe(true)
    t.writer.disconnect()
    expect(t.storage.map.size).toBe(0)
    expect(t.writer.getState().phase).toBe('off')
  })
})

describe('status.json — buổi Sân ga (lessonId f03, story 21)', () => {
  it('buổi full lessonId f03 → studied true, kind full, streak 1', () => {
    const s = recordSession(empty(), 'full', new Date('2026-11-02T02:00:00Z'), { lessonId: 'f03' })
    const now = new Date('2026-11-02T03:00:00Z')
    expect(statusFor(s, now)).toEqual({ date: '2026-11-02', studied: true, kind: 'full', streak: 1, updatedAt: now.toISOString() })
  })
})
