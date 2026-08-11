# Database

Use this folder for Supabase schema notes, generated types, migrations, seed files, and Row Level Security policy documentation.

## Foundation Migration

Run `001_medbase_foundation.sql` in the Supabase SQL Editor after creating the Supabase project.

The migration creates the Med Base preview organization, auth profile trigger, workflow tables, and row-level security policies for organization-scoped access.

Do not store real patient data until privacy, security, legal, and compliance review is complete.
