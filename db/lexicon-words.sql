-- Tunisia Go: words added from /admin to « Les mots du cru » (the built-in ones stay in data/lexicon.ts).
-- Paste into the Supabase SQL editor and run once. Only the site's server (secret key) reads and writes here.

create table if not exists public.lexicon_words (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  group_id text not null,
  latin text not null,
  ar text not null,
  meaning_fr text not null,
  meaning_en text not null,
  tip_fr text,
  tip_en text
);
alter table public.lexicon_words enable row level security;
