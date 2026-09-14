insert into public.system_settings (setting_key, setting_value)
values
  ('google_drive_enabled', 'true'),
  ('google_drive_web_app_url', '')
on conflict (setting_key) do nothing;
