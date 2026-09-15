create or replace function public.record_case_history()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  history_action text;
  history_detail jsonb;
begin
  if tg_op = 'INSERT' then
    history_action := '建立案件';
    history_detail := jsonb_build_object(
      'case_no', new.case_no,
      'status', new.status,
      'report_source', new.report_source
    );
  else
    history_action := case
      when old.status is distinct from new.status then '狀態變更'
      when old.scheduled_at is distinct from new.scheduled_at
        or old.dispatch_period is distinct from new.dispatch_period
        or old.dispatch_trip is distinct from new.dispatch_trip
        or old.vehicle_no is distinct from new.vehicle_no
        or old.worker_name is distinct from new.worker_name then '排班變更'
      when old.quantity_review_status is distinct from new.quantity_review_status
        or old.confirmed_items is distinct from new.confirmed_items
        or old.fee_amount is distinct from new.fee_amount then '人工覆核變更'
      when old.photo_paths is distinct from new.photo_paths
        or old.completion_photo_paths is distinct from new.completion_photo_paths then '照片資料變更'
      else '案件資料更新'
    end;

    history_detail := jsonb_strip_nulls(jsonb_build_object(
      'case_no', new.case_no,
      'status', case when old.status is distinct from new.status then jsonb_build_object('before', old.status, 'after', new.status) end,
      'scheduled_at', case when old.scheduled_at is distinct from new.scheduled_at then jsonb_build_object('before', old.scheduled_at, 'after', new.scheduled_at) end,
      'dispatch_period', case when old.dispatch_period is distinct from new.dispatch_period then jsonb_build_object('before', old.dispatch_period, 'after', new.dispatch_period) end,
      'dispatch_trip', case when old.dispatch_trip is distinct from new.dispatch_trip then jsonb_build_object('before', old.dispatch_trip, 'after', new.dispatch_trip) end,
      'vehicle_no', case when old.vehicle_no is distinct from new.vehicle_no then jsonb_build_object('before', old.vehicle_no, 'after', new.vehicle_no) end,
      'worker_name', case when old.worker_name is distinct from new.worker_name then jsonb_build_object('before', old.worker_name, 'after', new.worker_name) end,
      'quantity_review_status', case when old.quantity_review_status is distinct from new.quantity_review_status then jsonb_build_object('before', old.quantity_review_status, 'after', new.quantity_review_status) end,
      'confirmed_items', case when old.confirmed_items is distinct from new.confirmed_items then jsonb_build_object('before', old.confirmed_items, 'after', new.confirmed_items) end,
      'fee_amount', case when old.fee_amount is distinct from new.fee_amount then jsonb_build_object('before', old.fee_amount, 'after', new.fee_amount) end,
      'photo_paths', case when old.photo_paths is distinct from new.photo_paths then jsonb_build_object('before', old.photo_paths, 'after', new.photo_paths) end,
      'completion_photo_paths', case when old.completion_photo_paths is distinct from new.completion_photo_paths then jsonb_build_object('before', old.completion_photo_paths, 'after', new.completion_photo_paths) end,
      'dispatch_note', case when old.dispatch_note is distinct from new.dispatch_note then jsonb_build_object('before', old.dispatch_note, 'after', new.dispatch_note) end
    ));
  end if;

  insert into public.case_history (case_id, action, detail, actor_id)
  values (new.id, history_action, history_detail::text, auth.uid());
  return new;
end;
$$;

drop trigger if exists cases_record_history on public.cases;
create trigger cases_record_history
after insert or update on public.cases
for each row execute function public.record_case_history();

