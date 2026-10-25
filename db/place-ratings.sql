-- Tunisia Go: star ratings on the place pages. Paste into the Supabase SQL editor and run once.
-- One vote per visitor and place: the visitor is a salted hash of the IP address (never the address itself).
-- Only the site's server (secret key) reads and writes; RLS with no policy blocks every browser request.

create table if not exists public.place_ratings (
  place_id text not null,
  voter_hash text not null,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (place_id, voter_hash)
);
alter table public.place_ratings enable row level security;

-- Average and number of votes per place. security_invoker keeps the table's RLS in force for the view.
create or replace view public.place_rating_stats with (security_invoker = true) as
  select place_id, round(avg(stars)::numeric, 2)::float8 as average, count(*)::int as votes
  from public.place_ratings
  group by place_id;
