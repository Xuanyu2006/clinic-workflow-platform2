# Med Base Operations Runbook

## Deployment

1. Push `main` to GitHub.
2. Confirm Vercel production deployment succeeds.
3. Confirm Supabase environment variables are present in Vercel production.
4. Test login, create account, messages, tasks, communication boards, analytics,
   and settings with fake data only.

## Database Changes

Run migrations in Supabase SQL Editor in order:

1. `database/001_medbase_foundation.sql`
2. `database/002_operational_hardening.sql`

## Monitoring

The `error_events` table is available for internal error capture. Before real
production use, connect an approved monitoring vendor with a signed BAA if any
regulated data could enter logs.

## Notifications

The `notification_outbox` table stores draft notification jobs. No real email or
SMS provider is connected yet. Before connecting one, complete vendor review,
BAA review, opt-in/consent design, and message content review.

## Backups

Before launch with real organizations:

- Enable Supabase backup retention appropriate for the plan.
- Document restore steps.
- Test restore into a non-production project.
- Review RLS policies after restore.

## Incident Response

Before clinical production:

- Assign incident owners.
- Create severity levels.
- Document notification timelines.
- Keep audit logs immutable or export them to approved storage.
