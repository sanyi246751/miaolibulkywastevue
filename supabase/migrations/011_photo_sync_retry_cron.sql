create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'photo_sync_project_url') then
    perform vault.create_secret('https://gmddnvtkthajwodyingl.supabase.co', 'photo_sync_project_url', 'Project URL used by the photo retry cron job');
  end if;
  if not exists (select 1 from vault.secrets where name = 'photo_sync_publishable_key') then
    perform vault.create_secret('sb_publishable_-DsUAg3oW-D3hEHtgeKb4A_sqwEPVmy', 'photo_sync_publishable_key', 'Publishable key used by the photo retry cron job');
  end if;
end $$;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'retry-failed-photo-sync-every-minute';
  if existing_job is not null then perform cron.unschedule(existing_job); end if;
end $$;

select cron.schedule(
  'retry-failed-photo-sync-every-minute',
  '* * * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'photo_sync_project_url') || '/functions/v1/case-api',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'photo_sync_publishable_key'),
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'photo_sync_publishable_key')
      ),
      body := '{"action":"retryFailedPhotoSync"}'::jsonb
    );
  $$
);
