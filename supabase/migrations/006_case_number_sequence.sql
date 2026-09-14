-- 預約單號：民國年度-月日-每日流水號，例如 115-0914-001。
-- 以資料庫的單列 UPSERT 原子遞增，避免同時建案時取得相同流水號。
create table if not exists public.case_number_counters (
  date_key date primary key,
  last_serial integer not null check (last_serial > 0),
  updated_at timestamptz not null default now()
);

create or replace function public.next_case_no()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  taiwan_today date := (now() at time zone 'Asia/Taipei')::date;
  serial_number integer;
begin
  insert into public.case_number_counters (date_key, last_serial, updated_at)
  values (taiwan_today, 1, now())
  on conflict (date_key) do update
    set last_serial = public.case_number_counters.last_serial + 1,
        updated_at = now()
  returning last_serial into serial_number;

  return lpad((extract(year from taiwan_today)::integer - 1911)::text, 3, '0')
    || '-' || to_char(taiwan_today, 'MMDD')
    || '-' || lpad(serial_number::text, 3, '0');
end;
$$;

revoke all on table public.case_number_counters from anon, authenticated;
grant execute on function public.next_case_no() to service_role;
