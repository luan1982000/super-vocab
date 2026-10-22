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

-- 5. Ngữ pháp — nội dung chủ đề dùng chung (đọc/sửa được bởi user đã đăng nhập)
create table if not exists public.grammar_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  stage smallint not null check (stage between 1 and 5),
  position smallint not null check (position > 0),
  title text not null check (length(trim(title)) > 0),
  title_en text,
  summary text not null check (length(trim(summary)) > 0),
  content text not null check (length(trim(content)) > 0),
  examples jsonb not null default '[]'::jsonb check (jsonb_typeof(examples) = 'array'),
  exercises jsonb not null default '[]'::jsonb check (jsonb_typeof(exercises) = 'array'),
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists grammar_topics_stage_position_idx
  on public.grammar_topics (stage, position);

alter table public.grammar_topics enable row level security;

-- Nội dung là tài nguyên chung: mọi user đã đăng nhập đều đọc và sửa được.
drop policy if exists "read grammar topics" on public.grammar_topics;
create policy "read grammar topics" on public.grammar_topics
  for select
  to authenticated
  using (true);

drop policy if exists "update grammar topics" on public.grammar_topics;
create policy "update grammar topics" on public.grammar_topics
  for update
  to authenticated
  using (true)
  with check (true);

-- 6. Ngữ pháp — tiến độ theo từng user
create table if not exists public.grammar_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_id uuid not null references public.grammar_topics (id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'learning', 'needs_review', 'mastered')),
  mastery smallint check (mastery between 1 and 5),
  last_studied_on date,
  next_review_on date,
  reviewed_at timestamptz,
  review_count integer not null default 0 check (review_count >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

create index if not exists grammar_progress_user_next_idx
  on public.grammar_progress (user_id, next_review_on);
create index if not exists grammar_progress_topic_idx
  on public.grammar_progress (topic_id);

alter table public.grammar_progress enable row level security;

drop policy if exists "own grammar progress" on public.grammar_progress;
create policy "own grammar progress" on public.grammar_progress
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
