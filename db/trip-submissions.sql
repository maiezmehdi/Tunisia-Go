-- Tunisia Go: road trips suggested by visitors. Paste into the Supabase SQL editor and run once.
-- Only the site's server (secret key) reads and writes here; RLS with no policy blocks every browser request.
-- `stops` holds ordered place ids: built-in places, or `c-<uuid>` for places suggested by visitors.

create table if not exists public.trip_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  locale text,
  name text not null,
  description text not null,
  days int not null default 3 check (days between 1 and 30),
  stops text[] not null default '{}',
  author text,
  contact text,
  name_en text,
  description_en text,
  reviewed_at timestamptz
);
create index if not exists trip_submissions_status_idx on public.trip_submissions (status, created_at desc);
alter table public.trip_submissions enable row level security;
