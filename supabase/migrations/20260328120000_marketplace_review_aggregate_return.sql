-- Return fresh listing aggregates immediately after creating a marketplace review.

drop function if exists public.rpc_create_marketplace_review(uuid, integer, text);

create or replace function public.rpc_create_marketplace_review(
  p_listing_id uuid,
  p_rating integer,
  p_comment text default null
)
returns table (
  review_id uuid,
  avg_rating numeric,
  review_count bigint
)
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

  return query
  select
    new_id as review_id,
    coalesce(round(avg(vr.rating)::numeric, 1), 0::numeric) as avg_rating,
    count(vr.id)::bigint as review_count
  from public.vendor_reviews vr
  where vr.listing_id = p_listing_id;
end;
$$;

grant execute on function public.rpc_create_marketplace_review(uuid, integer, text) to authenticated, service_role;
