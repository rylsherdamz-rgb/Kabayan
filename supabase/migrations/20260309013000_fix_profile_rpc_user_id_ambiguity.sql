-- Fix ambiguous user_id in profile RPCs by avoiding ON CONFLICT(column)
-- inside RETURNS TABLE functions that expose user_id.

create or replace function public.rpc_update_profile(
  p_user_id uuid,
  p_display_name text default null,
  p_bio text default null,
  p_location_label text default null,
  p_avatar_url text default null,
  p_job_role text default null,
  p_market_role text default null,
  p_birth_date date default null
)
returns table (
  user_id uuid,
  display_name text,
  bio text,
  location_label text,
  avatar_url text,
  job_role text,
  market_role text,
  birth_date date,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'Requested user does not match authenticated user';
  end if;

  insert into public.profiles (user_id, display_name)
  values (
    p_user_id,
    nullif(btrim(coalesce(p_display_name, '')), '')
  )
  on conflict on constraint profiles_pkey do nothing;

  return query
  update public.profiles p
  set
    display_name = nullif(btrim(coalesce(p_display_name, '')), ''),
    bio = nullif(btrim(coalesce(p_bio, '')), ''),
    location_label = nullif(btrim(coalesce(p_location_label, '')), ''),
    avatar_url = case
      when p_avatar_url is null then p.avatar_url
      else nullif(btrim(coalesce(p_avatar_url, '')), '')
    end,
    job_role = case
      when p_job_role in ('worker', 'employer') then p_job_role
      else p.job_role
    end,
    market_role = case
      when p_market_role in ('buyer', 'vendor') then p_market_role
      else p.market_role
    end,
    birth_date = coalesce(p_birth_date, p.birth_date),
    updated_at = now()
  where p.user_id = p_user_id
  returning
    p.user_id,
    p.display_name,
    p.bio,
    p.location_label,
    p.avatar_url,
    p.job_role,
    p.market_role,
    p.birth_date,
    p.updated_at;
end;
$$;

create or replace function public.rpc_submit_verification(
  p_first_name text,
  p_last_name text,
  p_id_photo_uri text,
  p_resume_uri text default null,
  p_birth_date date default null
)
returns table (
  user_id uuid,
  display_name text,
  id_photo_uri text,
  resume_uri text,
  id_verification_status text,
  verification_submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  computed_display_name text;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  computed_display_name := nullif(
    btrim(
      concat_ws(
        ' ',
        nullif(btrim(coalesce(p_first_name, '')), ''),
        nullif(btrim(coalesce(p_last_name, '')), '')
      )
    ),
    ''
  );

  if computed_display_name is null then
    raise exception 'First name and last name are required';
  end if;

  if nullif(btrim(coalesce(p_id_photo_uri, '')), '') is null then
    raise exception 'A valid ID document is required';
  end if;

  insert into public.profiles (user_id, display_name)
  values (caller_id, computed_display_name)
  on conflict on constraint profiles_pkey do nothing;

  return query
  update public.profiles p
  set
    display_name = computed_display_name,
    id_photo_uri = nullif(btrim(coalesce(p_id_photo_uri, '')), ''),
    resume_uri = nullif(btrim(coalesce(p_resume_uri, '')), ''),
    birth_date = coalesce(p_birth_date, p.birth_date),
    id_verification_status = 'pending_review',
    verification_submitted_at = now(),
    updated_at = now()
  where p.user_id = caller_id
  returning
    p.user_id,
    p.display_name,
    p.id_photo_uri,
    p.resume_uri,
    p.id_verification_status,
    p.verification_submitted_at;
end;
$$;

grant execute on function public.rpc_update_profile(uuid, text, text, text, text, text, text, date) to authenticated, service_role;
grant execute on function public.rpc_submit_verification(text, text, text, text, date) to authenticated, service_role;
