-- Add buyer ordering flow for marketplace listings.

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  vendor_id uuid not null,
  buyer_id uuid not null,
  quantity integer not null default 1 check (quantity > 0),
  delivery_mode text not null default 'pickup' check (delivery_mode in ('pickup', 'delivery')),
  delivery_address text,
  notes text,
  total_amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_orders_buyer_idx
  on public.marketplace_orders (buyer_id, created_at desc);

create index if not exists marketplace_orders_vendor_idx
  on public.marketplace_orders (vendor_id, created_at desc);

create index if not exists marketplace_orders_listing_idx
  on public.marketplace_orders (listing_id, created_at desc);

create or replace function public.rpc_create_marketplace_order(
  p_listing_id uuid,
  p_quantity integer default 1,
  p_delivery_mode text default 'pickup',
  p_delivery_address text default null,
  p_notes text default null
)
returns table (
  id uuid,
  status text,
  total_amount numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  listing_record public.marketplace_listings%rowtype;
  resolved_quantity integer;
  resolved_mode text;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  resolved_quantity := greatest(coalesce(p_quantity, 1), 1);
  resolved_mode := case
    when p_delivery_mode in ('pickup', 'delivery') then p_delivery_mode
    else 'pickup'
  end;

  select *
  into listing_record
  from public.marketplace_listings m
  where m.id = p_listing_id
  limit 1;

  if listing_record.id is null then
    raise exception 'Listing not found';
  end if;

  if not coalesce(listing_record.is_open, false) then
    raise exception 'This item is currently unavailable';
  end if;

  if listing_record.vendor_id = caller_id then
    raise exception 'You cannot order your own listing';
  end if;

  if resolved_mode = 'delivery' and nullif(btrim(coalesce(p_delivery_address, '')), '') is null then
    raise exception 'Delivery address is required';
  end if;

  return query
  insert into public.marketplace_orders (
    listing_id,
    vendor_id,
    buyer_id,
    quantity,
    delivery_mode,
    delivery_address,
    notes,
    total_amount,
    status
  )
  values (
    listing_record.id,
    listing_record.vendor_id,
    caller_id,
    resolved_quantity,
    resolved_mode,
    nullif(btrim(coalesce(p_delivery_address, '')), ''),
    nullif(btrim(coalesce(p_notes, '')), ''),
    coalesce(listing_record.price, 0) * resolved_quantity,
    'pending'
  )
  returning
    marketplace_orders.id,
    marketplace_orders.status,
    marketplace_orders.total_amount,
    marketplace_orders.created_at;
end;
$$;

grant execute on function public.rpc_create_marketplace_order(uuid, integer, text, text, text) to authenticated, service_role;
