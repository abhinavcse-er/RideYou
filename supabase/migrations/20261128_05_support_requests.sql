-- Public support and Admin-access requests are written only by the API service role.
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('account_help','admin_access')),
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  email text not null check (char_length(email) between 5 and 254),
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 10 and 1200),
  status text not null default 'new' check (status in ('new','reviewing','resolved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists support_requests_status_created_idx
  on public.support_requests(status,created_at desc);
alter table public.support_requests enable row level security;
grant usage on schema public to service_role;
grant all on public.support_requests to service_role;
