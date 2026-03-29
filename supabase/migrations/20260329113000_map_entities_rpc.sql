-- Unified map feed for jobs and marketplace pins.

create or replace function public.rpc_get_map_entities()
returns table (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  location_label text,
  latitude double precision,
  longitude double precision,
  is_open boolean,
  price numeric
)
language sql
security definer
set search_path = public
as $$
  select
    'job'::text as entity_type,
    j.id as entity_id,
    j.title,
    'Job opening'::text as subtitle,
    j.location_label,
    j.latitude,
    j.longitude,
    j.status = 'open' as is_open,
    null::numeric as price
  from public.jobs j
  where j.latitude is not null
    and j.longitude is not null

  union all

  select
    'listing'::text as entity_type,
    m.id as entity_id,
    m.name as title,
    coalesce(nullif(btrim(m.store_name), ''), 'Unnamed Store') as subtitle,
    m.location_label,
    m.latitude,
    m.longitude,
    m.is_open,
    m.price
  from public.marketplace_listings m
  where m.latitude is not null
    and m.longitude is not null;
$$;

grant execute on function public.rpc_get_map_entities() to anon, authenticated, service_role;
