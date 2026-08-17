-- Med Base operational hardening
-- Run after 001_medbase_foundation.sql.
-- Do not store real patient data until legal/compliance review, vendor BAAs,
-- monitoring, incident response, and security policies are approved.

create table if not exists public.organization_departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.user_profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.communication_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  board_key text not null check (board_key in ('announcements', 'shiftNotes', 'dailyReminders')),
  body text not null,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  recipient text not null,
  subject text,
  body text not null,
  status text not null default 'Draft',
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.error_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references public.user_profiles(id) on delete set null,
  source text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

alter table public.organization_departments enable row level security;
alter table public.user_settings enable row level security;
alter table public.communication_posts enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.audit_logs enable row level security;
alter table public.error_events enable row level security;

create or replace function public.can_manage_settings()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('Administrator', 'Office Manager', 'Operations Lead')
$$;

create or replace function public.can_manage_scheduling()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in (
    'Administrator',
    'Office Manager',
    'Operations Lead',
    'Scheduler',
    'Front Desk',
    'Receptionist',
    'SNF Coordinator'
  )
$$;

create or replace function public.can_manage_tasks()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in (
    'Administrator',
    'Office Manager',
    'Operations Lead',
    'Physician',
    'Nurse',
    'Medical Assistant',
    'Scheduler',
    'Therapist',
    'Patient Coordinator',
    'Referral Coordinator',
    'Care Coordinator',
    'SNF Coordinator',
    'Records Coordinator',
    'Front Desk',
    'Receptionist'
  )
$$;

drop policy if exists "tasks_same_org_write" on public.tasks;
create policy "tasks_role_write"
on public.tasks for all
to authenticated
using (public.is_same_org(organization_id) and public.can_manage_tasks())
with check (public.is_same_org(organization_id) and public.can_manage_tasks());

drop policy if exists "schedule_events_same_org_write" on public.schedule_events;
create policy "schedule_events_role_write"
on public.schedule_events for all
to authenticated
using (public.is_same_org(organization_id) and public.can_manage_scheduling())
with check (public.is_same_org(organization_id) and public.can_manage_scheduling());

create policy "departments_same_org_select"
on public.organization_departments for select
to authenticated
using (public.is_same_org(organization_id));

create policy "departments_admin_write"
on public.organization_departments for all
to authenticated
using (public.is_same_org(organization_id) and public.can_manage_settings())
with check (public.is_same_org(organization_id) and public.can_manage_settings());

create policy "user_settings_self_select"
on public.user_settings for select
to authenticated
using (user_id = auth.uid());

create policy "user_settings_self_write"
on public.user_settings for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "communication_posts_same_org_select"
on public.communication_posts for select
to authenticated
using (public.is_same_org(organization_id));

create policy "communication_posts_same_org_write"
on public.communication_posts for all
to authenticated
using (public.is_same_org(organization_id))
with check (public.is_same_org(organization_id));

create policy "notification_outbox_admin_select"
on public.notification_outbox for select
to authenticated
using (public.is_same_org(organization_id) and public.can_manage_settings());

create policy "notification_outbox_admin_write"
on public.notification_outbox for all
to authenticated
using (public.is_same_org(organization_id) and public.can_manage_settings())
with check (public.is_same_org(organization_id) and public.can_manage_settings());

create policy "audit_logs_admin_select"
on public.audit_logs for select
to authenticated
using (public.is_same_org(organization_id) and public.can_manage_settings());

create policy "audit_logs_same_org_insert"
on public.audit_logs for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

create policy "error_events_admin_select"
on public.error_events for select
to authenticated
using (public.is_same_org(organization_id) and public.can_manage_settings());

create policy "error_events_same_org_insert"
on public.error_events for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

insert into public.organization_departments (organization_id, name)
values
  ('00000000-0000-0000-0000-000000000001', 'Front Desk'),
  ('00000000-0000-0000-0000-000000000001', 'Clinical Operations'),
  ('00000000-0000-0000-0000-000000000001', 'Scheduling'),
  ('00000000-0000-0000-0000-000000000001', 'Therapy'),
  ('00000000-0000-0000-0000-000000000001', 'SNF Coordination'),
  ('00000000-0000-0000-0000-000000000001', 'Care Coordination'),
  ('00000000-0000-0000-0000-000000000001', 'Referrals'),
  ('00000000-0000-0000-0000-000000000001', 'Records'),
  ('00000000-0000-0000-0000-000000000001', 'Administration')
on conflict (organization_id, name) do nothing;
