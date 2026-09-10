-- 民眾案件查詢與私有照片 Storage 權限

create or replace function public.query_case(p_case_no text, p_phone text)
returns table (
  case_no text, status text, waste_type text, quantity integer,
  requested_scheduled_at timestamptz, scheduled_at timestamptz,
  dispatch_period text, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select c.case_no, c.status, c.waste_type, c.quantity, c.requested_scheduled_at,
         c.scheduled_at, c.dispatch_period, c.created_at
  from public.cases c
  where c.case_no = trim(p_case_no) and c.phone = trim(p_phone)
  limit 1;
$$;

grant execute on function public.query_case(text, text) to anon;

-- 管理員可處理私有案件照片；民眾與工作端上傳改由 Edge Function 驗證後代送。
drop policy if exists "admins manage case photos" on storage.objects;
create policy "admins manage case photos" on storage.objects for all to authenticated
  using (bucket_id = 'case-photos' and public.is_admin())
  with check (bucket_id = 'case-photos' and public.is_admin());
