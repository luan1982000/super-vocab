-- Super Vocab — chạy file này trong Supabase SQL Editor (project này đã apply qua MCP).
-- `collections` = bộ từ; `cards` = từ vựng + trạng thái FSRS (ts-fsrs v5).

-- 1. Bộ từ
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

-- Không cho trùng tên bộ từ trong cùng 1 user (không phân biệt hoa/thường).
create unique index if not exists collections_user_name_key on public.collections (user_id, lower(name));

alter table public.collections enable row level security;

drop policy if exists "own collections" on public.collections;
create policy "own collections" on public.collections
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 2. Từ vựng
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  collection_id uuid,
  word text not null check (length(trim(word)) > 0),
  meaning text not null check (length(trim(meaning)) > 0),
  example text,
  note text,

  -- trường FSRS
  due timestamptz not null default now(),
  stability real not null default 0,
  difficulty real not null default 0,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state smallint not null default 0 check (state between 0 and 3), -- 0 New, 1 Learning, 2 Review, 3 Relearning
  last_review timestamptz,
  created_at timestamptz not null default now()
);

alter table public.cards add column if not exists collection_id uuid;

-- FK tổ hợp: card chỉ trỏ được vào bộ từ của chính mình (RLS không chặn được FK).
-- Xóa bộ từ thì từ vựng ở lại và chuyển về "Chưa phân loại".
alter table public.collections drop constraint if exists collections_id_user_id_key;
alter table public.collections add constraint collections_id_user_id_key unique (id, user_id);

alter table public.cards drop constraint if exists cards_collection_owner_fkey;
alter table public.cards add constraint cards_collection_owner_fkey
  foreign key (collection_id, user_id) references public.collections (id, user_id)
  on delete set null (collection_id);

-- 3. Index
-- Practice toàn bộ: card đến hạn của user, sắp theo `due`.
create index if not exists cards_user_due_idx on public.cards (user_id, due);
-- Practice trong 1 bộ từ.
create index if not exists cards_user_collection_due_idx on public.cards (user_id, collection_id, due);
-- Vocabulary: mới nhất trước.
create index if not exists cards_user_created_idx on public.cards (user_id, created_at desc);

-- 4. RLS cho cards
alter table public.cards enable row level security;

-- `(select auth.uid())` để Postgres chỉ tính 1 lần cho cả query (tránh lint auth_rls_initplan).
drop policy if exists "own cards" on public.cards;
create policy "own cards" on public.cards
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
