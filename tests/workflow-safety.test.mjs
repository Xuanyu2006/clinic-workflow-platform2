import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const dashboard = readFileSync("components/clinic-workflow-dashboard.tsx", "utf8");
const hardeningSql = readFileSync("database/002_operational_hardening.sql", "utf8");
const tenancySql = readFileSync("database/003_multi_tenant_organizations.sql", "utf8");

test("signup password policy requires letters numbers and special characters", () => {
  assert.match(dashboard, /function isStrongPassword/);
  assert.match(dashboard, /\/\[A-Za-z\]\//);
  assert.match(dashboard, /\/\\d\//);
  assert.match(dashboard, /\/\[\^A-Za-z0-9\]\//);
});

test("workspace no longer ships random staff placeholders", () => {
  for (const name of [
    "Dr. Priya Foster",
    "Lena Ortiz",
    "Marcus Reid",
    "Sofia Patel",
    "Jordan Avery",
    "Maya Chen",
  ]) {
    assert.doesNotMatch(dashboard, new RegExp(name));
  }
});

test("operational hardening migration includes persistence and audit tables", () => {
  for (const tableName of [
    "organization_departments",
    "user_settings",
    "communication_posts",
    "notification_outbox",
    "audit_logs",
    "error_events",
  ]) {
    assert.match(hardeningSql, new RegExp(`create table if not exists public\\.${tableName}`));
  }
});

test("role-aware database policies are present for writable workflows", () => {
  assert.match(hardeningSql, /can_manage_settings/);
  assert.match(hardeningSql, /can_manage_scheduling/);
  assert.match(hardeningSql, /can_manage_tasks/);
  assert.match(hardeningSql, /tasks_role_write/);
  assert.match(hardeningSql, /schedule_events_role_write/);
});

test("new account signup creates an organization-scoped workspace", () => {
  const signUpStart = dashboard.indexOf("supabase.auth.signUp({");
  const signUpCall = dashboard.slice(signUpStart, dashboard.indexOf("});", signUpStart));

  assert.match(dashboard, /organizationName/);
  assert.match(dashboard, /organization_name: authForm\.organizationName\.trim\(\)/);
  assert.doesNotMatch(signUpCall, /organization_id:\s*previewOrganizationId/);
  assert.match(tenancySql, /new\.raw_user_meta_data ->> 'organization_name'/);
  assert.match(tenancySql, /insert into public\.organizations \(name\)/);
  assert.match(tenancySql, /assigned_organization_id/);
});
