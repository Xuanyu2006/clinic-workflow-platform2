# Database

Use this folder for Supabase schema notes, generated types, migrations, seed files, and Row Level Security policy documentation.

## Migrations

Run these files in the Supabase SQL Editor after creating the Supabase project:

1. `001_medbase_foundation.sql`
2. `002_operational_hardening.sql`
3. `003_multi_tenant_organizations.sql`

The first migration creates the Med Base preview organization, auth profile trigger,
workflow tables, and row-level security policies for organization-scoped access.

The second migration adds operational persistence tables, audit logs, notification
outbox, error events, departments, user settings, and role-aware write policies.

The third migration changes new-account onboarding so each newly registered
company receives its own organization workspace, with Supabase row-level security
keeping company data separated.

Do not store real patient data until privacy, security, legal, and compliance review is complete.
