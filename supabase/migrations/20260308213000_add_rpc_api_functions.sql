-- RPC API surface for app data access.
-- This enables the client to use `.rpc(...)` instead of direct table access.

create or replace function public.rpc_get_jobs()
returns table (
  id uuid,
  title text,
  description text,
  location_label text,
  budget_min numeric,
  budget_max numeric,
  is_urgent boolean,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    j.id,
    j.title,
    j.description,
    j.location_label,
    j.budget_min,
    j.budget_max,
    j.is_urgent,
    j.status,
    j.created_at
  from public.jobs j
  order by j.created_at desc;
$$;

create or replace function public.rpc_get_job_by_id(p_job_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  location_label text,
  budget_min numeric,
  budget_max numeric,
  is_urgent boolean,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    j.id,
    j.title,
    j.description,
    j.location_label,
    j.budget_min,
    j.budget_max,
    j.is_urgent,
    j.status,
    j.created_at
  from public.jobs j
  where j.id = p_job_id
  limit 1;
$$;

create or replace function public.rpc_create_job(
  p_employer_id uuid,
  p_title text,
  p_description text,
  p_requirements text[],
  p_budget_min numeric,
  p_budget_max numeric,
  p_location_label text,
  p_latitude double precision,
  p_longitude double precision,
  p_is_urgent boolean default false,
  p_status text default 'open'
)
returns table (
  id uuid,
  title text,
  description text,
  location_label text,
  budget_min numeric,
  budget_max numeric,
  is_urgent boolean,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_employer_id then
    raise exception 'employer_id must match authenticated user';
  end if;

  return query
  insert into public.jobs (
    employer_id,
    title,
    description,
    requirements,
    budget_min,
    budget_max,
    location_label,
    latitude,
    longitude,
    is_urgent,
    status
  )
  values (
    p_employer_id,
    p_title,
    p_description,
    coalesce(p_requirements, '{}'),
    coalesce(p_budget_min, 0),
    coalesce(p_budget_max, 0),
    p_location_label,
    p_latitude,
    p_longitude,
    coalesce(p_is_urgent, false),
    coalesce(p_status, 'open')
  )
  returning
    jobs.id,
    jobs.title,
    jobs.description,
    jobs.location_label,
    jobs.budget_min,
    jobs.budget_max,
    jobs.is_urgent,
    jobs.status,
    jobs.created_at;
end;
$$;

create or replace function public.rpc_get_marketplace_listings_basic()
returns table (
  id uuid,
  name text,
  category text,
  price numeric,
  location_label text,
  image_url text,
  description text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.name,
    m.category,
    m.price,
    m.location_label,
    m.image_url,
    m.description,
    m.created_at
  from public.marketplace_listings m
  order by m.created_at desc;
$$;

create or replace function public.rpc_get_marketplace_listings()
returns setof public.marketplace_listings
language sql
security definer
set search_path = public
as $$
  select m.*
  from public.marketplace_listings m
  order by m.created_at desc;
$$;

create or replace function public.rpc_create_marketplace_listing(
  p_vendor_id uuid,
  p_name text,
  p_description text,
  p_category text,
  p_price numeric,
  p_location_label text,
  p_latitude double precision,
  p_longitude double precision,
  p_image_url text default null,
  p_is_open boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_vendor_id then
    raise exception 'vendor_id must match authenticated user';
  end if;

  insert into public.marketplace_listings (
    vendor_id,
    name,
    description,
    category,
    price,
    location_label,
    latitude,
    longitude,
    image_url,
    is_open
  )
  values (
    p_vendor_id,
    p_name,
    p_description,
    p_category,
    p_price,
    p_location_label,
    p_latitude,
    p_longitude,
    p_image_url,
    coalesce(p_is_open, true)
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.rpc_get_messages_by_room(p_room_id text)
returns table (
  id uuid,
  room_id text,
  sender_id uuid,
  content text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.room_id,
    m.sender_id,
    m.content,
    m.created_at
  from public.messages m
  where m.room_id = p_room_id
  order by m.created_at asc;
$$;

create or replace function public.rpc_get_messages_for_user(p_user_id uuid)
returns table (
  id uuid,
  room_id text,
  sender_id uuid,
  content text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  has_receiver_column boolean;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'Requested user does not match authenticated user';
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'messages'
      and column_name = 'receiver_id'
  )
  into has_receiver_column;

  if has_receiver_column then
    return query execute $q$
      select
        m.id,
        m.room_id,
        m.sender_id,
        m.content,
        m.created_at
      from public.messages m
      where
        m.sender_id = $1
        or m.receiver_id = $1
        or exists (
          select 1
          from public.conversation_reads cr
          where cr.room_id = m.room_id
            and cr.user_id = $1
        )
      order by m.created_at desc
    $q$ using p_user_id;
  else
    return query execute $q$
      select
        m.id,
        m.room_id,
        m.sender_id,
        m.content,
        m.created_at
      from public.messages m
      where
        m.sender_id = $1
        or exists (
          select 1
          from public.conversation_reads cr
          where cr.room_id = m.room_id
            and cr.user_id = $1
        )
      order by m.created_at desc
    $q$ using p_user_id;
  end if;
end;
$$;

create or replace function public.rpc_send_message(
  p_room_id text,
  p_sender_id uuid,
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_sender_id then
    raise exception 'sender_id must match authenticated user';
  end if;

  insert into public.messages (room_id, sender_id, content)
  values (p_room_id, p_sender_id, p_content)
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.rpc_get_profile_summary(p_user_id uuid)
returns table (
  display_name text,
  id_verification_status text,
  location_label text
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

  return query
  select
    p.display_name,
    p.id_verification_status,
    p.location_label
  from public.profiles p
  where p.user_id = p_user_id
  limit 1;
end;
$$;

create or replace function public.rpc_get_profile_detail(p_user_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  job_role text,
  id_verification_status text,
  location_label text,
  created_at timestamptz
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

  return query
  select
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.job_role,
    p.id_verification_status,
    p.location_label,
    p.created_at
  from public.profiles p
  where p.user_id = p_user_id
  limit 1;
end;
$$;

create or replace function public.rpc_get_drawer_profile(p_user_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  id_verification_status text,
  job_role text,
  market_role text,
  location_label text
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

  return query
  select
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.id_verification_status,
    p.job_role,
    p.market_role,
    p.location_label
  from public.profiles p
  where p.user_id = p_user_id
  limit 1;
end;
$$;

create or replace function public.rpc_get_jobs_count_by_employer(p_employer_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_employer_id then
    raise exception 'Requested user does not match authenticated user';
  end if;

  return (
    select count(*)::bigint
    from public.jobs j
    where j.employer_id = p_employer_id
  );
end;
$$;

create or replace function public.rpc_get_listings_count_by_vendor(p_vendor_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_vendor_id then
    raise exception 'Requested user does not match authenticated user';
  end if;

  return (
    select count(*)::bigint
    from public.marketplace_listings m
    where m.vendor_id = p_vendor_id
  );
end;
$$;

grant execute on function public.rpc_get_jobs() to anon, authenticated, service_role;
grant execute on function public.rpc_get_job_by_id(uuid) to anon, authenticated, service_role;
grant execute on function public.rpc_create_job(uuid, text, text, text[], numeric, numeric, text, double precision, double precision, boolean, text) to authenticated, service_role;

grant execute on function public.rpc_get_marketplace_listings_basic() to anon, authenticated, service_role;
grant execute on function public.rpc_get_marketplace_listings() to anon, authenticated, service_role;
grant execute on function public.rpc_create_marketplace_listing(uuid, text, text, text, numeric, text, double precision, double precision, text, boolean) to authenticated, service_role;

grant execute on function public.rpc_get_messages_by_room(text) to authenticated, service_role;
grant execute on function public.rpc_get_messages_for_user(uuid) to authenticated, service_role;
grant execute on function public.rpc_send_message(text, uuid, text) to authenticated, service_role;

grant execute on function public.rpc_get_profile_summary(uuid) to authenticated, service_role;
grant execute on function public.rpc_get_profile_detail(uuid) to authenticated, service_role;
grant execute on function public.rpc_get_drawer_profile(uuid) to authenticated, service_role;
grant execute on function public.rpc_get_jobs_count_by_employer(uuid) to authenticated, service_role;
grant execute on function public.rpc_get_listings_count_by_vendor(uuid) to authenticated, service_role;
