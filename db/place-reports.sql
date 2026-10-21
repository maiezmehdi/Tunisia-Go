-- Tunisia Go: "Signaler une erreur" on the place pages. Paste into the Supabase SQL editor and run once.
-- Only the site's server (secret key) writes and reads here; RLS with no policy blocks every browser request.

create table if not exists public.place_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open','done')),
  place_id text not null,
  place_name text,
  locale text,
  message text not null,
  contact text,
  handled_at timestamptz
);
alter table public.place_reports enable row level security;
create index if not exists place_reports_status_idx on public.place_reports (status, created_at desc);
