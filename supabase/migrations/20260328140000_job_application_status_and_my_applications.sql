-- Employer actions for job applications plus worker-side application status feed.

create or replace function public.rpc_set_job_application_status(
  p_application_id uuid,
  p_status text
)
returns table (
  application_id uuid,
  job_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  owner_id uuid;
  target_job_id uuid;
  normalized_status text;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  normalized_status := lower(coalesce(p_status, ''));
  if normalized_status not in ('accepted', 'rejected', 'pending') then
    raise exception 'Invalid application status';
  end if;

  select j.employer_id, ja.job_id
  into owner_id, target_job_id
  from public.job_applications ja
  join public.jobs j on j.id = ja.job_id
  where ja.id = p_application_id
  limit 1;

  if owner_id is null then
    raise exception 'Application not found';
  end if;

  if owner_id <> caller_id then
    raise exception 'Only the job owner can update this application';
  end if;

  return query
  update public.job_applications ja
  set
    status = normalized_status,
    updated_at = now()
  where ja.id = p_application_id
  returning ja.id, ja.job_id, ja.status;
end;
$$;

create or replace function public.rpc_get_my_job_applications()
returns table (
  application_id uuid,
  job_id uuid,
  job_title text,
  employer_id uuid,
  employer_name text,
  location_label text,
  status text,
  applied_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    ja.id as application_id,
    j.id as job_id,
    j.title as job_title,
    j.employer_id,
    coalesce(nullif(btrim(p.display_name), ''), 'Employer') as employer_name,
    j.location_label,
    ja.status,
    ja.created_at as applied_at
  from public.job_applications ja
  join public.jobs j on j.id = ja.job_id
  left join public.profiles p on p.user_id = j.employer_id
  where ja.applicant_id = auth.uid()
  order by ja.created_at desc;
$$;

grant execute on function public.rpc_set_job_application_status(uuid, text) to authenticated, service_role;
grant execute on function public.rpc_get_my_job_applications() to authenticated, service_role;
