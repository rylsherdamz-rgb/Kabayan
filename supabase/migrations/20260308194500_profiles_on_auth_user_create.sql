-- Ensure every auth user has a matching profiles row.
-- 1) Backfill existing users without profiles.
-- 2) Create trigger for all future signups.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_display_name text;
begin
  derived_display_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1),
    'User'
  );

  insert into public.profiles (user_id, display_name)
  values (new.id, nullif(btrim(derived_display_name), ''))
  on conflict (user_id) do nothing;

  return new;
end;
$$;

insert into public.profiles (user_id, display_name)
select
  u.id,
  nullif(
    btrim(
      coalesce(
        u.raw_user_meta_data ->> 'display_name',
        u.raw_user_meta_data ->> 'full_name',
        split_part(u.email, '@', 1),
        'User'
      )
    ),
    ''
  )
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
