-- Compatibility RPC for opening a job conversation using job_id only.
-- This avoids client dependence on employer_id being present in job payloads.

create or replace function public.rpc_open_job_conversation_for_job(
  p_job_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  employer_id uuid;
  participant_a text;
  participant_b text;
  new_room_id text;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select j.employer_id
  into employer_id
  from public.jobs j
  where j.id = p_job_id
  limit 1;

  if employer_id is null then
    raise exception 'Job not found';
  end if;

  if caller_id = employer_id then
    raise exception 'You cannot message yourself';
  end if;

  participant_a := least(caller_id::text, employer_id::text);
  participant_b := greatest(caller_id::text, employer_id::text);
  new_room_id := 'job:' || p_job_id::text || ':' || participant_a || ':' || participant_b;

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, caller_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, employer_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  return new_room_id;
end;
$$;

grant execute on function public.rpc_open_job_conversation_for_job(uuid) to authenticated, service_role;
