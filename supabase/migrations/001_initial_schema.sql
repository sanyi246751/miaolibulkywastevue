-- 清潔隊案件系統：Supabase 初始資料庫結構
-- 請在 Supabase Dashboard → SQL Editor → New query 貼上並執行。

create extension if not exists pgcrypto;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_no text not null unique,
  applicant text not null,
  phone text not null,
  email text,
  address text not null,
  waste_type text not null,
  quantity integer not null default 1 check (quantity > 0),
  status text not null default '待處理' check (status in ('待處理', '已排班', '清運中', '清運完成', '已取消')),
  requested_scheduled_at timestamptz,
  scheduled_at timestamptz,
  dispatch_period text,
  dispatch_trip integer not null default 1 check (dispatch_trip > 0),
  vehicle_no text,
  worker_name text,
  dispatch_origin text,
  dispatch_note text,
  quantity_review_status text not null default '待人工核可',
  confirmed_items jsonb not null default '[]'::jsonb,
  review_note text,
  chargeable_quantity integer not null default 0 check (chargeable_quantity >= 0),
  fee_amount numeric(12, 2) not null default 0 check (fee_amount >= 0),
  annual_count integer not null default 0,
  photo_paths jsonb not null default '[]'::jsonb,
  completion_photo_paths jsonb not null default '[]'::jsonb,
  ai_result jsonb,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  completion_distance_km numeric(10, 2),
  completion_carbon_kg numeric(10, 3),
  report_source text not null default '網路申請',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  vehicle_no text not null unique,
  fuel_efficiency numeric(8, 2),
  co2_per_liter numeric(8, 3),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.case_history (
  id bigint generated always as identity primary key,
  case_id uuid not null references public.cases(id) on delete cascade,
  action text not null,
  detail text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists cases_status_scheduled_at_idx on public.cases(status, scheduled_at);
create index if not exists cases_phone_idx on public.cases(phone);
create index if not exists case_history_case_id_idx on public.case_history(case_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at before update on public.cases
for each row execute function public.set_updated_at();

-- 對所有表啟用 RLS。民眾不可直接讀取個資，管理者必須使用 Supabase Auth 登入。
alter table public.cases enable row level security;
alter table public.vehicles enable row level security;
alter table public.workers enable row level security;
alter table public.case_history enable row level security;

revoke all on public.cases, public.vehicles, public.workers, public.case_history from anon;
grant insert on public.cases to anon;

drop policy if exists "public can create pending cases" on public.cases;
create policy "public can create pending cases" on public.cases
  for insert to anon
  with check (
    status = '待處理'
    and quantity_review_status = '待人工核可'
    and fee_amount = 0
    and chargeable_quantity = 0
  );

-- 請將下列 email 改成你剛建立的管理員帳號 email 後再執行。
-- 這個 helper 不會將密碼或 service key 放進前端。
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users where id = auth.uid()
      and email = 'sanyi246751@gmail.com'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins manage cases" on public.cases;
create policy "admins manage cases" on public.cases for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage vehicles" on public.vehicles;
create policy "admins manage vehicles" on public.vehicles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage workers" on public.workers;
create policy "admins manage workers" on public.workers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage case history" on public.case_history;
create policy "admins manage case history" on public.case_history for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 建立私有照片儲存 bucket；照片讀寫會在下一步改由登入權限／Edge Function 處理。
insert into storage.buckets (id, name, public)
values ('case-photos', 'case-photos', false)
on conflict (id) do update set public = false;
