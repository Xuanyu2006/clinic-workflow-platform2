-- Med Base multi-tenant organization onboarding
-- Run after 001_medbase_foundation.sql and 002_operational_hardening.sql.
-- This keeps separate companies in separate organization workspaces.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
  requested_org_name text;
  assigned_organization_id uuid;
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

  requested_org_name := nullif(
    trim(coalesce(new.raw_user_meta_data ->> 'organization_name', '')),
    ''
  );

  if requested_org_name is null then
    requested_org_name := coalesce(
      nullif(split_part(coalesce(new.email, ''), '@', 2), ''),
      'Med Base'
    ) || ' Workspace';
  end if;

  insert into public.organizations (name)
  values (requested_org_name)
  returning id into assigned_organization_id;

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
    assigned_organization_id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role,
    nullif(new.raw_user_meta_data ->> 'department', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = now();

  insert into public.organization_departments (organization_id, name)
  values
    (assigned_organization_id, 'Administration'),
    (assigned_organization_id, 'Front Desk'),
    (assigned_organization_id, 'Clinical'),
    (assigned_organization_id, 'Scheduling'),
    (assigned_organization_id, 'Therapy'),
    (assigned_organization_id, 'Operations')
  on conflict (organization_id, name) do nothing;

  insert into public.user_settings (user_id, organization_id)
  values (new.id, assigned_organization_id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop policy if exists "organizations_insert_authenticated" on public.organizations;
drop policy if exists "organizations_insert_admin_only" on public.organizations;

create policy "organizations_insert_admin_only"
on public.organizations
for insert
to authenticated
with check (public.can_manage_settings());
