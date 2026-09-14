create table if not exists public.photo_sync_jobs (
  id bigint generated always as identity primary key,
  case_no text not null,
  storage_path text not null unique,
  target_file_name text not null,
  photo_kind text not null check (photo_kind in ('pending', 'completion')),
  status text not null default 'pending' check (status in ('pending', 'syncing', 'completed', 'failed')),
  drive_file_id text,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists photo_sync_jobs_status_created_at_idx on public.photo_sync_jobs(status, created_at);
alter table public.photo_sync_jobs enable row level security;
revoke all on public.photo_sync_jobs from anon, authenticated;
