-- ─── projects ─────────────────────────────────────────────────────────────────

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  share_token   text not null unique default generate_share_token(),
  name          text not null,
  client_name   text,
  client_email  text,
  status        text not null default 'Ready to work'
                  check (status in ('Ready to work', 'In Progress', 'Under Review', 'Completed', 'Parked')),
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

-- RLS
alter table public.projects enable row level security;

create policy "owner full access"
  on public.projects for all
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "public read by share token"
  on public.projects for select
  using (true);
