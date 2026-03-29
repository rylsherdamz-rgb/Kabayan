-- Separate store identity from profile display name for marketplace listings.

alter table public.marketplace_listings
add column if not exists store_name text;

update public.marketplace_listings m
set store_name = coalesce(nullif(btrim(p.display_name), ''), 'Unnamed Store')
from public.profiles p
where p.user_id = m.vendor_id
  and nullif(btrim(coalesce(m.store_name, '')), '') is null;

update public.marketplace_listings
set store_name = 'Unnamed Store'
where nullif(btrim(coalesce(store_name, '')), '') is null;

alter table public.marketplace_listings
alter column store_name set not null;

drop function if exists public.rpc_create_marketplace_listing(uuid, text, text, text, numeric, text, double precision, double precision, text, boolean);

create or replace function public.rpc_create_marketplace_listing(
  p_vendor_id uuid,
  p_store_name text,
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

  if nullif(btrim(coalesce(p_store_name, '')), '') is null then
    raise exception 'Store name is required';
  end if;

  insert into public.marketplace_listings (
    vendor_id,
    store_name,
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
    btrim(p_store_name),
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

drop function if exists public.rpc_update_marketplace_listing(uuid, text, text, text, numeric, text, double precision, double precision, text, boolean);

create or replace function public.rpc_update_marketplace_listing(
  p_listing_id uuid,
  p_store_name text,
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
  store_name text,
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

  if nullif(btrim(coalesce(p_store_name, '')), '') is null then
    raise exception 'Store name is required';
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
    store_name = btrim(p_store_name),
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
    m.store_name,
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

drop function if exists public.rpc_get_marketplace_listings_feed();

create or replace function public.rpc_get_marketplace_listings_feed()
returns table (
  id uuid,
  vendor_id uuid,
  store_name text,
  store_permit_verified boolean,
  name text,
  description text,
  category text,
  price numeric,
  location_label text,
  image_url text,
  is_open boolean,
  created_at timestamptz,
  avg_rating numeric,
  review_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.vendor_id,
    coalesce(nullif(btrim(m.store_name), ''), 'Unnamed Store') as store_name,
    coalesce(p.id_verification_status = 'verified', false) as store_permit_verified,
    m.name,
    m.description,
    m.category,
    m.price,
    m.location_label,
    m.image_url,
    m.is_open,
    m.created_at,
    coalesce(round(avg(vr.rating)::numeric, 1), 0::numeric) as avg_rating,
    count(vr.id)::bigint as review_count
  from public.marketplace_listings m
  left join public.profiles p on p.user_id = m.vendor_id
  left join public.vendor_reviews vr on vr.listing_id = m.id
  group by
    m.id,
    m.vendor_id,
    m.store_name,
    p.id_verification_status,
    m.name,
    m.description,
    m.category,
    m.price,
    m.location_label,
    m.image_url,
    m.is_open,
    m.created_at
  order by m.created_at desc;
$$;

grant execute on function public.rpc_create_marketplace_listing(uuid, text, text, text, text, numeric, text, double precision, double precision, text, boolean) to authenticated, service_role;
grant execute on function public.rpc_update_marketplace_listing(uuid, text, text, text, text, numeric, text, double precision, double precision, text, boolean) to authenticated, service_role;
grant execute on function public.rpc_get_marketplace_listings_feed() to anon, authenticated, service_role;
