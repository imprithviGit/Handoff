-- Tracks each user's plan and Dodo subscription details
create table if not exists customers (
  id                     uuid primary key default gen_random_uuid(),
  owner_id               uuid not null unique,
  dodo_customer_id       text,
  dodo_subscription_id   text,
  plan                   text not null default 'free' check (plan in ('free', 'pro', 'lifetime')),
  plan_period_end        timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_customers_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger customers_updated_at
  before update on customers
  for each row execute procedure update_customers_updated_at();
