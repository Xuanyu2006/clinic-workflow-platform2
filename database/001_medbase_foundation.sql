-- Med Base Supabase foundation
-- Run this in the Supabase SQL editor before enabling real testing accounts.
-- Do not store real patient data until legal/compliance review is complete.

create extension if not exists pgcrypto;

create type public.app_role as enum (
  'Administrator',
  'Physician',
  'Nurse',
  'Medical Assistant',
  'Front Desk',
  'Office Manager',
  'Scheduler',
  'Therapist',
  'Patient Coordinator',
  'Referral Coordinator',
  'Care Coordinator',
  'SNF Coordinator',
  'Records Coordinator',
  'Operations Lead',
  'Receptionist'
);

create type public.task_status as enum (
  'Draft',
  'Pending Approval',
  'Approved',
  'In Progress',
  'Completed',
  'Cancelled',
  'Overdue'
);

create type public.task_priority as enum ('Low', 'Medium', 'High');
create type public.schedule_event_type as enum ('Clinic', 'SNF', 'Staff Shift', 'Admin');
create type public.chat_type as enum ('Direct', 'Group');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  email text not null,
  full_name text,
  role public.app_role not null default 'Front Desk',
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  appointment_time timestamptz not null,
  provider_name text,
  department text,
  status text not null default 'Scheduled',
  reminder_status text not null default 'Not queued',
  forms_status text not null default 'Not sent',
  insurance_status text not null default 'Not checked',
  notes text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null default '',
  assigned_staff text,
  department text,
  priority public.task_priority not null default 'Medium',
  due_at timestamptz,
  status public.task_status not null default 'Draft',
  notes text not null default '',
  completion_timestamp timestamptz,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  owner text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  event_type public.schedule_event_type not null default 'Clinic',
  location text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  chat_type public.chat_type not null default 'Group',
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid references public.user_profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.ai_summary_drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  summary text not null,
  suggested_action text,
  suggested_priority public.task_priority,
  suggested_role public.app_role,
  suggested_due_at timestamptz,
  reviewed_by uuid references public.user_profiles(id) on delete set null,
  approved_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger set_schedule_events_updated_at
before update on public.schedule_events
for each row execute function public.set_updated_at();

create trigger set_conversations_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  begin
    requested_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::public.app_role,
      'Front Desk'::public.app_role
    );
  exception
    when others then
      requested_role := 'Front Desk'::public.app_role;
  end;

  insert into public.user_profiles (
    id,
    organization_id,
    email,
    full_name,
    role,
    department
  )
  values (
    new.id,
    '00000000-0000-0000-0000-000000000001',
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role,
    nullif(new.raw_user_meta_data ->> 'department', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = excluded.role,
    department = excluded.department,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.user_profiles
  where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where id = auth.uid()
$$;

create or replace function public.is_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('Administrator', 'Office Manager', 'Operations Lead')
$$;

create or replace function public.is_same_org(row_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select row_organization_id = public.current_user_organization_id()
$$;

alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.tasks enable row level security;
alter table public.schedule_events enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.ai_summary_drafts enable row level security;

create policy "profiles_select_same_org_or_self"
on public.user_profiles for select
to authenticated
using (id = auth.uid() or public.is_same_org(organization_id));

create policy "profiles_insert_self"
on public.user_profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_self_or_admin"
on public.user_profiles for update
to authenticated
using (id = auth.uid() or public.is_admin_role())
with check (id = auth.uid() or public.is_admin_role());

create policy "organizations_select_own"
on public.organizations for select
to authenticated
using (id = public.current_user_organization_id());

create policy "organizations_insert_authenticated"
on public.organizations for insert
to authenticated
with check (true);

create policy "organizations_update_admin"
on public.organizations for update
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

create policy "appointments_same_org_select"
on public.appointments for select
to authenticated
using (public.is_same_org(organization_id));

create policy "appointments_same_org_write"
on public.appointments for all
to authenticated
using (public.is_same_org(organization_id))
with check (public.is_same_org(organization_id));

create policy "tasks_same_org_select"
on public.tasks for select
to authenticated
using (public.is_same_org(organization_id));

create policy "tasks_same_org_write"
on public.tasks for all
to authenticated
using (public.is_same_org(organization_id))
with check (public.is_same_org(organization_id));

create policy "schedule_events_same_org_select"
on public.schedule_events for select
to authenticated
using (public.is_same_org(organization_id));

create policy "schedule_events_same_org_write"
on public.schedule_events for all
to authenticated
using (public.is_same_org(organization_id))
with check (public.is_same_org(organization_id));

create policy "conversations_same_org_select"
on public.conversations for select
to authenticated
using (public.is_same_org(organization_id));

create policy "conversations_same_org_write"
on public.conversations for all
to authenticated
using (public.is_same_org(organization_id))
with check (public.is_same_org(organization_id));

create policy "conversation_members_same_org_select"
on public.conversation_members for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and public.is_same_org(c.organization_id)
  )
);

create policy "conversation_members_same_org_write"
on public.conversation_members for all
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and public.is_same_org(c.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and public.is_same_org(c.organization_id)
  )
);

create policy "messages_same_org_select"
on public.messages for select
to authenticated
using (public.is_same_org(organization_id));

create policy "messages_same_org_write"
on public.messages for all
to authenticated
using (public.is_same_org(organization_id))
with check (public.is_same_org(organization_id));

create policy "ai_summary_drafts_same_org_select"
on public.ai_summary_drafts for select
to authenticated
using (public.is_same_org(organization_id));

create policy "ai_summary_drafts_same_org_write"
on public.ai_summary_drafts for all
to authenticated
using (public.is_same_org(organization_id))
with check (public.is_same_org(organization_id));

insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Med Base Preview Organization')
on conflict (id) do nothing;
