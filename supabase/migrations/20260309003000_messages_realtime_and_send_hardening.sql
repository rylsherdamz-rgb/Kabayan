-- Messaging hardening:
-- 1) Ensure messages stream through Supabase Realtime publication
-- 2) Harden rpc_send_message so sender must belong to parsed room
-- 3) Repair/maintain conversation_reads rows so both sides can see/reply

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
  caller_id uuid;
  other_user_id uuid;
  parsed_a uuid;
  parsed_b uuid;
  normalized_content text;
  new_id uuid;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  if caller_id <> p_sender_id then
    raise exception 'sender_id must match authenticated user';
  end if;

  if p_room_id is null or btrim(p_room_id) = '' then
    raise exception 'room_id is required';
  end if;

  normalized_content := nullif(btrim(coalesce(p_content, '')), '');
  if normalized_content is null then
    raise exception 'Message content is required';
  end if;

  if p_room_id ~ '^job:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$' then
    parsed_a := split_part(p_room_id, ':', 3)::uuid;
    parsed_b := split_part(p_room_id, ':', 4)::uuid;
  elsif p_room_id ~ '^dm:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$' then
    parsed_a := split_part(p_room_id, ':', 2)::uuid;
    parsed_b := split_part(p_room_id, ':', 3)::uuid;
  end if;

  if parsed_a is not null and parsed_b is not null then
    if p_sender_id <> parsed_a and p_sender_id <> parsed_b then
      raise exception 'Sender is not part of this conversation';
    end if;

    other_user_id := case when p_sender_id = parsed_a then parsed_b else parsed_a end;

    -- Sender has read up to their own outbound message.
    insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
    values (p_room_id, p_sender_id, now(), now())
    on conflict (room_id, user_id)
    do update set
      last_read_at = excluded.last_read_at,
      updated_at = excluded.updated_at;

    -- Ensure receiver has the room row so it appears in their inbox.
    insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
    values (p_room_id, other_user_id, 'epoch'::timestamptz, now())
    on conflict (room_id, user_id)
    do update set
      updated_at = now();
  else
    -- Legacy/custom room id: at least guarantee sender has a room row.
    insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
    values (p_room_id, p_sender_id, now(), now())
    on conflict (room_id, user_id)
    do update set
      last_read_at = excluded.last_read_at,
      updated_at = excluded.updated_at;
  end if;

  insert into public.messages (room_id, sender_id, content)
  values (p_room_id, p_sender_id, normalized_content)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.rpc_send_message(text, uuid, text) to authenticated, service_role;

-- Backfill known room participants into conversation_reads for existing threads.
with parsed_rooms as (
  select distinct
    m.room_id,
    case
      when m.room_id ~ '^job:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
        then split_part(m.room_id, ':', 3)::uuid
      when m.room_id ~ '^dm:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
        then split_part(m.room_id, ':', 2)::uuid
      else null
    end as user_a,
    case
      when m.room_id ~ '^job:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
        then split_part(m.room_id, ':', 4)::uuid
      when m.room_id ~ '^dm:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
        then split_part(m.room_id, ':', 3)::uuid
      else null
    end as user_b
  from public.messages m
)
insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
select
  pr.room_id,
  participants.user_id,
  'epoch'::timestamptz,
  now()
from parsed_rooms pr
cross join lateral (
  values (pr.user_a), (pr.user_b)
) as participants(user_id)
where participants.user_id is not null
on conflict (room_id, user_id)
do update set
  updated_at = now();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'messages'
     ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
end;
$$;
