-- Tunisia Go: guides and agencies who register themselves (section on the home page, list on /guides).
-- Paste into the Supabase SQL editor and run once.
-- Only the site's server (secret key) reads and writes; RLS with no policy blocks every browser request.

create table if not exists public.pro_listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- published: shown on /guides. pending: waits for the admin. hidden: taken down by the admin.
  status text not null default 'pending' check (status in ('published','pending','hidden')),
  kind text not null check (kind in ('guide','agency')),
  name text not null,
  whatsapp text not null unique,
  card_number text,
  socials text,
  consent boolean not null check (consent),
  auto_published boolean not null default false
);
alter table public.pro_listings enable row level security;
create index if not exists pro_listings_status_idx on public.pro_listings (status, created_at desc);

create table if not exists public.pro_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  listing_id uuid not null references public.pro_listings (id) on delete cascade
);
alter table public.pro_reports enable row level security;
create index if not exists pro_reports_listing_idx on public.pro_reports (listing_id);

-- The guide or agency signs in with an e-mail link (Supabase Auth) and edits only their own entry: owner_id is their Supabase user id.
alter table public.pro_listings add column if not exists owner_id uuid unique;

-- Profile: a main photo, the place where the guide or agency works (one of the site's places) and a short bio.
alter table public.pro_listings add column if not exists bio text, add column if not exists place_id text, add column if not exists photo_path text;
alter table public.pro_listings add column if not exists experience text;
alter table public.pro_listings add column if not exists languages text[], add column if not exists activities text[], add column if not exists price_note text;
insert into storage.buckets (id, name, public) values ('pro-photos', 'pro-photos', true) on conflict (id) do nothing;

-- Optional social links of a guide or agency (full https addresses, built from a link or an @name).
alter table public.pro_listings add column if not exists facebook text, add column if not exists instagram text, add column if not exists tiktok text;
