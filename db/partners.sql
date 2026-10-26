-- Tunisia Go: partners (hotels, guesthouses, car rentals, restaurants) who describe themselves from their account.
-- Moderated in the admin; shown later in a "Partenaires" section. Only the server (secret key) reads and writes.

create table if not exists public.partner_listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null unique,
  status text not null default 'pending' check (status in ('published','pending','hidden')),
  partner_type text not null check (partner_type in ('hotel','guesthouse','car_rental','restaurant')),
  name text not null,
  place_id text,
  photo_path text,
  description text,
  whatsapp text,
  website text,
  consent boolean not null check (consent)
);
alter table public.partner_listings enable row level security;
create index if not exists partner_listings_status_idx on public.partner_listings (status, created_at desc);
