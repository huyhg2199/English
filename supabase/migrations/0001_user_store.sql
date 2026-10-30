-- Story 2a: lưu dữ liệu học trên Supabase (local-first).
-- Chạy một lần trong Supabase Dashboard → SQL Editor.
-- Một hàng mỗi user: `data` = phần allowlist (SYNCED_KEYS) của store, `schema_version` = version store.

create table if not exists public.user_store (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  schema_version integer     not null check (schema_version >= 1),
  data           jsonb       not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at     timestamptz not null default now()
);

-- `updated_at` luôn do server đặt (không tin giờ máy client). Client dùng giá trị trả về
-- từ server làm điều kiện CAS khi ghi (`update ... where updated_at = <bản đã đọc>`).
create or replace function public.user_store_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_store_set_updated_at on public.user_store;
create trigger user_store_set_updated_at
  before insert or update on public.user_store
  for each row execute function public.user_store_set_updated_at();

-- RLS: mỗi user chỉ đọc/ghi hàng của chính mình.
alter table public.user_store enable row level security;

drop policy if exists "user_store_select_own" on public.user_store;
create policy "user_store_select_own" on public.user_store
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_store_insert_own" on public.user_store;
create policy "user_store_insert_own" on public.user_store
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_store_update_own" on public.user_store;
create policy "user_store_update_own" on public.user_store
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Không có policy delete: app không xoá hàng (xoá user thì hàng tự xoá theo cascade).
-- Supabase mặc định grant ALL cho anon/authenticated trên bảng mới ở schema public: thu hồi hết
-- rồi chỉ cấp lại đúng quyền cần (không có delete, anon không có gì).
revoke all on public.user_store from anon, authenticated;
grant select, insert, update on public.user_store to authenticated;
