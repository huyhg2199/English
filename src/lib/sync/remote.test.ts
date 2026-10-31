import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { createSupabaseRemote, TABLE } from './remote'

type Result = { data: unknown; error: { code?: string; message: string } | null }
type Call = { method: string; args: unknown[] }

/**
 * Fake `client.from()` của supabase-js: ghi lại chuỗi gọi (`insert/update/select/eq/maybeSingle`)
 * và trả `result` khi được await. Bảng giả có một hàng mỗi user để `update` lọc theo `updated_at`.
 */
function fakeClient(rows: Map<string, { schema_version: number; data: unknown; updated_at: string }>) {
  const log: Array<{ table: string; calls: Call[] }> = []
  let nextStamp = 1
  const stamp = () => `2026-11-01T00:00:0${nextStamp++}.123456+00:00`
  const errors: { insert?: Result['error']; update?: Result['error']; select?: Result['error'] } = {}

  function from(table: string) {
    const calls: Call[] = []
    log.push({ table, calls })
    const filters: Record<string, unknown> = {}
    let op: 'select' | 'insert' | 'update' = 'select'
    let payload: Record<string, unknown> = {}

    function exec(): Result {
      const uid = filters.user_id as string | undefined
      if (op === 'select') {
        if (errors.select) return { data: null, error: errors.select }
        const row = uid ? rows.get(uid) : undefined
        return { data: row ? { ...row } : null, error: null }
      }
      if (op === 'insert') {
        if (errors.insert) return { data: null, error: errors.insert }
        const id = payload.user_id as string
        if (rows.has(id)) return { data: null, error: { code: '23505', message: 'duplicate key' } }
        // Trigger trên server đặt updated_at, bỏ qua giá trị client gửi (nếu có).
        const row = { schema_version: payload.schema_version as number, data: payload.data, updated_at: stamp() }
        rows.set(id, row)
        return { data: [{ updated_at: row.updated_at }], error: null }
      }
      if (errors.update) return { data: null, error: errors.update }
      const row = uid ? rows.get(uid) : undefined
      if (!row || ('updated_at' in filters && row.updated_at !== filters.updated_at)) return { data: [], error: null }
      const next = { schema_version: payload.schema_version as number, data: payload.data, updated_at: stamp() }
      rows.set(uid!, next)
      return { data: [{ updated_at: next.updated_at }], error: null }
    }

    const builder = {
      select(...args: unknown[]) {
        calls.push({ method: 'select', args })
        return builder
      },
      insert(value: Record<string, unknown>) {
        calls.push({ method: 'insert', args: [value] })
        op = 'insert'
        payload = value
        return builder
      },
      update(value: Record<string, unknown>) {
        calls.push({ method: 'update', args: [value] })
        op = 'update'
        payload = value
        return builder
      },
      eq(column: string, value: unknown) {
        calls.push({ method: 'eq', args: [column, value] })
        filters[column] = value
        return builder
      },
      maybeSingle() {
        calls.push({ method: 'maybeSingle', args: [] })
        return builder
      },
      then(resolve: (r: Result) => unknown, reject?: (e: unknown) => unknown) {
        try {
          const r = exec()
          return Promise.resolve(r).then(resolve, reject)
        } catch (e) {
          return Promise.reject(e).then(resolve, reject)
        }
      },
    }
    return builder
  }

  const client = { from } as unknown as Pick<SupabaseClient, 'from'>
  return { client, log, errors }
}

const row = { schemaVersion: 3, data: { progress: { lessons: {} } } }

describe('createSupabaseRemote', () => {
  it('fetch: map cột sang RemoteStore, lọc theo user_id', async () => {
    const rows = new Map([['u1', { schema_version: 3, data: { progress: {} }, updated_at: 'T0' }]])
    const { client, log } = fakeClient(rows)
    const remote = createSupabaseRemote(client)
    expect(await remote.fetch('u1')).toEqual({ schemaVersion: 3, data: { progress: {} }, updatedAt: 'T0' })
    expect(log[0].table).toBe(TABLE)
    expect(log[0].calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] })
    expect(log[0].calls.map((c) => c.method)).toContain('maybeSingle')
  })

  it('fetch: không có hàng → null', async () => {
    const { client } = fakeClient(new Map())
    expect(await createSupabaseRemote(client).fetch('u1')).toBeNull()
  })

  it('fetch: lỗi → ném', async () => {
    const { client, errors } = fakeClient(new Map())
    errors.select = { message: 'JWT expired', code: 'PGRST301' }
    await expect(createSupabaseRemote(client).fetch('u1')).rejects.toMatchObject({ message: 'JWT expired' })
  })

  it('insert: không gửi updated_at, trả updated_at do server đặt', async () => {
    const rows = new Map()
    const { client, log } = fakeClient(rows)
    const result = await createSupabaseRemote(client).insert('u1', row)
    expect(result).toEqual({ status: 'ok', updatedAt: rows.get('u1').updated_at })
    const insertCall = log[0].calls.find((c) => c.method === 'insert')!
    expect(insertCall.args[0]).toEqual({ user_id: 'u1', schema_version: 3, data: row.data })
    expect(log[0].calls).toContainEqual({ method: 'select', args: ['updated_at'] })
  })

  it('insert: lỗi 23505 (hàng đã có) → conflict', async () => {
    const rows = new Map([['u1', { schema_version: 3, data: {}, updated_at: 'T0' }]])
    const { client } = fakeClient(rows)
    expect(await createSupabaseRemote(client).insert('u1', row)).toEqual({ status: 'conflict' })
  })

  it('insert: lỗi khác → ném', async () => {
    const { client, errors } = fakeClient(new Map())
    errors.insert = { code: '42501', message: 'new row violates row-level security policy' }
    await expect(createSupabaseRemote(client).insert('u1', row)).rejects.toMatchObject({ code: '42501' })
  })

  it('update: lọc user_id và updated_at = expected, không gửi updated_at, trả updated_at mới', async () => {
    const rows = new Map([['u1', { schema_version: 2, data: {}, updated_at: 'T0' }]])
    const { client, log } = fakeClient(rows)
    const result = await createSupabaseRemote(client).update('u1', row, 'T0')
    expect(result).toEqual({ status: 'ok', updatedAt: rows.get('u1')!.updated_at })
    expect(rows.get('u1')!.updated_at).not.toBe('T0')
    const calls = log[0].calls
    expect(calls.find((c) => c.method === 'update')!.args[0]).toEqual({ schema_version: 3, data: row.data })
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] })
    expect(calls).toContainEqual({ method: 'eq', args: ['updated_at', 'T0'] })
  })

  it('update: 0 hàng khớp (máy khác vừa ghi) → conflict, không ghi', async () => {
    const rows = new Map([['u1', { schema_version: 3, data: { x: 1 }, updated_at: 'T-new' }]])
    const { client } = fakeClient(rows)
    expect(await createSupabaseRemote(client).update('u1', row, 'T-old')).toEqual({ status: 'conflict' })
    expect(rows.get('u1')!.data).toEqual({ x: 1 })
  })

  it('update: lỗi → ném', async () => {
    const rows = new Map([['u1', { schema_version: 3, data: {}, updated_at: 'T0' }]])
    const { client, errors } = fakeClient(rows)
    errors.update = { message: 'Failed to fetch' }
    await expect(createSupabaseRemote(client).update('u1', row, 'T0')).rejects.toMatchObject({
      message: 'Failed to fetch',
    })
  })
})
