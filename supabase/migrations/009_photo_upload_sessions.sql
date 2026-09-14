create table if not exists public.photo_upload_sessions (
  id uuid primary key default gen_random_uuid(),
  case_no text not null unique,
  photo_paths jsonb not null default '[]'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.photo_upload_sessions enable row level security;
revoke all on public.photo_upload_sessions from anon, authenticated;
