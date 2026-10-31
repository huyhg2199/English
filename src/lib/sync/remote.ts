import type { SupabaseClient } from '@supabase/supabase-js'

import type { RemoteStore } from './merge'

export const TABLE = 'user_store'

export type RemoteWrite = { schemaVersion: number; data: Record<string, unknown> }
/** Ghi xong thì trả `updated_at` do server đặt (trigger), dùng làm điều kiện CAS cho lần ghi sau. */
export type WriteResult = { status: 'ok'; updatedAt: string } | { status: 'conflict' }

/**
 * Lớp đọc/ghi bảng `user_store` (một hàng mỗi user). Engine chỉ biết interface này,
 * test thay bằng bản giả. Lỗi mạng/HTTP thì ném.
 * `updated_at` luôn do server đặt; client không bao giờ ghi giờ máy mình vào cột này.
 */
export type SyncRemote = {
  fetch(userId: string): Promise<RemoteStore | null>
  /** Tạo hàng mới; hàng đã có (máy khác vừa tạo) → `conflict`. */
  insert(userId: string, row: RemoteWrite): Promise<WriteResult>
  /** Ghi đè khi hàng vẫn là bản đã đọc (`updated_at` khớp giá trị server trả về); máy khác vừa ghi → `conflict`. */
  update(userId: string, row: RemoteWrite, expectedUpdatedAt: string): Promise<WriteResult>
}

type Row = { schema_version: number; data: Record<string, unknown>; updated_at: string }

export function createSupabaseRemote(client: Pick<SupabaseClient, 'from'>): SyncRemote {
  const table = () => client.from(TABLE)
  return {
    async fetch(userId) {
      const { data, error } = await table()
        .select('schema_version, data, updated_at')
        .eq('user_id', userId)
        .maybeSingle<Row>()
      if (error) throw error
      return data ? { schemaVersion: data.schema_version, data: data.data, updatedAt: data.updated_at } : null
    },
    async insert(userId, row) {
      const { data, error } = await table()
        .insert({ user_id: userId, schema_version: row.schemaVersion, data: row.data })
        .select('updated_at')
      if (error) {
        if (error.code === '23505') return { status: 'conflict' } // unique_violation: hàng đã có
        throw error
      }
      const updatedAt = (data as Array<{ updated_at: string }> | null)?.[0]?.updated_at
      if (!updatedAt) throw new Error('Server không trả về updated_at sau khi tạo hàng')
      return { status: 'ok', updatedAt }
    },
    async update(userId, row, expectedUpdatedAt) {
      const { data, error } = await table()
        .update({ schema_version: row.schemaVersion, data: row.data })
        .eq('user_id', userId)
        .eq('updated_at', expectedUpdatedAt)
        .select('updated_at')
      if (error) throw error
      const updatedAt = (data as Array<{ updated_at: string }> | null)?.[0]?.updated_at
      return updatedAt ? { status: 'ok', updatedAt } : { status: 'conflict' }
    },
  }
}
