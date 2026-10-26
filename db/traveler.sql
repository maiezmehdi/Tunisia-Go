-- Tunisia Go: what a signed-in account keeps (favourite places and "Mon voyage"), so it follows the person from one device to another.
-- Only the site's server (secret key) reads and writes; RLS with no policy blocks every browser request.

create table if not exists public.traveler_data (
  owner_id uuid primary key,
  updated_at timestamptz not null default now(),
  favorites text[] not null default '{}',
  trip text[] not null default '{}'
);
alter table public.traveler_data enable row level security;
