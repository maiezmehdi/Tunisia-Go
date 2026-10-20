-- Tunisia Go: "secret spot" suggestions. Paste into the Supabase SQL editor and run once.
-- Only the site's server (secret key) writes here; RLS with no policy blocks every browser request.

create table if not exists public.spot_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  locale text,
  name text not null,
  type text,
  area text not null,
  location text,
  why text not null,
  best_time text,
  author text,
  contact text,
  photos text[] not null default '{}'
);
alter table public.spot_submissions enable row level security;

-- Private bucket for the photos (2 MB max each).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('spot-photos', 'spot-photos', false, 2097152, array['image/jpeg','image/webp','image/png'])
on conflict (id) do nothing;
