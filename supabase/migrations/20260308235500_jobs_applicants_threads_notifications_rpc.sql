-- Jobs + messaging enhancements:
-- 1) apply-to-job creates employer notifications
-- 2) conversation threads include other participant metadata
-- 3) employer can list applicants for their jobs
-- 4) unified room opener for employer<->applicant/job owner conversations
-- 5) direct conversations and people search for connect screen

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
  job_title text;
  applicant_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select j.employer_id, j.title
  into job_employer_id, job_title
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

  select coalesce(nullif(btrim(p.display_name), ''), 'A worker')
  into applicant_name
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1;

  insert into public.app_notifications (
    user_id,
    category,
    title,
    body,
    entity_type,
    entity_id
  )
  values (
    job_employer_id,
    'job_application',
    'New job applicant',
    applicant_name || ' applied to your job: ' || coalesce(job_title, 'Untitled Job'),
    'job_application',
    new_id
  );

  return new_id;
end;
$$;

create or replace function public.rpc_get_conversation_threads_for_user(p_user_id uuid)
returns table (
  room_id text,
  last_message text,
  last_sender_id uuid,
  last_time timestamptz,
  other_user_id uuid,
  other_display_name text,
  other_avatar_url text,
  job_id uuid,
  job_title text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'Requested user does not match authenticated user';
  end if;

  return query
  with room_candidates as (
    select distinct cr.room_id
    from public.conversation_reads cr
    where cr.user_id = p_user_id

    union

    select distinct m.room_id
    from public.messages m
    where m.sender_id = p_user_id
  ),
  latest_message as (
    select distinct on (m.room_id)
      m.room_id,
      m.content,
      m.sender_id,
      m.created_at
    from public.messages m
    join room_candidates rc on rc.room_id = m.room_id
    order by m.room_id, m.created_at desc
  ),
  parsed_room as (
    select
      rc.room_id,
      case
        when rc.room_id ~ '^job:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
          then split_part(rc.room_id, ':', 2)::uuid
        else null
      end as parsed_job_id,
      case
        when rc.room_id ~ '^job:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
          then split_part(rc.room_id, ':', 3)::uuid
        when rc.room_id ~ '^dm:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
          then split_part(rc.room_id, ':', 2)::uuid
        else null
      end as participant_a,
      case
        when rc.room_id ~ '^job:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
          then split_part(rc.room_id, ':', 4)::uuid
        when rc.room_id ~ '^dm:[0-9a-fA-F-]{36}:[0-9a-fA-F-]{36}$'
          then split_part(rc.room_id, ':', 3)::uuid
        else null
      end as participant_b
    from room_candidates rc
  ),
  other_party as (
    select
      pr.room_id,
      pr.parsed_job_id,
      case
        when pr.participant_a = p_user_id then pr.participant_b
        when pr.participant_b = p_user_id then pr.participant_a
        else null
      end as resolved_other_user_id
    from parsed_room pr
  )
  select
    rc.room_id,
    coalesce(lm.content, '') as last_message,
    lm.sender_id as last_sender_id,
    lm.created_at as last_time,
    op.resolved_other_user_id as other_user_id,
    coalesce(nullif(btrim(pp.display_name), ''), 'Unknown User') as other_display_name,
    pp.avatar_url as other_avatar_url,
    op.parsed_job_id as job_id,
    j.title as job_title
  from room_candidates rc
  left join latest_message lm on lm.room_id = rc.room_id
  left join other_party op on op.room_id = rc.room_id
  left join public.profiles pp on pp.user_id = op.resolved_other_user_id
  left join public.jobs j on j.id = op.parsed_job_id
  order by coalesce(lm.created_at, 'epoch'::timestamptz) desc;
end;
$$;

create or replace function public.rpc_get_employer_job_applicants(p_employer_id uuid)
returns table (
  job_id uuid,
  job_title text,
  application_id uuid,
  applicant_id uuid,
  applicant_name text,
  applicant_avatar_url text,
  cover_letter text,
  expected_rate numeric,
  status text,
  applied_at timestamptz,
  availability_note text,
  resume_uri text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_employer_id then
    raise exception 'Requested user does not match authenticated user';
  end if;

  return query
  select
    j.id as job_id,
    j.title as job_title,
    ja.id as application_id,
    ja.applicant_id,
    coalesce(nullif(btrim(p.display_name), ''), 'Unknown Applicant') as applicant_name,
    p.avatar_url as applicant_avatar_url,
    ja.cover_letter,
    ja.expected_rate,
    ja.status,
    ja.created_at as applied_at,
    ja.availability_note,
    ja.resume_uri
  from public.jobs j
  join public.job_applications ja on ja.job_id = j.id
  left join public.profiles p on p.user_id = ja.applicant_id
  where j.employer_id = p_employer_id
  order by j.created_at desc, ja.created_at desc;
end;
$$;

create or replace function public.rpc_open_job_conversation_with_user(
  p_job_id uuid,
  p_other_user_id uuid
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

  if p_other_user_id is null then
    raise exception 'Missing user to message';
  end if;

  if caller_id = p_other_user_id then
    raise exception 'You cannot message yourself';
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
    if not exists (
      select 1
      from public.job_applications ja
      where ja.job_id = p_job_id
        and ja.applicant_id = p_other_user_id
    ) then
      raise exception 'This user has not applied to the job';
    end if;
  else
    if p_other_user_id <> employer_id then
      raise exception 'Workers can only message the employer for this job';
    end if;
  end if;

  participant_a := least(caller_id::text, p_other_user_id::text);
  participant_b := greatest(caller_id::text, p_other_user_id::text);
  new_room_id := 'job:' || p_job_id::text || ':' || participant_a || ':' || participant_b;

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, caller_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, p_other_user_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  return new_room_id;
end;
$$;

create or replace function public.rpc_open_direct_conversation(
  p_other_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  participant_a text;
  participant_b text;
  new_room_id text;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_other_user_id is null then
    raise exception 'Missing user to message';
  end if;

  if caller_id = p_other_user_id then
    raise exception 'You cannot message yourself';
  end if;

  participant_a := least(caller_id::text, p_other_user_id::text);
  participant_b := greatest(caller_id::text, p_other_user_id::text);
  new_room_id := 'dm:' || participant_a || ':' || participant_b;

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, caller_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  insert into public.conversation_reads (room_id, user_id, last_read_at, updated_at)
  values (new_room_id, p_other_user_id, now(), now())
  on conflict (room_id, user_id)
  do update set updated_at = now();

  return new_room_id;
end;
$$;

create or replace function public.rpc_search_people(
  p_user_id uuid,
  p_query text default ''
)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  location_label text,
  job_role text,
  market_role text,
  id_verification_status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'Requested user does not match authenticated user';
  end if;

  return query
  select
    p.user_id,
    coalesce(nullif(btrim(p.display_name), ''), 'Unnamed User') as display_name,
    p.avatar_url,
    p.location_label,
    p.job_role,
    p.market_role,
    p.id_verification_status
  from public.profiles p
  where p.user_id <> p_user_id
    and not exists (
      select 1
      from public.user_blocks ub
      where (ub.blocker_id = p_user_id and ub.blocked_user_id = p.user_id)
         or (ub.blocker_id = p.user_id and ub.blocked_user_id = p_user_id)
    )
    and (
      btrim(coalesce(p_query, '')) = ''
      or coalesce(p.display_name, '') ilike '%' || p_query || '%'
      or coalesce(p.location_label, '') ilike '%' || p_query || '%'
      or coalesce(p.job_role, '') ilike '%' || p_query || '%'
      or coalesce(p.market_role, '') ilike '%' || p_query || '%'
    )
  order by
    case when p.id_verification_status = 'verified' then 0 else 1 end,
    p.updated_at desc
  limit 100;
end;
$$;

grant execute on function public.rpc_apply_to_job(uuid, text, numeric, text, jsonb, text) to authenticated, service_role;
grant execute on function public.rpc_get_conversation_threads_for_user(uuid) to authenticated, service_role;
grant execute on function public.rpc_get_employer_job_applicants(uuid) to authenticated, service_role;
grant execute on function public.rpc_open_job_conversation_with_user(uuid, uuid) to authenticated, service_role;
grant execute on function public.rpc_open_direct_conversation(uuid) to authenticated, service_role;
grant execute on function public.rpc_search_people(uuid, text) to authenticated, service_role;
