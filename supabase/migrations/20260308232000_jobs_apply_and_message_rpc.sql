-- Job actions RPC: apply to job and message employer conversation bootstrap.

-- Recreate with employer_id in payload so client can route to employer chat.
drop function if exists public.rpc_get_job_by_id(uuid);

create or replace function public.rpc_get_job_by_id(p_job_id uuid)
returns table (
  id uuid,
  employer_id uuid,
  title text,
  description text,
  location_label text,
  budget_min numeric,
  budget_max numeric,
  is_urgent boolean,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    j.id,
    j.employer_id,
    j.title,
    j.description,
    j.location_label,
    j.budget_min,
    j.budget_max,
    j.is_urgent,
    j.status,
    j.created_at
  from public.jobs j
  where j.id = p_job_id
  limit 1;
$$;

create or replace function public.rpc_apply_to_job(
  p_job_id uuid,
  p_cover_letter text default null,
  p_expected_rate numeric default null,
  p_resume_uri text default null,
  p_answers jsonb default '{}'::jsonb,
  p_availability_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  job_employer_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select j.employer_id
  into job_employer_id
  from public.jobs j
  where j.id = p_job_id
  limit 1;

  if job_employer_id is null then
    raise exception 'Job not found';
  end if;

  if job_employer_id = auth.uid() then
    raise exception 'You cannot apply to your own job';
  end if;

  if exists (
    select 1
    from public.job_applications ja
    where ja.job_id = p_job_id
      and ja.applicant_id = auth.uid()
  ) then
    raise exception 'You already applied to this job';
  end if;

  insert into public.job_applications (
    job_id,
    applicant_id,
    cover_letter,
    expected_rate,
    resume_uri,
    answers,
    availability_note
  )
  values (
    p_job_id,
    auth.uid(),
    nullif(btrim(coalesce(p_cover_letter, '')), ''),
    p_expected_rate,
    nullif(btrim(coalesce(p_resume_uri, '')), ''),
    coalesce(p_answers, '{}'::jsonb),
    nullif(btrim(coalesce(p_availability_note, '')), '')
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.rpc_open_job_conversation(
  p_job_id uuid,
  p_employer_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  verified_employer_id uuid;
  participant_a text;
  participant_b text;
  new_room_id text;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select j.employer_id
  into verified_employer_id
  from public.jobs j
  where j.id = p_job_id
  limit 1;

  if verified_employer_id is null then
    raise exception 'Job not found';
  end if;

  if verified_employer_id <> p_employer_id then
    raise exception 'Employer mismatch for job';
  end if;

  if caller_id = p_employer_id then
    raise exception 'You cannot message yourself';
  end if;

  participant_a := least(caller_id::text, p_employer_id::text);
  participant_b := greatest(caller_id::text, p_employer_id::text);
  new_room_id := 'job:' || p_job_id::text || ':' || participant_a || ':' || participant_b;

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, caller_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, p_employer_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  return new_room_id;
end;
$$;

grant execute on function public.rpc_get_job_by_id(uuid) to anon, authenticated, service_role;
grant execute on function public.rpc_apply_to_job(uuid, text, numeric, text, jsonb, text) to authenticated, service_role;
grant execute on function public.rpc_open_job_conversation(uuid, uuid) to authenticated, service_role;
