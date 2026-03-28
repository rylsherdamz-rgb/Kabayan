-- Expose store-level permit/verification status in marketplace feed.

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
    coalesce(nullif(btrim(p.display_name), ''), 'Unnamed Store') as store_name,
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
    p.display_name,
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

grant execute on function public.rpc_get_marketplace_listings_feed() to anon, authenticated, service_role;
