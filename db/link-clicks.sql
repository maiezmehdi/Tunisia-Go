-- Tunisia Go: click counters on outside links (Tunisie Booking, Airbnb, WhatsApp, phone, e-mail, websites, maps).
-- Paste into the Supabase SQL editor and run once.
-- Only counts per day are kept: no IP address, no identifier, no cookie. Only the site's server (secret key) reads
-- and writes; RLS with no policy blocks every browser request.

create table if not exists public.link_clicks (
  day date not null default (now() at time zone 'utc')::date,
  kind text not null,
  page text not null,
  place_id text not null default '',
  clicks integer not null default 0,
  primary key (day, kind, page, place_id)
);
alter table public.link_clicks enable row level security;

create or replace function public.count_link_click(p_kind text, p_page text, p_place text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.link_clicks (day, kind, page, place_id, clicks)
  values ((now() at time zone 'utc')::date, p_kind, p_page, coalesce(p_place, ''), 1)
  on conflict (day, kind, page, place_id) do update set clicks = public.link_clicks.clicks + 1;
$$;
revoke all on function public.count_link_click(text, text, text) from public, anon, authenticated;
grant execute on function public.count_link_click(text, text, text) to service_role;
