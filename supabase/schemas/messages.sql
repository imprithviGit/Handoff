-- ─── messages ─────────────────────────────────────────────────────────────────
-- Both freelancer and client post here.
-- files: [{name, size, type, url, path}] stored as JSONB

create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  role         text not null check (role in ('freelancer', 'client')),
  author_name  text not null,
  body         text,
  files        jsonb not null default '[]',
  created_at   timestamptz not null default now()
);

create index idx_messages_project_created on public.messages(project_id, created_at desc);

-- RLS
alter table public.messages enable row level security;

create policy "owner full access"
  on public.messages for all
  using  ((select owner_id from public.projects where id = project_id) = auth.uid())
  with check ((select owner_id from public.projects where id = project_id) = auth.uid());

create policy "anon read"
  on public.messages for select
  using (true);
