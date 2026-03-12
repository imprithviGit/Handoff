-- ─── helper functions ─────────────────────────────────────────────────────────

-- 16-char URL-safe random token for share links
create or replace function generate_share_token()
returns text language sql as $$
  select substring(
    replace(replace(encode(gen_random_bytes(12), 'base64'), '+', 'A'), '/', 'B'),
    1, 16
  );
$$;

-- Auto-update updated_at on row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
