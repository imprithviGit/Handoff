-- Add client_note to approvals so clients can explain what they want changed
alter table public.approvals add column if not exists client_note text;
