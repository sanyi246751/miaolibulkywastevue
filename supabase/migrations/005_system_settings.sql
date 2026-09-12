create table if not exists public.system_settings (
  setting_key text primary key,
  setting_value text not null,
  updated_at timestamptz not null default now()
);

insert into public.system_settings (setting_key, setting_value)
values ('route_origin', '24.380891,120.734372')
on conflict (setting_key) do nothing;

alter table public.system_settings enable row level security;
revoke all on public.system_settings from anon;

drop policy if exists "admins manage system settings" on public.system_settings;
create policy "admins manage system settings" on public.system_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
