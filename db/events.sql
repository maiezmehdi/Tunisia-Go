-- Tunisia Go: events shown on /evenements, managed from /admin. Paste into the Supabase SQL editor and run once.
-- Only the site's server (secret key) reads and writes here; RLS with no policy blocks every browser request.
-- Without this table the page falls back to data/events.ts.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  published boolean not null default true,
  kind text not null default 'music' check (kind in ('music','gathering','culture')),
  place_id text not null,
  title_fr text not null,
  title_en text not null,
  desc_fr text not null,
  desc_en text not null,
  when_fr text not null,
  when_en text not null,
  confirmed boolean not null default false,
  start_date date,
  end_date date,
  ticket_url text,
  info_url text,
  sort int not null default 0
);
alter table public.events enable row level security;
create index if not exists events_published_idx on public.events (published, sort);

-- Events proposed by visitors (form on /evenements): saved hidden (published = false, proposed = true)
-- with a contact to check them; /admin shows them first, publishing one clears the flag.
alter table public.events
  add column if not exists proposed boolean not null default false,
  add column if not exists contact text;
