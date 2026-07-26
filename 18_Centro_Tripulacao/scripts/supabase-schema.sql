-- Antigravity · Centro da Tripulação
-- Execute no SQL Editor de um projeto Supabase novo, revise e teste primeiro.
-- A service-role NÃO pertence ao navegador. Este esquema depende de RLS.

begin;

create extension if not exists pgcrypto;

create or replace function public.crew_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','owner')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  reason text check (char_length(reason) <= 300)
);

alter table public.admin_users
add column if not exists role text not null default 'admin'
check (role in ('admin','owner'));

create or replace function public.is_crew_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.is_crew_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid() and role = 'owner'
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  contact_email text check (char_length(contact_email) <= 254),
  occupation text check (char_length(occupation) <= 100),
  theme text not null default 'dark'
    check (theme in ('dark','light','system')),
  visual_profile text not null default 'aerospace'
    check (visual_profile in (
      'aerospace','aerospace-light','rustic-light','dark','minimal',
      'sepia','oceanic','green','natural','forest','wizard-academy',
      'comic-hero','modern-serious'
    )),
  language text not null default 'pt-BR' check (language in ('pt-BR','en')),
  notifications_enabled boolean not null default false,
  public_profile boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists crew_profiles_updated_at on public.profiles;
create trigger crew_profiles_updated_at
before update on public.profiles
for each row execute function public.crew_set_updated_at();

create or replace function public.crew_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, contact_email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists crew_auth_user_created on auth.users;
create trigger crew_auth_user_created
after insert on auth.users
for each row execute function public.crew_handle_new_user();

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254),
  status text not null default 'inactive'
    check (status in ('inactive','active','unsubscribed','bounced')),
  frequency text not null default 'daily' check (frequency = 'daily'),
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint active_subscription_requires_consent
    check (status <> 'active' or consent_at is not null)
);

drop trigger if exists crew_subscriptions_updated_at on public.subscriptions;
create trigger crew_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.crew_set_updated_at();

create table if not exists public.section_views (
  id bigint generated always as identity primary key,
  section_slug text not null
    check (section_slug ~ '^[a-z0-9][a-z0-9_-]{1,79}$'),
  user_id uuid references auth.users(id) on delete set null,
  session_hash text not null check (session_hash ~ '^[a-f0-9]{64}$'),
  view_date date not null default current_date,
  viewed_at timestamptz not null default now(),
  unique (section_slug, session_hash, view_date)
);

create index if not exists section_views_date_section_idx
on public.section_views (view_date desc, section_slug);

create table if not exists public.section_daily_aggregates (
  view_date date not null,
  section_slug text not null
    check (section_slug ~ '^[a-z0-9][a-z0-9_-]{1,79}$'),
  view_count bigint not null default 0 check (view_count >= 0),
  unique_sessions bigint not null default 0 check (unique_sessions >= 0),
  updated_at timestamptz not null default now(),
  primary key (view_date, section_slug)
);

create table if not exists public.manifestations (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique
    check (protocol ~ '^AG-[0-9]{4}-[A-F0-9]{16}$'),
  user_id uuid references auth.users(id) on delete set null,
  identity_mode text not null check (identity_mode in ('anonymous','identified')),
  contact_email text check (char_length(contact_email) <= 254),
  category text not null check (category in (
    'agradecimento','sugestao','contribuicao','informacao',
    'notificacao','reclamacao','outra'
  )),
  other_category text check (char_length(other_category) <= 80),
  subject text not null check (char_length(subject) between 4 and 140),
  body text not null check (char_length(body) between 10 and 5000),
  status text not null default 'received'
    check (status in ('received','in_review','waiting_crew','responded','closed')),
  consent_to_process_at timestamptz not null,
  consent_to_contact boolean not null default false,
  anonymous_access_hash text check (
    anonymous_access_hash is null or anonymous_access_hash ~ '^[a-f0-9]{64}$'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint other_manifestation_requires_detail
    check (category <> 'outra' or char_length(trim(other_category)) >= 2),
  constraint identified_manifestation_requires_user
    check (identity_mode <> 'identified' or user_id is not null),
  constraint anonymous_manifestation_has_no_user
    check (identity_mode <> 'anonymous' or user_id is null),
  constraint anonymous_manifestation_requires_secret
    check (identity_mode <> 'anonymous' or anonymous_access_hash is not null),
  constraint contact_requires_consent
    check (contact_email is null or consent_to_contact)
);

drop trigger if exists crew_manifestations_updated_at on public.manifestations;
create trigger crew_manifestations_updated_at
before update on public.manifestations
for each row execute function public.crew_set_updated_at();

create table if not exists public.manifestation_messages (
  id uuid primary key default gen_random_uuid(),
  manifestation_id uuid not null references public.manifestations(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_role text not null check (author_role in ('crew','admin')),
  body text not null check (char_length(body) between 2 and 3000),
  created_at timestamptz not null default now()
);

create table if not exists public.owner_documents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 160),
  category text not null check (category in (
    'biografia','curriculo','historia','experiencia','reflexao',
    'posicao','explicacao','legado'
  )),
  status text not null default 'draft'
    check (status in ('draft','review','private','publish-approved')),
  summary text check (char_length(summary) <= 600),
  content text not null check (char_length(content) between 10 and 30000),
  editorial_note text check (char_length(editorial_note) <= 2000),
  publication_workflow_reference text
    check (char_length(publication_workflow_reference) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publish_approval_requires_workflow
    check (
      status <> 'publish-approved'
      or char_length(trim(publication_workflow_reference)) >= 4
    )
);

drop trigger if exists crew_owner_documents_updated_at on public.owner_documents;
create trigger crew_owner_documents_updated_at
before update on public.owner_documents
for each row execute function public.crew_set_updated_at();

create table if not exists public.owner_credential_verifications (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  credential_type text not null check (char_length(credential_type) between 2 and 100),
  claimed_title text not null check (char_length(claimed_title) between 2 and 180),
  issuer text not null check (char_length(issuer) between 2 and 180),
  private_reference text check (char_length(private_reference) <= 500),
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','rejected','expired')),
  verification_method text check (char_length(verification_method) <= 300),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pending_credential_is_not_self_verified
    check (
      verification_status <> 'pending'
      or (verified_by is null and verified_at is null and verification_method is null)
    ),
  constraint verified_credential_has_audit
    check (
      verification_status <> 'verified'
      or (verified_by is not null and verified_at is not null and verification_method is not null)
    )
);

drop trigger if exists crew_owner_credentials_updated_at on public.owner_credential_verifications;
create trigger crew_owner_credentials_updated_at
before update on public.owner_credential_verifications
for each row execute function public.crew_set_updated_at();

create index if not exists manifestation_messages_thread_idx
on public.manifestation_messages (manifestation_id, created_at);

alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.section_views enable row level security;
alter table public.section_daily_aggregates enable row level security;
alter table public.manifestations enable row level security;
alter table public.manifestation_messages enable row level security;
alter table public.owner_documents enable row level security;
alter table public.owner_credential_verifications enable row level security;

drop policy if exists "admins can inspect admin roster" on public.admin_users;
create policy "admins can inspect admin roster"
on public.admin_users for select to authenticated
using (user_id = auth.uid() or public.is_crew_admin());

drop policy if exists "crew can read own profile" on public.profiles;
create policy "crew can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_crew_admin());

drop policy if exists "crew can update own profile" on public.profiles;
create policy "crew can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and (contact_email is null or contact_email = auth.jwt() ->> 'email')
);

drop policy if exists "crew can insert own profile" on public.profiles;
create policy "crew can insert own profile"
on public.profiles for insert to authenticated
with check (
  id = auth.uid()
  and (contact_email is null or contact_email = auth.jwt() ->> 'email')
);

drop policy if exists "crew and admins can read subscriptions" on public.subscriptions;
create policy "crew and admins can read subscriptions"
on public.subscriptions for select to authenticated
using (user_id = auth.uid() or public.is_crew_admin());

drop policy if exists "crew can create own subscription" on public.subscriptions;
create policy "crew can create own subscription"
on public.subscriptions for insert to authenticated
with check (user_id = auth.uid() and email = auth.jwt() ->> 'email');

drop policy if exists "crew can update own subscription" on public.subscriptions;
create policy "crew can update own subscription"
on public.subscriptions for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and email = auth.jwt() ->> 'email');

drop policy if exists "admins can inspect raw views" on public.section_views;
create policy "admins can inspect raw views"
on public.section_views for select to authenticated
using (public.is_crew_admin());

drop policy if exists "public can read aggregate views" on public.section_daily_aggregates;
create policy "public can read aggregate views"
on public.section_daily_aggregates for select to anon, authenticated
using (true);

drop policy if exists "crew can read only own manifestations" on public.manifestations;
create policy "crew can read only own manifestations"
on public.manifestations for select to authenticated
using (user_id = auth.uid() or public.is_crew_admin());

drop policy if exists "admins can update manifestations" on public.manifestations;
create policy "admins can update manifestations"
on public.manifestations for update to authenticated
using (public.is_crew_admin())
with check (public.is_crew_admin());

drop policy if exists "crew can read messages from own manifestations" on public.manifestation_messages;
create policy "crew can read messages from own manifestations"
on public.manifestation_messages for select to authenticated
using (
  public.is_crew_admin()
  or exists (
    select 1 from public.manifestations m
    where m.id = manifestation_id and m.user_id = auth.uid()
  )
);

drop policy if exists "owner exclusively manages private documents" on public.owner_documents;
create policy "owner exclusively manages private documents"
on public.owner_documents for all to authenticated
using (
  owner_user_id = auth.uid()
  and public.is_crew_owner()
)
with check (
  owner_user_id = auth.uid()
  and public.is_crew_owner()
);

drop policy if exists "owner reads own credential submissions" on public.owner_credential_verifications;
create policy "owner reads own credential submissions"
on public.owner_credential_verifications for select to authenticated
using (
  owner_user_id = auth.uid()
  and public.is_crew_owner()
);

drop policy if exists "owner submits unverified credentials" on public.owner_credential_verifications;
create policy "owner submits unverified credentials"
on public.owner_credential_verifications for insert to authenticated
with check (
  owner_user_id = auth.uid()
  and public.is_crew_owner()
  and verification_status = 'pending'
  and verified_by is null
  and verified_at is null
  and verification_method is null
);

create or replace function public.crew_public_metrics()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'status', 'connected',
    'subscriberCount', (
      select count(*) from public.subscriptions
      where status = 'active' and consent_at is not null and unsubscribed_at is null
    ),
    'totalViews', coalesce((
      select sum(view_count) from public.section_daily_aggregates
    ), 0),
    'sectionViews', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'section', section_slug,
          'views', views,
          'updatedAt', updated_at
        )
        order by views desc, section_slug
      )
      from (
        select section_slug, sum(view_count) as views, max(updated_at) as updated_at
        from public.section_daily_aggregates
        group by section_slug
      ) per_section
    ), '[]'::jsonb),
    'generatedAt', now()
  );
$$;

create or replace function public.crew_admin_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_crew_admin() then
    raise exception 'not authorized';
  end if;
  return jsonb_build_object(
    'totalUsers', (select count(*) from public.profiles),
    'subscriberCount', (
      select count(*) from public.subscriptions
      where status = 'active' and consent_at is not null and unsubscribed_at is null
    ),
    'totalViews', coalesce((select sum(view_count) from public.section_daily_aggregates), 0)
  );
end;
$$;

create or replace function public.record_section_view(
  p_section_slug text,
  p_session_id text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash text;
  v_rows integer;
begin
  if p_section_slug !~ '^[a-z0-9][a-z0-9_-]{1,79}$'
     or char_length(p_session_id) not between 16 and 128 then
    raise exception 'invalid view payload';
  end if;
  v_hash := encode(
    digest(current_date::text || ':' || p_session_id, 'sha256'),
    'hex'
  );
  insert into public.section_views (
    section_slug, user_id, session_hash, view_date
  ) values (
    p_section_slug, auth.uid(), v_hash, current_date
  )
  on conflict (section_slug, session_hash, view_date) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 1 then
    insert into public.section_daily_aggregates (
      view_date, section_slug, view_count, unique_sessions, updated_at
    ) values (
      current_date, p_section_slug, 1, 1, now()
    )
    on conflict (view_date, section_slug) do update
    set view_count = public.section_daily_aggregates.view_count + 1,
        unique_sessions = public.section_daily_aggregates.unique_sessions + 1,
        updated_at = now();
    return true;
  end if;
  return false;
end;
$$;

create or replace function public.refresh_section_daily_aggregates(
  p_date date default current_date
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_crew_admin()
     and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'not authorized';
  end if;
  insert into public.section_daily_aggregates (
    view_date, section_slug, view_count, unique_sessions, updated_at
  )
  select
    view_date,
    section_slug,
    count(*)::bigint,
    count(distinct session_hash)::bigint,
    now()
  from public.section_views
  where view_date = p_date
  group by view_date, section_slug
  on conflict (view_date, section_slug) do update
  set view_count = excluded.view_count,
      unique_sessions = excluded.unique_sessions,
      updated_at = excluded.updated_at;
end;
$$;

create or replace function public.submit_manifestation(
  p_category text,
  p_other_category text,
  p_subject text,
  p_body text,
  p_identity_mode text,
  p_consent_to_process boolean,
  p_consent_to_contact boolean default false,
  p_anonymous_access_token text default null,
  p_verified_user_id uuid default null,
  p_verified_email text default null
)
returns table (protocol text, manifestation_id uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_protocol text;
  v_id uuid;
  v_hash text;
  v_email text;
begin
  if p_category not in (
    'agradecimento','sugestao','contribuicao','informacao',
    'notificacao','reclamacao','outra'
  ) then
    raise exception 'invalid category';
  end if;
  if p_category = 'outra' and char_length(trim(coalesce(p_other_category, ''))) < 2 then
    raise exception 'other category required';
  end if;
  if not p_consent_to_process then
    raise exception 'consent required';
  end if;
  if char_length(trim(p_subject)) not between 4 and 140
     or char_length(trim(p_body)) not between 10 and 5000 then
    raise exception 'invalid message';
  end if;
  if p_identity_mode = 'identified' then
    if p_verified_user_id is null then raise exception 'verified identity required'; end if;
    v_user_id := p_verified_user_id;
    v_hash := null;
    v_email := case
      when p_consent_to_contact then nullif(lower(trim(p_verified_email)), '')
      else null
    end;
    if p_consent_to_contact and (
      v_email is null
      or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ) then
      raise exception 'verified email required';
    end if;
  elsif p_identity_mode = 'anonymous' then
    v_user_id := null;
    v_email := null;
    if char_length(coalesce(p_anonymous_access_token, '')) not between 32 and 128 then
      raise exception 'anonymous access token required';
    end if;
    v_hash := encode(digest(p_anonymous_access_token, 'sha256'), 'hex');
  else
    raise exception 'invalid identity mode';
  end if;
  v_protocol := 'AG-' || to_char(current_date, 'YYYY') || '-' ||
    upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 16));
  insert into public.manifestations (
    protocol, user_id, identity_mode, contact_email, category,
    other_category, subject, body, consent_to_process_at,
    consent_to_contact, anonymous_access_hash
  ) values (
    v_protocol, v_user_id, p_identity_mode, v_email, p_category,
    case when p_category = 'outra' then trim(p_other_category) else null end,
    trim(p_subject), trim(p_body), now(),
    case
      when p_identity_mode = 'identified' then coalesce(p_consent_to_contact, false)
      else false
    end,
    v_hash
  )
  returning id into v_id;
  return query select v_protocol, v_id;
end;
$$;

create or replace function public.crew_manifestation_thread(
  p_manifestation_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_manifestation public.manifestations;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select * into v_manifestation
  from public.manifestations
  where id = p_manifestation_id;
  if v_manifestation.id is null
     or (v_manifestation.user_id is distinct from auth.uid() and not public.is_crew_admin()) then
    raise exception 'not authorized';
  end if;
  return jsonb_build_object(
    'manifestation', jsonb_build_object(
      'id', v_manifestation.id,
      'protocol', v_manifestation.protocol,
      'identity_mode', v_manifestation.identity_mode,
      'category', v_manifestation.category,
      'other_category', v_manifestation.other_category,
      'subject', v_manifestation.subject,
      'body', v_manifestation.body,
      'status', v_manifestation.status,
      'created_at', v_manifestation.created_at,
      'updated_at', v_manifestation.updated_at
    ),
    'messages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', mm.id,
          'author_role', mm.author_role,
          'body', mm.body,
          'created_at', mm.created_at
        )
        order by mm.created_at
      )
      from public.manifestation_messages mm
      where mm.manifestation_id = v_manifestation.id
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.crew_anonymous_thread(
  p_protocol text,
  p_access_token text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_manifestation public.manifestations;
begin
  select * into v_manifestation
  from public.manifestations
  where protocol = upper(trim(p_protocol))
    and identity_mode = 'anonymous'
    and anonymous_access_hash = encode(digest(p_access_token, 'sha256'), 'hex');
  if v_manifestation.id is null then raise exception 'not authorized'; end if;
  return jsonb_build_object(
    'manifestation', jsonb_build_object(
      'id', v_manifestation.id,
      'protocol', v_manifestation.protocol,
      'identity_mode', v_manifestation.identity_mode,
      'category', v_manifestation.category,
      'other_category', v_manifestation.other_category,
      'subject', v_manifestation.subject,
      'body', v_manifestation.body,
      'status', v_manifestation.status,
      'created_at', v_manifestation.created_at,
      'updated_at', v_manifestation.updated_at
    ),
    'messages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', mm.id,
          'author_role', mm.author_role,
          'body', mm.body,
          'created_at', mm.created_at
        )
        order by mm.created_at
      )
      from public.manifestation_messages mm
      where mm.manifestation_id = v_manifestation.id
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.reply_manifestation(
  p_manifestation_id uuid,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_manifestation public.manifestations;
  v_admin boolean := public.is_crew_admin();
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if char_length(trim(p_body)) not between 2 and 3000 then raise exception 'invalid reply'; end if;
  select * into v_manifestation from public.manifestations where id = p_manifestation_id;
  if v_manifestation.id is null
     or (v_manifestation.user_id is distinct from auth.uid() and not v_admin) then
    raise exception 'not authorized';
  end if;
  insert into public.manifestation_messages (
    manifestation_id, author_user_id, author_role, body
  ) values (
    v_manifestation.id, auth.uid(), case when v_admin then 'admin' else 'crew' end, trim(p_body)
  );
  update public.manifestations
  set status = case when v_admin then 'responded' else 'waiting_crew' end
  where id = v_manifestation.id;
end;
$$;

create or replace function public.reply_anonymous_manifestation(
  p_protocol text,
  p_access_token text,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if char_length(trim(p_body)) not between 2 and 3000 then raise exception 'invalid reply'; end if;
  select id into v_id
  from public.manifestations
  where protocol = upper(trim(p_protocol))
    and identity_mode = 'anonymous'
    and anonymous_access_hash = encode(digest(p_access_token, 'sha256'), 'hex');
  if v_id is null then raise exception 'not authorized'; end if;
  insert into public.manifestation_messages (
    manifestation_id, author_user_id, author_role, body
  ) values (v_id, null, 'crew', trim(p_body));
  update public.manifestations set status = 'waiting_crew' where id = v_id;
end;
$$;

create or replace function public.unsubscribe_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_rows integer;
begin
  update public.subscriptions
  set status = 'unsubscribed', unsubscribed_at = now()
  where unsubscribe_token = p_token
    and status = 'active';
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

create or replace function public.crew_public_profiles()
returns table (
  id uuid,
  display_name text,
  occupation text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.id, p.display_name, p.occupation, p.created_at
  from public.profiles p
  where p.public_profile is true
    and p.display_name is not null
  order by p.created_at desc
  limit 200;
$$;

revoke all on public.admin_users from anon, authenticated;
revoke all on public.profiles from anon;
revoke all on public.subscriptions from anon;
revoke all on public.section_views from anon, authenticated;
revoke all on public.manifestations from anon, authenticated;
revoke all on public.manifestation_messages from anon, authenticated;
revoke all on public.owner_documents from anon, authenticated;
revoke all on public.owner_credential_verifications from anon, authenticated;

grant select on public.admin_users to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.subscriptions to authenticated;
grant select on public.section_views to authenticated;
grant select on public.section_daily_aggregates to anon, authenticated;
grant select, update on public.manifestations to authenticated;
grant select on public.manifestation_messages to authenticated;
grant select, insert, update, delete on public.owner_documents to authenticated;
grant select, insert on public.owner_credential_verifications to authenticated;
grant select, update on public.owner_credential_verifications to service_role;

revoke all on function public.crew_set_updated_at() from public;
revoke all on function public.crew_handle_new_user() from public;
revoke all on function public.is_crew_admin() from public;
revoke all on function public.is_crew_owner() from public;
revoke all on function public.crew_admin_metrics() from public, anon;
revoke all on function public.crew_public_metrics() from public;
revoke all on function public.record_section_view(text, text) from public;
revoke all on function public.refresh_section_daily_aggregates(date) from public;
revoke all on function public.submit_manifestation(
  text,text,text,text,text,boolean,boolean,text,uuid,text
) from public;
revoke all on function public.crew_manifestation_thread(uuid) from public;
revoke all on function public.crew_anonymous_thread(text, text) from public;
revoke all on function public.reply_manifestation(uuid, text) from public;
revoke all on function public.reply_anonymous_manifestation(text, text, text) from public;
revoke all on function public.unsubscribe_newsletter(uuid) from public;
revoke all on function public.crew_public_profiles() from public;

grant execute on function public.is_crew_admin() to authenticated;
grant execute on function public.is_crew_owner() to authenticated;
grant execute on function public.crew_admin_metrics() to authenticated;
grant execute on function public.crew_public_metrics() to anon, authenticated;
grant execute on function public.record_section_view(text, text) to service_role;
grant execute on function public.refresh_section_daily_aggregates(date) to authenticated;
grant execute on function public.submit_manifestation(
  text,text,text,text,text,boolean,boolean,text,uuid,text
) to service_role;
grant execute on function public.crew_manifestation_thread(uuid) to authenticated;
grant execute on function public.crew_anonymous_thread(text, text) to service_role;
grant execute on function public.reply_manifestation(uuid, text) to authenticated;
grant execute on function public.reply_anonymous_manifestation(text, text, text) to service_role;
grant execute on function public.unsubscribe_newsletter(uuid) to anon, authenticated;

comment on table public.profiles is
  'Perfil privado por padrão; public_profile é opt-in, mas o RPC público permanece revogado até ativação explícita.';
comment on table public.subscriptions is
  'Assinaturas consentidas. unsubscribe_token é credencial de cancelamento e nunca deve ser registrada em logs.';
comment on table public.section_views is
  'Telemetria mínima sem IP. A produção deve limitar taxa e validar origem em Edge Function/WAF.';
comment on table public.manifestations is
  'Canal de escuta. Navegadores não recebem INSERT anônimo nem SELECT direto; o gateway usa protocolo + chave secreta.';
comment on table public.owner_documents is
  'Caderno privado do owner. publish-approved continua privado e exige referência de workflow editorial.';
comment on table public.owner_credential_verifications is
  'Fila separada de credenciais. O owner submete como pending e não pode se autoverificar.';

commit;

-- PRIMEIRO ADMINISTRADOR (ação manual e auditável, execute uma vez como owner):
-- insert into public.admin_users (user_id, role, reason)
-- values ('UUID-DO-USUARIO-AUTH', 'owner', 'Responsável inicial da missão');
