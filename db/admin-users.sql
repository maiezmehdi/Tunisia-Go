-- Tunisia Go: admin accounts (email + password), managed from /admin by an owner.
-- Only the site's server (secret key) reads and writes here; RLS with no policy blocks every browser request.
-- The master password in ADMIN_PASSWORD always works, so you can never be locked out.

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'editor' check (role in ('owner','editor')),
  last_login_at timestamptz
);
alter table public.admin_users enable row level security;
