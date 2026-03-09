-- Owner editing + open/close controls for jobs and marketplace listings.

create or replace function public.rpc_update_job(
  p_job_id uuid,
  p_title text,
  p_description text,
  p_requirements text[] default '{}'::text[],
  p_budget_min numeric default 0,
  p_budget_max numeric default 0,
  p_location_label text,
  p_latitude double precision,
  p_longitude double precision,
  p_is_urgent boolean default false,
  p_status text default null
)
returns table (
  id uuid,
  employer_id uuid,
  title text,
  description text,
  requirements text[],
  budget_min numeric,
  budget_max numeric,
  location_label text,
  latitude double precision,
  longitude double precision,
  is_urgent boolean,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  owner_id uuid;
  resolved_status text;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select j.employer_id into owner_id
  from public.jobs j
  where j.id = p_job_id
  limit 1;

  if owner_id is null then
    raise exception 'Job not found';
  end if;

  if owner_id <> caller_id then
    raise exception 'Only the job owner can edit this job';
  end if;

  if nullif(btrim(coalesce(p_title, '')), '') is null then
    raise exception 'Job title is required';
  end if;

  if nullif(btrim(coalesce(p_description, '')), '') is null then
    raise exception 'Job description is required';
  end if;

  if nullif(btrim(coalesce(p_location_label, '')), '') is null then
    raise exception 'Job location is required';
  end if;

  if coalesce(p_budget_min, 0) < 0 or coalesce(p_budget_max, 0) < 0 then
    raise exception 'Budget values must be non-negative';
  end if;

  if coalesce(p_budget_max, 0) < coalesce(p_budget_min, 0) then
    raise exception 'Maximum budget must be greater than or equal to minimum budget';
  end if;

  resolved_status := case
    when p_status in ('open', 'closed') then p_status
    else null
  end;

  return query
  update public.jobs j
  set
    title = btrim(p_title),
    description = btrim(p_description),
    requirements = coalesce(p_requirements, '{}'::text[]),
    budget_min = coalesce(p_budget_min, 0),
    budget_max = coalesce(p_budget_max, 0),
    location_label = btrim(p_location_label),
    latitude = p_latitude,
    longitude = p_longitude,
    is_urgent = coalesce(p_is_urgent, false),
    status = coalesce(resolved_status, j.status),
    updated_at = now()
  where j.id = p_job_id
  returning
    j.id,
    j.employer_id,
    j.title,
    j.description,
    j.requirements,
    j.budget_min,
    j.budget_max,
    j.location_label,
    j.latitude,
    j.longitude,
    j.is_urgent,
    j.status,
    j.created_at,
    j.updated_at;
end;
$$;

create or replace function public.rpc_set_job_status(
  p_job_id uuid,
  p_status text
)
returns table (
  id uuid,
  status text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  owner_id uuid;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_status not in ('open', 'closed') then
    raise exception 'Invalid job status';
  end if;

  select j.employer_id into owner_id
  from public.jobs j
  where j.id = p_job_id
  limit 1;

  if owner_id is null then
    raise exception 'Job not found';
  end if;

  if owner_id <> caller_id then
    raise exception 'Only the job owner can update status';
  end if;

  return query
  update public.jobs j
  set
    status = p_status,
    updated_at = now()
  where j.id = p_job_id
  returning j.id, j.status, j.updated_at;
end;
$$;

create or replace function public.rpc_update_marketplace_listing(
  p_listing_id uuid,
  p_name text,
  p_description text,
  p_category text,
  p_price numeric,
  p_location_label text,
  p_latitude double precision,
  p_longitude double precision,
  p_image_url text default null,
  p_is_open boolean default null
)
returns table (
  id uuid,
  vendor_id uuid,
  name text,
  description text,
  category text,
  price numeric,
  location_label text,
  latitude double precision,
  longitude double precision,
  image_url text,
  is_open boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  owner_id uuid;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select m.vendor_id into owner_id
  from public.marketplace_listings m
  where m.id = p_listing_id
  limit 1;

  if owner_id is null then
    raise exception 'Listing not found';
  end if;

  if owner_id <> caller_id then
    raise exception 'Only the listing owner can edit this listing';
  end if;

  if nullif(btrim(coalesce(p_name, '')), '') is null then
    raise exception 'Listing name is required';
  end if;

  if nullif(btrim(coalesce(p_category, '')), '') is null then
    raise exception 'Listing category is required';
  end if;

  if nullif(btrim(coalesce(p_location_label, '')), '') is null then
    raise exception 'Listing location is required';
  end if;

  if coalesce(p_price, 0) < 0 then
    raise exception 'Price must be non-negative';
  end if;

  return query
  update public.marketplace_listings m
  set
    name = btrim(p_name),
    description = nullif(btrim(coalesce(p_description, '')), ''),
    category = btrim(p_category),
    price = coalesce(p_price, 0),
    location_label = btrim(p_location_label),
    latitude = p_latitude,
    longitude = p_longitude,
    image_url = case
      when p_image_url is null then m.image_url
      else nullif(btrim(coalesce(p_image_url, '')), '')
    end,
    is_open = coalesce(p_is_open, m.is_open),
    updated_at = now()
  where m.id = p_listing_id
  returning
    m.id,
    m.vendor_id,
    m.name,
    m.description,
    m.category,
    m.price,
    m.location_label,
    m.latitude,
    m.longitude,
    m.image_url,
    m.is_open,
    m.created_at,
    m.updated_at;
end;
$$;

create or replace function public.rpc_set_marketplace_listing_open_state(
  p_listing_id uuid,
  p_is_open boolean
)
returns table (
  id uuid,
  is_open boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  owner_id uuid;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select m.vendor_id into owner_id
  from public.marketplace_listings m
  where m.id = p_listing_id
  limit 1;

  if owner_id is null then
    raise exception 'Listing not found';
  end if;

  if owner_id <> caller_id then
    raise exception 'Only the listing owner can update open state';
  end if;

  return query
  update public.marketplace_listings m
  set
    is_open = coalesce(p_is_open, false),
    updated_at = now()
  where m.id = p_listing_id
  returning m.id, m.is_open, m.updated_at;
end;
$$;

grant execute on function public.rpc_update_job(uuid, text, text, text[], numeric, numeric, text, double precision, double precision, boolean, text) to authenticated, service_role;
grant execute on function public.rpc_set_job_status(uuid, text) to authenticated, service_role;

grant execute on function public.rpc_update_marketplace_listing(uuid, text, text, text, numeric, text, double precision, double precision, text, boolean) to authenticated, service_role;
grant execute on function public.rpc_set_marketplace_listing_open_state(uuid, boolean) to authenticated, service_role;
