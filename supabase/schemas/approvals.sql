-- ─── approvals ────────────────────────────────────────────────────────────────
-- Freelancer creates approval requests; client decides (approve / request changes).
-- files: [{name, size, type, url, path}] stored as JSONB

create table public.approvals (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'changes_requested')),
  files        jsonb not null default '[]',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_approvals_project_id on public.approvals(project_id);

create trigger trg_approvals_updated_at
  before update on public.approvals
  for each row execute function set_updated_at();

-- RLS
alter table public.approvals enable row level security;

create policy "owner full access"
  on public.approvals for all
  using  ((select owner_id from public.projects where id = project_id) = auth.uid())
  with check ((select owner_id from public.projects where id = project_id) = auth.uid());

create policy "anon read"
  on public.approvals for select
  using (true);
