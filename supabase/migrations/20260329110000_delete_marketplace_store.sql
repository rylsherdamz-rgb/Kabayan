-- Allow a vendor to delete an entire store and all listings under that store name.

create or replace function public.rpc_delete_marketplace_store(
  p_store_name text
)
returns table (
  deleted_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  listing_ids uuid[];
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  if nullif(btrim(coalesce(p_store_name, '')), '') is null then
    raise exception 'Store name is required';
  end if;

  select coalesce(array_agg(m.id), '{}'::uuid[])
  into listing_ids
  from public.marketplace_listings m
  where m.vendor_id = caller_id
    and lower(btrim(m.store_name)) = lower(btrim(p_store_name));

  if coalesce(array_length(listing_ids, 1), 0) = 0 then
    raise exception 'Store not found';
  end if;

  delete from public.vendor_reviews vr
  where vr.listing_id = any(listing_ids);

  delete from public.marketplace_orders mo
  where mo.listing_id = any(listing_ids);

  delete from public.marketplace_listings m
  where m.id = any(listing_ids);

  return query
  select coalesce(array_length(listing_ids, 1), 0)::bigint as deleted_count;
end;
$$;

grant execute on function public.rpc_delete_marketplace_store(text) to authenticated, service_role;
