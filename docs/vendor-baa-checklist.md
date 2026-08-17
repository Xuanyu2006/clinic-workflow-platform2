# Vendor And BAA Checklist

Do not process real patient data until each vendor is reviewed and approved.

## Required Vendor Review

- Hosting provider
- Database provider
- Email provider
- SMS provider
- Error monitoring provider
- Analytics provider
- Support/helpdesk tools
- File storage provider

## BAA Required When Vendor Handles PHI

For each vendor, confirm:

- Whether the vendor is willing to sign a BAA.
- Whether the selected plan supports regulated healthcare workloads.
- Where data is stored and processed.
- Whether logs may contain sensitive data.
- Retention and deletion controls.
- Access controls and audit logs.
- Breach notification commitments.

## Current Integration Status

- Vercel: hosting configured for prototype deployment.
- Supabase: auth/database foundation configured.
- Email/SMS: notification outbox table exists, but no provider is connected.
- Monitoring: error event table exists, but no external monitoring provider is connected.
- Backups: documented as required; restore testing is not completed.
