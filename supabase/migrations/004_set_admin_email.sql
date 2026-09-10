-- Supabase Auth 管理員帳號
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and email = 'sanyi246751@gmail.com'
  );
$$;

grant execute on function public.is_admin() to authenticated;
