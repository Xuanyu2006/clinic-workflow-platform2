-- Apply once after 001–003, in a transaction. Existing conversations keep their
-- creator; an organization administrator can add intended members explicitly.
begin;

-- A profile cannot grant itself a role or move to another organization.
drop policy if exists profiles_insert_self on public.user_profiles;
drop policy if exists profiles_update_self_or_admin on public.user_profiles;
revoke insert, update on public.user_profiles from authenticated;
grant update (full_name) on public.user_profiles to authenticated;
create policy profiles_update_name on public.user_profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists organizations_update_admin on public.organizations;
create policy organizations_update_admin on public.organizations for update to authenticated
using (public.is_same_org(id) and public.can_manage_settings())
with check (public.is_same_org(id) and public.can_manage_settings());

create table public.workspace_invites (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 email text not null, role public.app_role not null, department text,
 token_hash text not null unique, expires_at timestamptz not null default now() + interval '7 days',
 accepted_at timestamptz, created_by uuid not null references public.user_profiles(id),
 created_at timestamptz not null default now()
);
alter table public.workspace_invites enable row level security;
create policy invites_admin_read on public.workspace_invites for select to authenticated
using (public.is_same_org(organization_id) and public.can_manage_settings());

create function public.create_workspace_invite(invite_email text, invite_role public.app_role, invite_department text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare token text := encode(gen_random_bytes(32), 'hex');
begin
 if auth.uid() is null or not coalesce(public.can_manage_settings(), false) then raise exception 'Administrator access required'; end if;
 if invite_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email'; end if;
 insert into public.workspace_invites(organization_id,email,role,department,token_hash,created_by)
 values(public.current_user_organization_id(),lower(trim(invite_email)),invite_role,invite_department,encode(digest(token,'sha256'),'hex'),auth.uid());
 return token;
end $$;
revoke all on function public.create_workspace_invite(text,public.app_role,text) from public;
grant execute on function public.create_workspace_invite(text,public.app_role,text) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare org_id uuid; assigned_role public.app_role := 'Administrator'; invite public.workspace_invites%rowtype; invite_token text;
begin
 invite_token := nullif(new.raw_user_meta_data->>'invite_token','');
 if invite_token is not null then
   select * into invite from public.workspace_invites where token_hash=encode(digest(invite_token,'sha256'),'hex') and lower(email)=lower(new.email) and accepted_at is null and expires_at>now() for update;
   if not found then raise exception 'Invitation is invalid, expired, or intended for another email'; end if;
   org_id := invite.organization_id; assigned_role := invite.role;
   update public.workspace_invites set accepted_at=now() where id=invite.id;
 else
   insert into public.organizations(name) values(coalesce(nullif(trim(new.raw_user_meta_data->>'organization_name'),''),'New workspace')) returning id into org_id;
 end if;
 insert into public.user_profiles(id,organization_id,email,role,department) values(new.id,org_id,coalesce(new.email,''),assigned_role,invite.department);
 insert into public.user_settings(user_id,organization_id) values(new.id,org_id);
 if invite_token is null then
   insert into public.organization_departments(organization_id,name) select org_id,unnest(array['Administration','Front Desk','Clinical','Scheduling','Therapy','Operations']);
 end if;
 return new;
end $$;

-- Trusted functions avoid recursive RLS while checking tenant and membership.
create function public.is_chat_member(chat_id uuid) returns boolean language sql stable security definer set search_path=public,extensions as $$
 select exists(select 1 from public.conversation_members m join public.conversations c on c.id=m.conversation_id where m.conversation_id=chat_id and m.user_id=auth.uid() and public.is_same_org(c.organization_id))
$$;
revoke all on function public.is_chat_member(uuid) from public;
grant execute on function public.is_chat_member(uuid) to authenticated;

insert into public.conversation_members(conversation_id,user_id)
select c.id,c.created_by from public.conversations c join public.user_profiles p on p.id=c.created_by and p.organization_id=c.organization_id
on conflict do nothing;

-- Membership is modified only by these validated functions.
drop policy if exists conversation_members_same_org_select on public.conversation_members;
drop policy if exists conversation_members_same_org_write on public.conversation_members;
create policy members_read on public.conversation_members for select to authenticated using(public.is_chat_member(conversation_id));
drop policy if exists conversations_same_org_select on public.conversations;
drop policy if exists conversations_same_org_write on public.conversations;
create policy conversations_member_read on public.conversations for select to authenticated using(public.is_chat_member(id));
drop policy if exists messages_same_org_select on public.messages;
drop policy if exists messages_same_org_write on public.messages;
create policy messages_member_read on public.messages for select to authenticated using(public.is_same_org(organization_id) and public.is_chat_member(conversation_id));
create policy messages_member_insert on public.messages for insert to authenticated
with check(author_id=auth.uid() and public.is_same_org(organization_id) and public.is_chat_member(conversation_id) and exists(select 1 from public.conversations c where c.id=conversation_id and c.organization_id=messages.organization_id));

create function public.add_conversation_member(chat_id uuid, member_email text) returns void language plpgsql security definer set search_path=public,extensions as $$
declare member_id uuid; org_id uuid; owner_id uuid;
begin
 select organization_id,created_by into org_id,owner_id from public.conversations where id=chat_id;
 if auth.uid() is null or not coalesce(public.is_same_org(org_id), false) or not(coalesce(owner_id=auth.uid(),false) or coalesce(public.can_manage_settings(),false)) then raise exception 'Conversation owner or administrator access required'; end if;
 select id into member_id from public.user_profiles where organization_id=org_id and lower(email)=lower(member_email);
 if member_id is null then raise exception 'Member must belong to this workspace'; end if;
 insert into public.conversation_members(conversation_id,user_id) values(chat_id,member_id) on conflict do nothing;
end $$;
revoke all on function public.add_conversation_member(uuid,text) from public;
grant execute on function public.add_conversation_member(uuid,text) to authenticated;

create function public.create_team_conversation(chat_name text, member_emails text[]) returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare chat_id uuid; member_email text; org_id uuid := public.current_user_organization_id();
begin
 if auth.uid() is null or org_id is null then raise exception 'Sign in to your workspace'; end if;
 if length(trim(chat_name))=0 or length(chat_name)>150 then raise exception 'Enter a group name under 150 characters'; end if;
 insert into public.conversations(organization_id,name,created_by) values(org_id,trim(chat_name),auth.uid()) returning id into chat_id;
 insert into public.conversation_members(conversation_id,user_id) values(chat_id,auth.uid());
 foreach member_email in array member_emails loop perform public.add_conversation_member(chat_id,member_email); end loop;
 return chat_id;
end $$;
revoke all on function public.create_team_conversation(text,text[]) from public;
grant execute on function public.create_team_conversation(text,text[]) to authenticated;

-- Audit records cannot be forged by browser clients and share the write transaction.
drop policy if exists audit_logs_same_org_insert on public.audit_logs;
create function public.audit_workspace_change() returns trigger language plpgsql security definer set search_path=public,extensions as $$
declare row_data jsonb;
begin
 if TG_OP='DELETE' then row_data:=to_jsonb(old); else row_data:=to_jsonb(new); end if;
 insert into public.audit_logs(organization_id,actor_id,action,resource_type,resource_id)
 values((row_data->>'organization_id')::uuid,auth.uid(),lower(TG_OP),TG_TABLE_NAME,(row_data->>'id')::uuid);
 if TG_OP='DELETE' then return old; else return new; end if;
end $$;
do $$ declare t text; begin
 foreach t in array array['tasks','schedule_events','conversations','messages','organization_departments','communication_posts','workspace_invites'] loop
 execute format('create trigger audit_changes after insert or update or delete on public.%I for each row execute function public.audit_workspace_change()',t);
 end loop;
end $$;

-- AI drafts may only reference conversations the caller can read.
drop policy if exists ai_summary_drafts_same_org_select on public.ai_summary_drafts;
drop policy if exists ai_summary_drafts_same_org_write on public.ai_summary_drafts;
create policy summary_member_read on public.ai_summary_drafts for select to authenticated using(public.is_same_org(organization_id) and public.is_chat_member(conversation_id));
create policy summary_member_insert on public.ai_summary_drafts for insert to authenticated with check(public.is_same_org(organization_id) and public.is_chat_member(conversation_id));
commit;
