-- Marketplace review RPCs and feed endpoints with real rating aggregates.

create or replace function public.rpc_get_marketplace_listings_feed()
returns table (
  id uuid,
  vendor_id uuid,
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
  left join public.vendor_reviews vr on vr.listing_id = m.id
  group by
    m.id,
    m.vendor_id,
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

create or replace function public.rpc_get_marketplace_reviews(p_listing_id uuid)
returns table (
  id uuid,
  listing_id uuid,
  buyer_id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  reviewer_name text,
  reviewer_avatar_url text
)
language sql
security definer
set search_path = public
as $$
  select
    vr.id,
    vr.listing_id,
    vr.buyer_id,
    vr.rating,
    vr.comment,
    vr.created_at,
    coalesce(nullif(btrim(p.display_name), ''), 'Community Member') as reviewer_name,
    p.avatar_url as reviewer_avatar_url
  from public.vendor_reviews vr
  left join public.profiles p on p.user_id = vr.buyer_id
  where vr.listing_id = p_listing_id
  order by vr.created_at desc;
$$;

create or replace function public.rpc_create_marketplace_review(
  p_listing_id uuid,
  p_rating integer,
  p_comment text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  listing_vendor_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_rating < 1 or p_rating > 5 then
    raise exception 'rating must be between 1 and 5';
  end if;

  select m.vendor_id
  into listing_vendor_id
  from public.marketplace_listings m
  where m.id = p_listing_id
  limit 1;

  if listing_vendor_id is null then
    raise exception 'Listing not found';
  end if;

  if listing_vendor_id = auth.uid() then
    raise exception 'You cannot review your own listing';
  end if;

  insert into public.vendor_reviews (listing_id, buyer_id, rating, comment)
  values (p_listing_id, auth.uid(), p_rating, nullif(btrim(p_comment), ''))
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.rpc_get_marketplace_listings_feed() to anon, authenticated, service_role;
grant execute on function public.rpc_get_marketplace_reviews(uuid) to anon, authenticated, service_role;
grant execute on function public.rpc_create_marketplace_review(uuid, integer, text) to authenticated, service_role;
