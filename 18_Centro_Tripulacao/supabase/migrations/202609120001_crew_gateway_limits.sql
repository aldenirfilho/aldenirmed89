-- Apply AFTER ../scripts/supabase-schema.sql, first in a staging project.
-- New private quota state only. No existing table or policy is removed.
begin;
create table if not exists public.crew_gateway_limits (
  scope text not null check (scope in ('manifestations','analytics')),
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  bucket_start timestamptz not null,
  hits integer not null check (hits > 0),
  primary key (scope,subject_hash,bucket_start)
);
alter table public.crew_gateway_limits enable row level security;
revoke all on public.crew_gateway_limits from public, anon, authenticated;

create or replace function public.crew_consume_gateway_quota(p_scope text,p_subject_hash text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_limit integer;
  v_count integer;
  v_bucket timestamptz := date_trunc('hour',now() at time zone 'UTC') at time zone 'UTC';
begin
  if p_scope is null or p_scope not in ('manifestations','analytics')
    or p_subject_hash is null or p_subject_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid quota request';
  end if;
  v_limit := case when p_scope='manifestations' then 5 else 60 end;
  insert into public.crew_gateway_limits(scope,subject_hash,bucket_start,hits)
  values(p_scope,p_subject_hash,v_bucket,1)
  on conflict(scope,subject_hash,bucket_start) do update
    set hits=public.crew_gateway_limits.hits+1
    where public.crew_gateway_limits.hits < v_limit
  returning hits into v_count;
  return coalesce(v_count <= v_limit,false);
end;
$$;
revoke all on function public.crew_consume_gateway_quota(text,text) from public,anon,authenticated;
grant execute on function public.crew_consume_gateway_quota(text,text) to service_role;
comment on table public.crew_gateway_limits is
  'Private hourly gateway quota; HMAC of authenticated account rotates by UTC day. No email, raw IP, bearer or body. Define retention in operations; no automated deletion is installed.';
commit;
