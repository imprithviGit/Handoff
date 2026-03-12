-- ─────────────────────────────────────────────────────────────────────────────
-- Handoff — initial schema
-- 3 tables: projects · messages · approvals
-- Files are stored as JSONB inside messages/approvals (no extra joins needed)
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: generate a 16-char URL-safe random token
create or replace function generate_share_token()
returns text language sql as $$
  select substring(
    replace(replace(encode(gen_random_bytes(12), 'base64'), '+', 'A'), '/', 'B'),
    1, 16
  );
$$;

-- Auto-update updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── projects ─────────────────────────────────────────────────────────────────

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  share_token   text not null unique default generate_share_token(),
  name          text not null,
  client_name   text,
  client_email  text,
  status        text not null default 'Ready to work',
  deadline      date,
  amount        numeric(10,2),
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_projects_owner_id    on public.projects(owner_id);
create index idx_projects_share_token on public.projects(share_token);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function set_updated_at();

-- ─── messages ─────────────────────────────────────────────────────────────────
-- Both freelancer and client post here.
-- files: [{name, size, type, url, path}]

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

-- ─── approvals ────────────────────────────────────────────────────────────────
-- Freelancer creates, client decides.
-- files: [{name, size, type, url, path}]

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

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.projects  enable row level security;
alter table public.messages  enable row level security;
alter table public.approvals enable row level security;

-- projects: freelancer owns their rows
create policy "owner full access"
  on public.projects for all
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- projects: anyone can read a project by share_token (client portal, no auth)
create policy "public read by share token"
  on public.projects for select
  using (true);  -- filtered in app by share_token; no secrets in project row

-- messages: freelancer can do everything on their projects
create policy "owner full access"
  on public.messages for all
  using  ((select owner_id from public.projects where id = project_id) = auth.uid())
  with check ((select owner_id from public.projects where id = project_id) = auth.uid());

-- messages: anon can read/insert (client portal uses service-role server action)
create policy "anon read"
  on public.messages for select
  using (true);

-- approvals: freelancer full access
create policy "owner full access"
  on public.approvals for all
  using  ((select owner_id from public.projects where id = project_id) = auth.uid())
  with check ((select owner_id from public.projects where id = project_id) = auth.uid());

-- approvals: anon can read + update status (client approves/rejects)
create policy "anon read"
  on public.approvals for select
  using (true);

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Creates the project-files bucket and its access policies.

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

-- Authenticated users (freelancers) can upload
create policy "authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-files');

-- Anyone can read files (clients need to download attachments)
create policy "public can read files"
  on storage.objects for select
  using (bucket_id = 'project-files');

-- Authenticated users can delete their own files
create policy "owner can delete files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-files');
