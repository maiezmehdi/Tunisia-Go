-- Tunisia Go: texts and photos of the built-in places, edited from /admin.
-- Only the fields changed from the original text are stored (fr / en: tagline, description, ...).
-- Only the site's server (secret key) reads and writes here; RLS with no policy blocks every browser request.

create table if not exists public.place_overrides (
  place_id text primary key,
  updated_at timestamptz not null default now(),
  fr jsonb not null default '{}'::jsonb,
  en jsonb not null default '{}'::jsonb,
  photos text[] not null default '{}'
);
alter table public.place_overrides enable row level security;
