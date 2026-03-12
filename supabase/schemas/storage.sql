-- ─── storage bucket ───────────────────────────────────────────────────────────
-- Public bucket — clients can download attachments without a signed URL

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-files');

create policy "public can read files"
  on storage.objects for select
  using (bucket_id = 'project-files');

create policy "owner can delete files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-files');
