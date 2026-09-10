-- 工作端 PIN 與受限 RPC（請接續執行 001_initial_schema.sql 後執行）
-- 初始 PIN：Miaoli。資料庫只保存雜湊，不保存明文。

create table if not exists public.worker_access (
  id boolean primary key default true check (id),
  pin_hash text not null,
  updated_at timestamptz not null default now()
);

insert into public.worker_access (id, pin_hash)
values (true, extensions.crypt('Miaoli', extensions.gen_salt('bf')))
on conflict (id) do update set pin_hash = excluded.pin_hash, updated_at = now();

alter table public.worker_access enable row level security;
revoke all on public.worker_access from anon, authenticated;

create or replace function public.verify_worker_pin(p_pin text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from public.worker_access
    where id = true and pin_hash = extensions.crypt(p_pin, pin_hash)
  );
$$;

create or replace function public.worker_list(p_pin text, p_keyword text default '')
returns table (
  case_id uuid, case_no text, applicant text, phone text, address text, waste_type text,
  quantity integer, status text, scheduled_at timestamptz, vehicle_no text, worker_name text,
  dispatch_note text
)
language plpgsql security definer set search_path = public as $$
begin
  if not public.verify_worker_pin(p_pin) then
    raise exception '工作人員驗證碼不正確';
  end if;
  return query
    select c.id, c.case_no, c.applicant, c.phone, c.address, c.waste_type, c.quantity,
           c.status, c.scheduled_at, c.vehicle_no, c.worker_name, c.dispatch_note
    from public.cases c
    where c.status in ('已排班', '清運中')
      and (
        coalesce(p_keyword, '') = '' or concat_ws(' ', c.case_no, c.applicant, c.phone,
          c.address, c.waste_type, c.vehicle_no, c.worker_name) ilike '%' || p_keyword || '%'
      )
    order by c.scheduled_at nulls last, c.case_no;
end;
$$;

create or replace function public.worker_complete_case(
  p_pin text, p_case_id uuid, p_note text default '', p_photo_paths jsonb default '[]'::jsonb
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.verify_worker_pin(p_pin) then
    raise exception '工作人員驗證碼不正確';
  end if;
  update public.cases
  set status = '清運完成', completion_photo_paths = coalesce(p_photo_paths, '[]'::jsonb),
      dispatch_note = concat_ws(E'\n', nullif(dispatch_note, ''), nullif(p_note, ''))
  where id = p_case_id and status in ('已排班', '清運中');
  if not found then raise exception '找不到可結案的案件'; end if;
end;
$$;

grant execute on function public.verify_worker_pin(text) to anon;
grant execute on function public.worker_list(text, text) to anon;
grant execute on function public.worker_complete_case(text, uuid, text, jsonb) to anon;
